import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { JarvisState, ChatApiRequest, ChatApiResponse, DailyBriefingData } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'jarvis_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock state aligned with the User Manual
const DEFAULT_STATE: JarvisState = {
  personality: {
    humorLevel: 45,
    formality: 'balanced',
    voiceProfile: 'classic-jarvis',
    wakePhraseEnabled: true,
    skills: {
      smartHome: true,
      calendarScheduling: true,
      musicControl: true,
      trafficBriefing: true,
      dailySummary: true
    }
  },
  privacy: {
    micEnabled: true,
    localProcessingOnly: false,
    dataSharingEnabled: false,
    encryptionStatus: true,
    ratingsHistory: []
  },
  devices: [
    { id: 'dev-1', name: 'Living Room Lights', type: 'light', room: 'Living Room', status: true, value: 80, color: '#ffb703' },
    { id: 'dev-2', name: 'Workspace Downlights', type: 'light', room: 'Office', status: true, value: 100, color: '#ffffff' },
    { id: 'dev-3', name: 'Main Climate Nest', type: 'thermostat', room: 'Hallway', status: true, value: 71 },
    { id: 'dev-4', name: 'Front Entrance Deadbolt', type: 'lock', room: 'Entrance', status: true },
    { id: 'dev-5', name: 'Home Perimeter Defense', type: 'security', room: 'Whole House', status: true }
  ],
  tasks: [
    { id: 'task-1', title: 'Review quarterly AI research paper', priority: 'high', dueDate: 'Today, 4:00 PM', completed: false, category: 'Work' },
    { id: 'task-2', title: 'Schedule weekly synced backup for smart home sensors', priority: 'medium', dueDate: 'Tomorrow', completed: false, category: 'System' },
    { id: 'task-3', title: 'Pick up organic roast coffee beans', priority: 'low', dueDate: 'Friday', completed: true, category: 'Personal' }
  ],
  events: [
    { id: 'evt-1', title: 'Project Archangel Synchronization', time: '10:00 AM - 11:00 AM', date: 'Today', location: 'Virtual Suite 4', attendees: ['Tony S.', 'Dr. Banner'] },
    { id: 'evt-2', title: 'Security Perimeter Calibration', time: '02:30 PM - 03:00 PM', date: 'Today', location: 'Server Facility Alpha' },
    { id: 'evt-3', title: 'Dinner with Pepper Potts', time: '07:30 PM - 09:30 PM', date: 'Tonight', location: 'Stark Tower Rooftop' }
  ],
  reminders: [
    { id: 'rem-1', title: 'Take hydration break & review thermal telemetry', time: 'Every 2 hours', locationBased: false, completed: false },
    { id: 'rem-2', title: 'Call Bruce when reaching the laboratory', locationBased: true, locationName: 'Bio Lab Complex', completed: false },
    { id: 'rem-3', title: 'Arm perimeter security sensors before nightfall', time: '08:00 PM', locationBased: false, completed: false }
  ],
  conversationMemory: [
    'User prefers room temperature around 71°F.',
    'User likes concise updates with occasional dry British wit.',
    'User prioritizes strict end-to-end data encryption and local processing when possible.'
  ]
};

function readState(): JarvisState {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      fs.writeFileSync(STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
      return DEFAULT_STATE;
    }
    const data = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading Jarvis state:', err);
    return DEFAULT_STATE;
  }
}

function writeState(state: JarvisState) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Error writing Jarvis state:', err);
  }
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    version: '2.5.0-JARVIS',
    encryption: 'AES-256-GCM',
    timestamp: new Date().toISOString()
  });
});

// GET current Jarvis state
app.get('/api/state', (_req, res) => {
  const state = readState();
  res.json(state);
});

// POST update full or partial state
app.post('/api/state', (req, res) => {
  const currentState = readState();
  const newState: JarvisState = {
    ...currentState,
    ...req.body
  };
  writeState(newState);
  res.json({ success: true, state: newState });
});

// GET computed daily briefing
app.get('/api/briefing', (_req, res) => {
  const state = readState();
  const briefing: DailyBriefingData = {
    greeting: 'Good morning, Sir. All primary systems are nominal.',
    weather: {
      temp: 68,
      condition: 'Partly Sunny with light coastal breeze',
      high: 73,
      low: 58,
      city: 'Malibu, CA'
    },
    traffic: {
      route: 'Pacific Coast Highway to Stark HQ',
      commuteTimeMin: 24,
      delayMin: 6,
      alert: 'Minor slowdown near Santa Monica tunnel due to maintenance.',
      alternateRoute: 'Via Canyon Pass (saves 4 mins)'
    },
    schedule: state.events,
    headlines: [
      'Next-generation clean fusion reactor tests conclude with 114% target yield.',
      'Global renewable energy microgrid adoption increases by 18% YoY.',
      'Autonomous orbital atmospheric sensors report record clarity over the Pacific.'
    ],
    contextualReminder: state.reminders.find(r => !r.completed)?.title || 'Check schedule calendar.'
  };
  res.json(briefing);
});

