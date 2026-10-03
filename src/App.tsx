import React, { useState, useEffect, useRef } from 'react';
import { Settings, Heart, Zap, Terminal, AlertCircle } from 'lucide-react';
import { AssistantConfig, SessionState, ToolCallLog } from './types';
import { AudioStreamer } from './services/AudioStreamer';
import { LiveSession, DEFAULT_PERSONA_INSTRUCTION } from './services/LiveSession';
import { MicOrbControl } from './components/MicOrbControl';
import { AudioVisualizer } from './components/AudioVisualizer';
import { ToolToast } from './components/ToolToast';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Config state
  const [config, setConfig] = useState<AssistantConfig>(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY') || '';
    return {
      apiKey: savedKey,
      voiceName: 'Aoede',
      modelName: 'gemini-3.1-flash-live-preview',
      systemInstruction: DEFAULT_PERSONA_INSTRUCTION,
    };
  });

  // Application session state
  const [sessionState, setSessionState] = useState<SessionState>('disconnected');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toolLogs, setToolLogs] = useState<ToolCallLog[]>([]);
  const [accentColor, setAccentColor] = useState<string>('#ec4899');

  // Real-time audio visualizer metrics
  const [audioLevels, setAudioLevels] = useState({
    inputLevel: 0,
    outputLevel: 0,
    inputFrequencies: new Uint8Array(128),
    outputFrequencies: new Uint8Array(128),
  });

  // References to core services
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio streamer and dynamic theme listener
  useEffect(() => {
    const streamer = new AudioStreamer({
      onPlaybackStateChange: (isPlaying) => {
        if (liveSessionRef.current) {
          const currentState = liveSessionRef.current.getState();
          if (isPlaying && currentState !== 'speaking') {
            setSessionState('speaking');
          } else if (!isPlaying && currentState === 'speaking') {
            setSessionState('listening');
          }
        }
      },
    });

    audioStreamerRef.current = streamer;

    // Listen for custom tool theme changes
    const handleThemeChange = (e: any) => {
      if (e.detail?.color) {
        setAccentColor(e.detail.color);
      }
    };
    document.addEventListener('app-theme-change', handleThemeChange);

    // Continuous audio visualizer animation loop
    const updateLevels = () => {
      if (audioStreamerRef.current) {
        const levels = audioStreamerRef.current.getAudioLevels();
        setAudioLevels(levels);
      }
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };
    updateLevels();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('app-theme-change', handleThemeChange);
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
      if (audioStreamerRef.current) {
        audioStreamerRef.current.close();
      }
    };
  }, []);

  // Save API key changes to localStorage
  const handleSaveConfig = (newConfig: AssistantConfig) => {
    setConfig(newConfig);
    if (newConfig.apiKey) {
      localStorage.setItem('GEMINI_API_KEY', newConfig.apiKey);
    }
  };

  // Toggle Live Voice Session (Connect / Disconnect)
  const handleToggleSession = async () => {
    setErrorMessage(null);

    // If currently connected or connecting, disconnect
    if (sessionState !== 'disconnected') {
      if (liveSessionRef.current) {
        await liveSessionRef.current.disconnect();
      }
      setSessionState('disconnected');
      return;
    }

    // Check API Key presence
    if (!config.apiKey) {
      setIsSettingsOpen(true);
      setErrorMessage('Please enter your Gemini API Key in Settings to start.');
      return;
    }

    try {
      if (!audioStreamerRef.current) {
        audioStreamerRef.current = new AudioStreamer();
      }

      const liveSession = new LiveSession(
        config,
        {
          onStateChange: (newState) => {
            setSessionState(newState);
          },
          onToolCall: (log) => {
            setToolLogs((prev) => [log, ...prev.slice(0, 9)]);
          },
          onError: (err) => {
            console.error('Session Error:', err);
            setErrorMessage(err.message || 'Connection error occurred.');
            setSessionState('disconnected');
          },
          onInterrupted: () => {
            setSessionState('listening');
          },
        },
        audioStreamerRef.current
      );

      liveSessionRef.current = liveSession;
      await liveSession.connect();
    } catch (err: any) {
      console.error('Session initialization error:', err);
      setErrorMessage(err.message || 'Failed to start voice assistant session.');
      setSessionState('disconnected');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Background Animated Futuristic Glow Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-1000 animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-500 blur-3xl opacity-15 transition-all duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600 blur-3xl opacity-10" />
      </div>

      {/* Top Mobile Header */}
      <header className="relative z-20 px-5 py-4 flex items-center justify-between border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 shadow-md shadow-pink-500/20 text-white">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
                ROXY AI
              </h1>
              <span className="px-1.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-[10px] font-mono font-bold text-pink-400">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sassy Voice AI Companion</p>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-pink-500/50 transition-all cursor-pointer shadow-md"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Error Banner Alert */}
      {errorMessage && (
        <div className="relative z-20 max-w-sm mx-auto mt-3 px-4">
          <div className="bg-rose-950/80 border border-rose-800 text-rose-200 px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-xl backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Mic Center Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6">
        {/* Main Central Mic / Power Orb Control */}
        <MicOrbControl
          state={sessionState}
          onToggle={handleToggleSession}
          inputLevel={audioLevels.inputLevel}
          outputLevel={audioLevels.outputLevel}
          accentColor={accentColor}
        />

        {/* Dynamic Real-Time Waveform Visualizer */}
        <AudioVisualizer
          state={sessionState}
          inputLevel={audioLevels.inputLevel}
          outputLevel={audioLevels.outputLevel}
          inputFrequencies={audioLevels.inputFrequencies}
          outputFrequencies={audioLevels.outputFrequencies}
          accentColor={accentColor}
        />

        {/* Browser Action Tool Call Toasts */}
        <ToolToast logs={toolLogs} />
      </main>

      {/* Bottom Status & Info Bar */}
      <footer className="relative z-20 px-4 py-3 border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md flex flex-col items-center gap-1 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-pink-400" />
            Audio-to-Audio PCM16/24kHz
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400" />
            Function Calling
          </span>
        </div>
        <div className="text-[10px] text-slate-600">
          Powered by Gemini Live API (@google/genai)
        </div>
      </footer>

      {/* Settings Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
