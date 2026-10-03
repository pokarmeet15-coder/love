# 🎙️ Roxy AI — Production-Ready Real-Time Voice-to-Voice AI Assistant

Roxy is a production-grade, real-time voice-to-voice AI companion web application built with **React 18**, **TypeScript**, **Tailwind CSS**, and the **Gemini Live API** (`@google/genai` using `gemini-3.1-flash-live-preview`).

---

## ✨ Features

- **Strict Audio-to-Audio Streaming**:
  - **Input**: Resampled microphone PCM16 audio captured at 16kHz via Web Audio API.
  - **Output**: Direct PCM16 24kHz audio playback scheduled seamlessly in real time.
- **AI Girlfriend Persona ("Roxy")**:
  - Young, confident, witty, sassy, and charmingly flirty persona with high emotional intelligence and bold banter.
- **Graceful Interruption**:
  - User can cut off Roxy mid-speech; audio buffers flush instantly upon user speaking.
- **Instant Browser Tool Function Calling**:
  - Browser executable tools (`openWebsite`, `changeTheme`, `getWeather`, `getSystemInfo`, `playTone`, `calculateExpression`) execute instantly with immediate `toolResponse` feedback.
- **Mobile-First Futuristic UI**:
  - Fullscreen dark interface with interactive Central Power Orb, real-time audio visualizer waveforms, status indicators (`disconnected`, `connecting`, `listening`, `speaking`), and tool execution toasts. No text chat clutter.

---

## 🛠️ Architecture

```
src/
├── components/
│   ├── AudioVisualizer.tsx   # Real-time frequency canvas visualizer
│   ├── MicOrbControl.tsx     # Animated interactive center orb button
│   ├── SettingsModal.tsx     # API Key & Voice persona settings modal
│   └── ToolToast.tsx         # Live browser tool execution toast notifications
├── services/
│   ├── AudioStreamer.ts      # Web Audio API mic capturing & PCM16 24kHz playback queue
│   └── LiveSession.ts        # Gemini Live API WebSocket connection & function calling manager
├── types.ts                  # Fully typed system interfaces
├── App.tsx                   # Main mobile-first application layout
└── main.tsx                  # React DOM entrypoint
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ or [Bun](https://bun.sh/)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
Clone the repository and install dependencies:
```bash
bun install
# or
npm install
```

### 3. Environment Setup (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your Gemini API key in `.env` (or configure it directly inside the app's Settings modal):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Running Locally
Start the development server:
```bash
bun run dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
To create a production build and run the server:
```bash
bun run build
bun run start
```

---

## 🔒 Security & Privacy
- API keys entered via the settings modal are persisted safely in `localStorage` in the browser environment only.
