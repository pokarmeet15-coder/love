// Jarvis AI System Data Types & Models

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionSummary?: string;
  audioAvailable?: boolean;
}

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface TaskItem {
  id: string;
  title: string;
  priority: PriorityLevel;
  dueDate?: string;
  completed: boolean;
  category?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  attendees?: string[];
  description?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time?: string;
  locationBased: boolean;
  locationName?: string;
  completed: boolean;
}

export type DeviceType = 'light' | 'thermostat' | 'lock' | 'security';

export interface SmartDevice {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  status: boolean; // on/off, unlocked/locked, armed/disarmed
  value?: number; // temperature in deg F or brightness %
  color?: string; // for RGB lights
}

export interface PersonalityConfig {
  humorLevel: number; // 0 to 100
  formality: 'casual' | 'balanced' | 'formal';
  voiceProfile: 'classic-jarvis' | 'warm-companion' | 'concise-analyst' | 'playful-bot';
  wakePhraseEnabled: boolean;
  skills: {
    smartHome: boolean;
    calendarScheduling: boolean;
    musicControl: boolean;
    trafficBriefing: boolean;
    dailySummary: boolean;
  };
}

export interface PrivacyConfig {
  micEnabled: boolean;
  localProcessingOnly: boolean;
  dataSharingEnabled: boolean;
  encryptionStatus: boolean; // visual confirmation of active E2E encryption
  ratingsHistory: { id: string; rating: number; feedback?: string; timestamp: string }[];
}

export interface DailyBriefingData {
  greeting: string;
  weather: {
    temp: number;
    condition: string;
    high: number;
    low: number;
    city: string;
  };
  traffic: {
    route: string;
    commuteTimeMin: number;
    delayMin: number;
    alert?: string;
    alternateRoute?: string;
  };
  schedule: CalendarEvent[];
  headlines: string[];
  contextualReminder: string;
}

export interface JarvisState {
  tasks: TaskItem[];
  events: CalendarEvent[];
  reminders: Reminder[];
  devices: SmartDevice[];
  personality: PersonalityConfig;
  privacy: PrivacyConfig;
  conversationMemory: string[]; // Key insights/facts Jarvis remembers
}

export interface ChatApiRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  state: JarvisState;
}

export interface ChatApiResponse {
  reply: string;
  actionTaken?: {
    type: 'device_update' | 'task_added' | 'event_added' | 'reminder_added' | 'briefing_requested' | 'none';
    details?: any;
  };
  updatedState?: Partial<JarvisState>;
}