// Chat endpoint with Gemini AI integration
app.post('/api/chat', async (req, res) => {
  const { message, history, state }: ChatApiRequest = req.body;
  const currentState = state || readState();

  const apiKey = process.env.GEMINI_API_KEY;

  const systemInstruction = `
You are JARVIS (Just A Rather Very Intelligent System), an advanced, proactive, context-aware virtual assistant inspired by modern AI and the Iron Man ethos.
Tone & Persona:
- Professional, loyal, polite, eloquent, and subtly witty (British butler style demeanor, yet warm and deeply empathetic).
- Address the user respectfully (e.g. "Sir" or as appropriate).
- You assist with scheduling, smart home control, reminders, task tracking, traffic insights, and general inquiries.

Current System State:
- Devices: ${JSON.stringify(currentState.devices.map(d => ({ id: d.id, name: d.name, type: d.type, status: d.status, value: d.value })))}
- Tasks: ${JSON.stringify(currentState.tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, completed: t.completed })))}
- Calendar: ${JSON.stringify(currentState.events.map(e => ({ title: e.title, time: e.time, date: e.date })))}
- Personality Settings: Humor ${currentState.personality.humorLevel}%, Formality ${currentState.personality.formality}.
- Learned Memory: ${currentState.conversationMemory.join('; ')}

Capabilities & Action Calling:
If the user's command asks to control devices (lights, thermostat, security, locks), add a task, schedule an event, or set a reminder, acknowledge the action in your conversational response, AND provide a machine-readable JSON block at the very end of your response inside triple backticks with tag \`\`\`json-action
{
  "action": "device_update" | "task_added" | "event_added" | "reminder_added" | "briefing_requested" | "none",
  "payload": { ... }
}
\`\`\`
Examples:
For device update:
\`\`\`json-action
{ "action": "device_update", "payload": { "id": "dev-1", "status": false } }
\`\`\`
For task:
\`\`\`json-action
{ "action": "task_added", "payload": { "title": "Buy groceries", "priority": "medium" } }
\`\`\`
For reminder:
\`\`\`json-action
{ "action": "reminder_added", "payload": { "title": "Call Bruce", "locationBased": true, "locationName": "Bio Lab" } }
\`\`\`

If no action is needed, do not include the action block or set action to "none". Keep answers concise, clear, and characterful.
`;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || currentState.privacy.localProcessingOnly) {
    // Offline / Local Rule-based fallback engine
    const lower = (message || '').toLowerCase();
    let reply = `Certainly, Sir. I am operating in local offline secure mode.`;
    let actionTaken: any = undefined;
    let updatedState: Partial<JarvisState> | undefined = undefined;

    if (lower.includes('light') && (lower.includes('off') || lower.includes('turn off'))) {
      const updatedDevices = currentState.devices.map(d => d.type === 'light' ? { ...d, status: false } : d);
      reply = "Right away, Sir. I have powered down the lighting units across the suite.";
      actionTaken = { type: 'device_update', details: { type: 'light', status: false } };
      updatedState = { devices: updatedDevices };
    } else if (lower.includes('light') && (lower.includes('on') || lower.includes('turn on'))) {
      const updatedDevices = currentState.devices.map(d => d.type === 'light' ? { ...d, status: true } : d);
      reply = "Illuminating the quarters now, Sir. All lighting arrays are set to nominal levels.";
      actionTaken = { type: 'device_update', details: { type: 'light', status: true } };
      updatedState = { devices: updatedDevices };
    } else if (lower.includes('temperature') || lower.includes('thermostat') || lower.includes('degrees') || lower.includes('warmer') || lower.includes('cooler')) {
      const tempMatch = lower.match(/\d{2}/);
      const newTemp = tempMatch ? parseInt(tempMatch[0], 10) : 72;
      const updatedDevices = currentState.devices.map(d => d.type === 'thermostat' ? { ...d, value: newTemp } : d);
      reply = `Adjusting the climate control to ${newTemp}°F. Environmental telemetry indicates optimal comfort.`;
      actionTaken = { type: 'device_update', details: { type: 'thermostat', value: newTemp } };
      updatedState = { devices: updatedDevices };
    } else if (lower.includes('task') || lower.includes('todo') || lower.includes('to-do') || lower.includes('add to my list')) {
      const cleanTitle = message.replace(/^(add task|add to-do|add todo|create task|task:)/i, '').trim() || 'New priority action item';
      const newTask = {
        id: `task-${Date.now()}`,
        title: cleanTitle,
        priority: 'high' as const,
        completed: false,
        dueDate: 'Today'
      };
      reply = `I have logged "${cleanTitle}" into your prioritized action roster, Sir.`;
      actionTaken = { type: 'task_added', details: newTask };
      updatedState = { tasks: [newTask, ...currentState.tasks] };
    } else if (lower.includes('reminder') || lower.includes('remind me')) {
      const cleanTitle = message.replace(/^(remind me to|set reminder for|set a reminder)/i, '').trim() || 'Scheduled notification';
      const isLoc = lower.includes('when i get to') || lower.includes('at the');
      const newReminder = {
        id: `rem-${Date.now()}`,
        title: cleanTitle,
        locationBased: isLoc,
        completed: false
      };
      reply = `Reminder calibrated for "${cleanTitle}". I shall alert you punctually.`;
      actionTaken = { type: 'reminder_added', details: newReminder };
      updatedState = { reminders: [newReminder, ...currentState.reminders] };
    } else if (lower.includes('briefing') || lower.includes('morning update') || lower.includes('daily report')) {
      reply = `Good day, Sir. Coastal temperatures are at 68°F under partly sunny skies. You have ${currentState.events.length} scheduled engagements today, beginning with Project Archangel Synchronization at 10:00 AM. Commute delays along the coast remain under 6 minutes.`;
      actionTaken = { type: 'briefing_requested' };
    } else if (lower.includes('lock') || lower.includes('secure') || lower.includes('perimeter')) {
      const updatedDevices = currentState.devices.map(d => {
        if (d.type === 'lock' || d.type === 'security') return { ...d, status: true };
        return d;
      });
      reply = "Deadbolts engaged and perimeter intrusion sensors armed. The premises are fully secured, Sir.";
      actionTaken = { type: 'device_update', details: { security: 'armed' } };
      updatedState = { devices: updatedDevices };
    } else if (lower.includes('who are you') || lower.includes('what can you do')) {
      reply = "I am JARVIS—your intelligent personal concierge and automated systems manager. I oversee calendar scheduling, proactive morning briefings, smart environment automation, prioritized tasks, and strict cryptographic privacy safeguards.";
    } else {
      reply = `At your service, Sir. I have processed: "${message}". All peripheral telemetry remains stable. Let me know if you wish to adjust the environmental controls, review your schedule, or inspect security parameters.`;
    }

    if (updatedState) {
      const merged = { ...currentState, ...updatedState };
      writeState(merged);
    }

    const responsePayload: ChatApiResponse = {
      reply,
      actionTaken,
      updatedState
    };
    res.json(responsePayload);
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build chat history
    const contents: any[] = [];
    if (history && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction
      }
    });

    const rawText = response.text || "Command processed, Sir.";

    // Check for JSON action block
    let cleanedReply = rawText;
    let actionTaken: any = undefined;
    let updatedState: Partial<JarvisState> | undefined = undefined;

    const actionMatch = rawText.match(/```json-action\s*([\s\S]*?)\s*```/);
    if (actionMatch && actionMatch[1]) {
      cleanedReply = rawText.replace(/```json-action[\s\S]*?```/, '').trim();
      try {
        const parsedAction = JSON.parse(actionMatch[1]);
        actionTaken = parsedAction;

        if (parsedAction.action === 'device_update' && parsedAction.payload) {
          const { id, type, status, value, color } = parsedAction.payload;
          const updatedDevices = currentState.devices.map(d => {
            if ((id && d.id === id) || (type && d.type === type)) {
              return {
                ...d,
                ...(status !== undefined ? { status: Boolean(status) } : {}),
                ...(value !== undefined ? { value: Number(value) } : {}),
                ...(color ? { color } : {})
              };
            }
            return d;
          });
          updatedState = { devices: updatedDevices };
        } else if (parsedAction.action === 'task_added' && parsedAction.payload) {
          const newTask = {
            id: `task-${Date.now()}`,
            title: parsedAction.payload.title || 'New Task',
            priority: parsedAction.payload.priority || 'medium',
            dueDate: parsedAction.payload.dueDate || 'Today',
            completed: false
          };
          updatedState = { tasks: [newTask, ...currentState.tasks] };
        } else if (parsedAction.action === 'reminder_added' && parsedAction.payload) {
          const newReminder = {
            id: `rem-${Date.now()}`,
            title: parsedAction.payload.title || 'Reminder',
            time: parsedAction.payload.time,
            locationBased: Boolean(parsedAction.payload.locationBased),
            locationName: parsedAction.payload.locationName,
            completed: false
          };
          updatedState = { reminders: [newReminder, ...currentState.reminders] };
        } else if (parsedAction.action === 'event_added' && parsedAction.payload) {
          const newEvent = {
            id: `evt-${Date.now()}`,
            title: parsedAction.payload.title || 'New Event',
            time: parsedAction.payload.time || '12:00 PM',
            date: parsedAction.payload.date || 'Today',
            location: parsedAction.payload.location
          };
          updatedState = { events: [...currentState.events, newEvent] };
        }
      } catch (err) {
        console.error('Error parsing action block:', err);
      }
    }

    if (updatedState) {
      const merged = { ...currentState, ...updatedState };
      writeState(merged);
    }

    res.json({
      reply: cleanedReply,
      actionTaken,
      updatedState
    });

  } catch (geminiError: any) {
    console.error('Gemini API Error:', geminiError);
    res.json({
      reply: `My apologies Sir, an internal satellite uplink latency occurred: ${geminiError.message || 'connection glitch'}. I have fallen back to local safety protocols. How may I assist you?`,
      actionTaken: { type: 'none' }
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 JARVIS AI Neural Server running on http://localhost:${PORT}`);
  });
}

startServer();
