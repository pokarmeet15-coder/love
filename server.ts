import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Proposal, ProposalResponse } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// File storage directory
const DATA_DIR = path.join(process.cwd(), 'data');
const PROPOSALS_FILE = path.join(DATA_DIR, 'proposals.json');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_DEMO_PROPOSAL: Proposal = {
  id: 'default',
  creatorName: 'Rahul',
  crushName: 'Simran',
  creatorPin: '1234',
  title: 'A Special Secret Message For You... ❤️',
  subTitle: 'Take a small journey through my heart before you answer!',
  photos: [
    {
      id: 'p1',
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      caption: 'The moment I first saw your smile ✨',
      date: 'Special Day'
    },
    {
      id: 'p2',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
      caption: 'Every moment spent with you feels like magic 🌸',
      date: 'Unforgettable Memories'
    },
    {
      id: 'p3',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      caption: 'Hoping for many more chapters together 💖',
      date: 'Forever & Always'
    }
  ],
  questions: [
    {
      id: 'q1',
      questionText: 'Kya tum mujhe pasand karti ho? 🙈',
      subtitle: 'Be completely honest! My heart is beating fast...',
      options: ['Haan, bahut jyada! ❤️', 'Haan, tum acche ho! 😊'],
      allowNoOption: true,
      noButtonLabel: 'Nahi 😜'
    },
    {
      id: 'q2',
      questionText: 'Kya tum mere saath aur time spend karna pasand karogi? ☕🌸',
      subtitle: 'Long conversations, sunset walks, and coffee dates...',
      options: ['Bilkul, always! 💖', 'Haan, I would love that! ✨'],
      allowNoOption: true,
      noButtonLabel: 'Sona h mujhe 😴'
    },
    {
      id: 'q3',
      questionText: 'Kya tum future me mujhe aur achhe se jaana chahogi? 🔮✨',
      subtitle: 'Through all the happy & silly moments ahead...',
      options: ['Haan, 100%! 🌟', 'Yes of course! 💕'],
      allowNoOption: false
    },
    {
      id: 'q4',
      questionText: 'Kya tum meri girlfriend banna chahogi? 💍❤️',
      subtitle: 'Will you hold my hand and make my world complete?',
      options: ['YES! A thousand times YES! 🎉❤️', 'YES! Forever yours! 💖'],
      allowNoOption: true,
      noButtonLabel: 'Nahi 🙈'
    }
  ],
  finalLoveLetter: {
    title: 'You Made Me The Happiest Person Alive! 🎉💖',
    body: 'Thank you for answering yes! From the very first day, your presence has brought endless warmth, joy, and laughter into my life. I promise to cherish you, make you smile every day, and stand by you through every adventure.',
    signature: 'With all my love forever, Rahul 💕'
  },
  musicTrack: 'romantic-melody',
  evasiveDifficulty: 'playful',
  createdAt: new Date().toISOString()
};

