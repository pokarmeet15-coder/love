import React from 'react';
import { Mic, MicOff, Loader2, Volume2, Sparkles } from 'lucide-react';
import { SessionState } from '../types';

interface MicOrbControlProps {
  state: SessionState;
  onToggle: () => void;
  inputLevel: number;
  outputLevel: number;
  accentColor?: string;
}

export const MicOrbControl: React.FC<MicOrbControlProps> = ({
  state,
  onToggle,
  inputLevel,
  outputLevel,
  accentColor = '#ec4899',
}) => {
  // Determine visual configuration based on active session state
  const getStateDetails = () => {
    switch (state) {
      case 'connecting':
        return {
          label: 'Connecting...',
          subLabel: 'Establishing live audio session',
          gradient: 'from-amber-500 via-orange-500 to-amber-600',
          ringColor: 'border-amber-400/50 shadow-amber-500/30',
          glow: 'rgba(245, 158, 11, 0.4)',
          icon: <Loader2 className="w-10 h-10 text-white animate-spin" />,
        };
      case 'listening':
        return {
          label: 'Listening',
          subLabel: 'Speak to Roxy now...',
          gradient: 'from-cyan-500 via-sky-500 to-blue-600',
          ringColor: 'border-cyan-400/60 shadow-cyan-500/40',
          glow: 'rgba(6, 182, 212, 0.5)',
          icon: <Mic className="w-10 h-10 text-white animate-pulse" />,
        };
      case 'speaking':
        return {
          label: 'Roxy Speaking',
          subLabel: 'Tap to interrupt anytime',
          gradient: 'from-rose-500 via-pink-500 to-purple-600',
          ringColor: 'border-rose-400/70 shadow-rose-500/50',
          glow: 'rgba(244, 63, 94, 0.6)',
          icon: <Volume2 className="w-10 h-10 text-white animate-bounce" />,
        };
      case 'disconnected':
      default:
        return {
          label: 'Tap to Start',
          subLabel: 'Start voice session with Roxy',
          gradient: 'from-slate-700 via-slate-800 to-slate-900',
          ringColor: 'border-slate-700/50 shadow-slate-900/50',
          glow: 'rgba(100, 116, 139, 0.2)',
          icon: <MicOff className="w-9 h-9 text-slate-300" />,
        };
    }
  };

  const details = getStateDetails();
  const activeLevel = state === 'speaking' ? outputLevel : state === 'listening' ? inputLevel : 0;
  const pulseScale = 1 + activeLevel * 0.4;

  return (
    <div className="flex flex-col items-center justify-center my-6 relative">
      {/* Outer Pulse Rings */}
      <div className="relative flex items-center justify-center">
        {state !== 'disconnected' && (
          <>
            <div
              className="absolute rounded-full border-2 border-pink-500/30 transition-transform duration-75"
              style={{
                width: '180px',
                height: '180px',
                transform: `scale(${pulseScale * 1.15})`,
                boxShadow: `0 0 35px ${details.glow}`,
              }}
            />
            <div
              className="absolute rounded-full border border-pink-400/20 transition-transform duration-100"
              style={{
                width: '220px',
                height: '220px',
                transform: `scale(${pulseScale * 1.3})`,
              }}
            />
          </>
        )}

        {/* Central Orb Button */}
        <button
          onClick={onToggle}
          className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-br ${details.gradient} border-4 ${details.ringColor} shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer group`}
          style={{
            transform: `scale(${state !== 'disconnected' ? pulseScale : 1})`,
            boxShadow: `0 0 40px ${details.glow}, inset 0 2px 15px rgba(255,255,255,0.3)`,
          }}
          aria-label={details.label}
        >
          {/* Inner Gloss/Shimmer Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />

          {/* Icon */}
          <div className="relative z-10 flex flex-col items-center">
            {details.icon}
          </div>
        </button>
      </div>

      {/* Status Badge & Label */}
      <div className="mt-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg backdrop-blur-md">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : state === 'speaking'
                ? 'bg-pink-500 animate-pulse'
                : state === 'connecting'
                ? 'bg-amber-400 animate-bounce'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
            {details.label}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 font-medium">
          {details.subLabel}
        </p>
      </div>
    </div>
  );
};
