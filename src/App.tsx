import { useState, useEffect } from 'react';
import { JarvisState, ChatMessage, ChatApiResponse } from './types';
import { JarvisHUD } from './components/JarvisHUD';
import { DailyBriefing } from './components/DailyBriefing';
import { SmartDeviceControl } from './components/SmartDeviceControl';
import { TaskCalendarManager } from './components/TaskCalendarManager';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { playChime } from './utils/speech';
import {
  MessageSquare,
  Sparkles,
  Sliders,
  CalendarCheck,
  Shield,
  Activity,
  Cpu,
  RefreshCw,
  Terminal
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'hud' | 'briefing' | 'smartHome' | 'tasks'>('hud');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [state, setState] = useState<JarvisState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  // Initial greeting conversation
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Good day, Sir. All primary systems are online and encrypted. How may I be of service today?',
      timestamp: new Date().toISOString()
    }
  ]);

  // Load Jarvis state on mount
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Failed to load Jarvis state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateState = async (partial: Partial<JarvisState>) => {
    if (!state) return;
    const merged = { ...state, ...partial };
    setState(merged);
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
    } catch (err) {
      console.error('Failed to update state:', err);
    }
  };

  const handleSendMessage = async (userPrompt: string) => {
    if (!state) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          state
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: ChatApiResponse = await res.json();

      let actionSummary: string | undefined = undefined;
      if (data.actionTaken && data.actionTaken.type !== 'none') {
        const typeNames: Record<string, string> = {
          device_update: 'Hardware telemetry adjusted',
          task_added: 'Task logged to priority roster',
          event_added: 'Calendar synchronization updated',
          reminder_added: 'Contextual reminder set',
          briefing_requested: 'Proactive briefing synthesized'
        };
        actionSummary = typeNames[data.actionTaken.type] || 'Action executed';
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        actionSummary
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.updatedState) {
        setState((prev) => (prev ? { ...prev, ...data.updatedState } : null));
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'Apologies, Sir. A communication packet disruption occurred. I remain standing by.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const navItems = [
    { key: 'hud', label: 'Command HUD', icon: MessageSquare },
    { key: 'briefing', label: 'Daily Briefing', icon: Sparkles },
    { key: 'smartHome', label: 'Smart Home', icon: Sliders },
    { key: 'tasks', label: 'Tasks & Calendar', icon: CalendarCheck }
  ] as const;

  if (isLoading || !state) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center p-4 font-mono">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
          <Cpu className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="mt-4 text-xs tracking-widest uppercase">Initializing Neural Matrix & Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col overflow-x-hidden">
      {/* Background Holographic Grid Accent */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)]" />

      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Assistant Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center text-cyan-300">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-wider text-cyan-50 font-mono">
                  JARVIS AI
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SYSTEM READY
                </span>
              </div>
              <p className="text-[11px] text-cyan-400/60 font-mono">
                Intelligent Virtual Assistant & Automation Matrix
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/80 border border-cyan-900/60 rounded-2xl font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    playChime('affirm');
                    setActiveView(item.key);
                  }}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-cyan-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings & Privacy Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playChime('wake');
                setIsPrivacyModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 rounded-xl font-mono text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Security & Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden items-center justify-between pt-3 mt-3 border-t border-cyan-950 overflow-x-auto gap-2 text-xs font-mono">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  playChime('affirm');
                  setActiveView(item.key);
                }}
                className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 relative z-10">
        {activeView === 'hud' && (
          <JarvisHUD
            state={state}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={chatLoading}
            onOpenBriefing={() => setActiveView('briefing')}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          />
        )}

        {activeView === 'briefing' && (
          <DailyBriefing
            state={state}
            onClose={() => setActiveView('hud')}
          />
        )}

        {activeView === 'smartHome' && (
          <SmartDeviceControl
            state={state}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeView === 'tasks' && (
          <TaskCalendarManager
            state={state}
            onUpdateState={handleUpdateState}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-950 bg-slate-950/60 py-4 px-6 text-center text-xs font-mono text-cyan-400/50 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>JARVIS PROTOCOL 2.5 • QUANTUM ENCRYPTED TELEMETRY</span>
        </div>
        <div className="mt-2 sm:mt-0">
          <span>Local Enclave: {state.privacy.localProcessingOnly ? 'ENFORCED' : 'STANDBY'}</span>
        </div>
      </footer>

      {/* Security & Settings Modal */}
      {isPrivacyModalOpen && (
        <PrivacySettingsModal
          state={state}
          onUpdateState={handleUpdateState}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      )}
    </div>
  );
}