function readProposals(): Record<string, Proposal> {
  try {
    if (!fs.existsSync(PROPOSALS_FILE)) {
      const initial = { default: DEFAULT_DEMO_PROPOSAL };
      fs.writeFileSync(PROPOSALS_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(PROPOSALS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed['default']) {
      parsed['default'] = DEFAULT_DEMO_PROPOSAL;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading proposals file:', err);
    return { default: DEFAULT_DEMO_PROPOSAL };
  }
}

function writeProposals(proposals: Record<string, Proposal>) {
  try {
    fs.writeFileSync(PROPOSALS_FILE, JSON.stringify(proposals, null, 2));
  } catch (err) {
    console.error('Error writing proposals file:', err);
  }
}

function readResponses(): ProposalResponse[] {
  try {
    if (!fs.existsSync(RESPONSES_FILE)) {
      fs.writeFileSync(RESPONSES_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(RESPONSES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading responses file:', err);
    return [];
  }
}

function writeResponses(responses: ProposalResponse[]) {
  try {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2));
  } catch (err) {
    console.error('Error writing responses file:', err);
  }
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET all proposal summaries (for creator list)
app.get('/api/proposals', (_req, res) => {
  const proposals = readProposals();
  const list = Object.values(proposals).map(p => ({
    id: p.id,
    creatorName: p.creatorName,
    crushName: p.crushName,
    title: p.title,
    createdAt: p.createdAt
  }));
  res.json(list);
});

// GET single proposal (strips creator pin for safety)
app.get('/api/proposal/:id', (req, res) => {
  const { id } = req.params;
  const proposals = readProposals();
  const proposal = proposals[id] || proposals['default'];
  
  if (!proposal) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  // Hide pin
  const { creatorPin, ...publicProposal } = proposal;
  res.json(publicProposal);
});

// POST create or update proposal
app.post('/api/proposal', (req, res) => {
  const body = req.body as Partial<Proposal>;
  const proposals = readProposals();
  
  const id = body.id || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const existing = proposals[id];

  const updatedProposal: Proposal = {
    id,
    creatorName: body.creatorName || existing?.creatorName || 'Anonymous Lover',
    crushName: body.crushName || existing?.crushName || 'My Crush',
    creatorPin: body.creatorPin || existing?.creatorPin || '1234',
    title: body.title || existing?.title || 'A Special Message For You ❤️',
    subTitle: body.subTitle || existing?.subTitle || 'Answer these small questions!',
    photos: body.photos && body.photos.length > 0 ? body.photos : (existing?.photos || DEFAULT_DEMO_PROPOSAL.photos),
    questions: body.questions && body.questions.length > 0 ? body.questions : (existing?.questions || DEFAULT_DEMO_PROPOSAL.questions),
    finalLoveLetter: body.finalLoveLetter || existing?.finalLoveLetter || DEFAULT_DEMO_PROPOSAL.finalLoveLetter,
    musicTrack: body.musicTrack || existing?.musicTrack || 'romantic-melody',
    evasiveDifficulty: body.evasiveDifficulty || existing?.evasiveDifficulty || 'playful',
    createdAt: existing?.createdAt || new Date().toISOString()
  };

  proposals[id] = updatedProposal;
  writeProposals(proposals);

  res.json({
    success: true,
    proposalId: id,
    creatorPin: updatedProposal.creatorPin
  });
});

// POST submit response
app.post('/api/proposal/:id/respond', (req, res) => {
  const { id } = req.params;
  const { crushName, answers, saidYes, loveNote } = req.body;

  const responses = readResponses();
  const newResponse: ProposalResponse = {
    id: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    proposalId: id,
    crushName: crushName || 'Your Crush',
    submittedAt: new Date().toISOString(),
    answers: answers || [],
    saidYes: Boolean(saidYes),
    loveNote: loveNote || ''
  };

  responses.push(newResponse);
  writeResponses(responses);

  res.json({
    success: true,
    message: 'Response submitted successfully! The creator can now view your answers.',
    responseId: newResponse.id
  });
});

// GET responses for a proposal (Requires Pin check via query or header)
app.get('/api/proposal/:id/responses', (req, res) => {
  const { id } = req.params;
  const pin = (req.query.pin as string) || (req.headers['x-creator-pin'] as string);

  const proposals = readProposals();
  const proposal = proposals[id];

  if (!proposal) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  if (proposal.creatorPin && proposal.creatorPin !== pin) {
    res.status(401).json({ error: 'Invalid PIN. Please enter the correct creator PIN.' });
    return;
  }

  const responses = readResponses().filter(r => r.proposalId === id);
  res.json({
    proposalId: id,
    proposalTitle: proposal.title,
    crushName: proposal.crushName,
    creatorName: proposal.creatorName,
    responses
  });
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
    console.log(`💖 LoveProposal Server running on http://localhost:${PORT}`);
  });
}

startServer();
