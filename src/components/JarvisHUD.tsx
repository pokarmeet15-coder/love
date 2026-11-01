import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, JarvisState } from '../types';
import { ArcReactorOrb } from './ArcReactorOrb';
import { playJarvisSpeech, stopJarvisSpeech, playChime, JarvisSpeechController } from '../utils/speech';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Terminal, Activity, ShieldCheck, Zap } from 'lucide-react';

interface JarvisHUDProps {
  state: JarvisState;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isLoading: boolean;
  onOpenBriefing: () => void;
  onOpenPrivacy: () => void;
}

export const JarvisHUD: React.FC<JarvisHUDProps> = ({
  state,
  messages,
  onSendMessage,
  isLoading,
  onOpenBriefing,
  onOpenPrivacy
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechControllerRef = useRef<JarvisSpeechController | null>(null);

  // Initialize Speech Controller
  useEffect(() => {
    speechControllerRef.current = new JarvisSpeechController();
    return () => {
      if (speechControllerRef.current) {
        speechControllerRef.current.stopListening();
      }
      stopJarvisSpeech();
    };
  }, []);

  // Update status based on loading state
  useEffect(() => {
    if (isLoading) {
      setSpeechStatus('thinking');
    } else if (!isListening && speechStatus === 'thinking') {
      setSpeechStatus('idle');
    }
  }, [isLoading]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, transcriptPreview]);

  // Voice toggle
  const toggleListening = () => {
    if (!state.privacy.micEnabled) {
      alert("Microphone is currently disabled in your Security & Privacy settings.");
      return;
    }

    if (isListening) {
      speechControllerRef.current?.stopListening();
      setIsListening(false);
      setSpeechStatus('idle');
      setTranscriptPreview('');
      playChime('shutdown');
    } else {
      if (!speechControllerRef.current?.isSupported()) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge, or type in the console.");
        return;
      }
      playChime('wake');
      setIsListening(true);
      setSpeechStatus('listening');

      speechControllerRef.current.startListening({
        onResult: (transcript, isFinal) => {
          setTranscriptPreview(transcript);
          if (isFinal && transcript.trim().length > 0) {
            handleVoiceCommand(transcript.trim());
          }
        },
        onWakeWordDetected: () => {
          playChime('affirm');
        },
        onError: () => {
          setIsListening(false);
          setSpeechStatus('idle');
          setTranscriptPreview('');
        },
        onEnd: () => {
          setIsListening(false);
          setSpeechStatus('idle');
          setTranscriptPreview('');
        }
      }, state.personality.wakePhraseEnabled);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    speechControllerRef.current?.stopListening();
    setIsListening(false);
    setTranscriptPreview('');
    await handleSend(command);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setInputText('');
    setSpeechStatus('thinking');

    try {
      await onSendMessage(text);
      // Assistant response is spoken if unmuted
      if (!isMuted) {
        setSpeechStatus('speaking');
        // Retrieve latest reply from messages after small delay
        setTimeout(() => {
          const lastMsg = messages[messages.length - 1];
          const replyText = lastMsg && lastMsg.role === 'assistant' ? lastMsg.content : "Understood, Sir.";
          playJarvisSpeech(replyText, state.personality.voiceProfile, () => {
            setSpeechStatus('idle');
          });
        }, 150);
      } else {
        setSpeechStatus('idle');
      }
    } catch {
      setSpeechStatus('idle');
    }
  };

  const handleQuickCommand = (cmd: string) => {
    handleSend(cmd);
  };

  const activeLights = state.devices.filter(d => d.type === 'light' && d.status).length;
  const pendingTasks = state.tasks.filter(t => !t.completed).length;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Column: Holographic Arc Reactor Core & Telemetry */}
      <div className="w-full lg:w-96 flex flex-col items-center justify-between p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        {/* Futuristic Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Top Arc Telemetry */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400/80 mb-4">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>NEURAL CORE v2.5</span>
          </div>
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1 text-[11px] bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 px-2 py-0.5 rounded-full text-cyan-300 transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {state.privacy.encryptionStatus ? 'ENCRYPTED' : 'LOCAL'}
          </button>
        </div>

        {/* Center Orb */}
        <div className="my-6 flex flex-col items-center">
          <ArcReactorOrb
            status={speechStatus}
            onClick={toggleListening}
            size="lg"
          />

          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold tracking-wider text-cyan-100 flex items-center justify-center gap-2">
              <span>JARVIS</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {speechStatus}
              </span>
            </h2>
            <p className="text-xs text-cyan-400/70 font-mono mt-1">
              {isListening
                ? state.personality.wakePhraseEnabled
                  ? 'Listening for "Hey Jarvis" or voice command...'
                  : 'Listening to your speech...'
                : 'Click reactor or press Mic to speak'}
            </p>
          </div>
        </div>

        {/* Telemetry Status Gauges */}
        <div className="w-full grid grid-cols-2 gap-3 text-xs font-mono mb-4">
          <div className="bg-slate-950/70 border border-cyan-900/60 p-2.5 rounded-xl">
            <span className="text-slate-400 text-[10px] uppercase">Active Lights</span>
            <div className="text-cyan-300 font-bold text-sm mt-0.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {activeLights} Online
            </div>
          </div>
          <div className="bg-slate-950/70 border border-cyan-900/60 p-2.5 rounded-xl">
            <span className="text-slate-400 text-[10px] uppercase">Pending Tasks</span>
            <div className="text-cyan-300 font-bold text-sm mt-0.5 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              {pendingTasks} Action Items
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-cyan-950">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              isMuted
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isMuted ? 'Muted' : 'Audio On'}
          </button>

          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Daily Briefing
          </button>
        </div>
      </div>

      {/* Right Column: Holographic Interactive Command Stream */}
      <div className="flex-1 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl overflow-hidden relative shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        {/* Header HUD Bar */}
        <div className="px-6 py-4 border-b border-cyan-500/20 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-cyan-100 uppercase font-mono">
                Interactive Command Interface
              </h3>
              <p className="text-[11px] text-cyan-400/60 font-mono">
                Encrypted Session • Wake Phrase: {state.personality.wakePhraseEnabled ? '"Hey Jarvis"' : 'Disabled'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              Humor: {state.personality.humorLevel}%
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {state.personality.formality.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Chat Log Stream */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-sm scroll-smooth"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shrink-0 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    J
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 transition-all ${
                    isUser
                      ? 'bg-cyan-500/20 text-cyan-50 border border-cyan-400/40 rounded-tr-none'
                      : 'bg-slate-950/80 text-slate-100 border border-cyan-900/60 rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* System Action confirmation badge */}
                  {msg.actionSummary && (
                    <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{msg.actionSummary}</span>
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-cyan-400/50 font-mono">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500 border border-cyan-300 flex items-center justify-center shrink-0 text-slate-950 font-mono text-xs font-bold">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {/* Real-time Voice Transcript Preview */}
          {transcriptPreview && (
            <div className="flex gap-3 justify-end animate-pulse">
              <div className="max-w-[80%] rounded-2xl p-4 bg-cyan-500/10 border border-dashed border-cyan-400/60 text-cyan-300 font-mono text-xs italic">
                <span>Listening: "{transcriptPreview}..."</span>
              </div>
            </div>
          )}

          {/* Thinking Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-cyan-400 text-xs font-mono">
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shrink-0 text-cyan-300 font-mono text-xs font-bold">
                J
              </div>
              <div className="bg-slate-950/80 border border-cyan-900/60 rounded-2xl p-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-cyan-300 ml-1">Analyzing telemetry & intent...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-slate-950/50 border-t border-cyan-950 flex items-center gap-2 overflow-x-auto text-xs font-mono no-scrollbar">
          <span className="text-slate-500 text-[10px] uppercase shrink-0">Suggestions:</span>
          {[
            'What is my daily briefing?',
            'Turn off living room lights',
            'Set temperature to 72 degrees',
            'Add task: Review quarterly report',
            'Remind me to call Bruce at Bio Lab'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickCommand(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900 hover:border-cyan-400 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Input Field */}
        <div className="p-4 bg-slate-950/80 border-t border-cyan-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900 hover:border-cyan-400'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Speak or enter command ("Hey Jarvis, turn off lights")...'
              className="flex-1 bg-slate-900/90 text-cyan-100 placeholder:text-slate-500 border border-cyan-500/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-sans"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
