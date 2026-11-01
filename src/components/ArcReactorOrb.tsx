import React from 'react';

interface ArcReactorOrbProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ArcReactorOrb: React.FC<ArcReactorOrbProps> = ({
  status,
  onClick,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  }[size];

  // Colors & glow depending on status
  const statusConfig = {
    idle: {
      core: 'bg-cyan-500/20 border-cyan-400',
      glow: 'shadow-[0_0_50px_rgba(6,182,212,0.4)]',
      ring1: 'border-cyan-500/40',
      ring2: 'border-cyan-400/30',
      label: 'STANDBY'
    },
    listening: {
      core: 'bg-emerald-500/30 border-emerald-400',
      glow: 'shadow-[0_0_70px_rgba(16,185,129,0.7)] animate-pulse',
      ring1: 'border-emerald-400/60 animate-spin',
      ring2: 'border-emerald-300/50',
      label: 'LISTENING...'
    },
    thinking: {
      core: 'bg-amber-500/30 border-amber-400',
      glow: 'shadow-[0_0_80px_rgba(245,158,11,0.6)] animate-pulse',
      ring1: 'border-amber-400/70 animate-spin',
      ring2: 'border-amber-300/60',
      label: 'PROCESSING'
    },
    speaking: {
      core: 'bg-sky-400/40 border-sky-300',
      glow: 'shadow-[0_0_90px_rgba(56,189,248,0.8)] animate-pulse',
      ring1: 'border-sky-300/80 animate-[spin_3s_linear_infinite]',
      ring2: 'border-cyan-200/70 animate-[spin_6s_linear_infinite_reverse]',
      label: 'TRANSMITTING'
    }
  }[status];

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses} flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105`}
      title="Click to toggle Jarvis voice command"
    >
      {/* Outer Glow Field */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 ${statusConfig.glow}`}
      />

      {/* Rotating Outer Segment Ring */}
      <div
        className={`absolute inset-1 rounded-full border border-dashed ${statusConfig.ring1} transition-all duration-700 animate-[spin_20s_linear_infinite]`}
      />

      {/* Counter-rotating Middle Ring */}
      <div
        className={`absolute inset-4 rounded-full border border-dotted ${statusConfig.ring2} transition-all duration-700 animate-[spin_12s_linear_infinite_reverse]`}
      />

      {/* Inner Segment Blades (Arc Reactor Core Details) */}
      <div className="absolute inset-8 rounded-full border border-cyan-500/30 flex items-center justify-center">
        <div className="absolute w-full h-[1px] bg-cyan-400/40 rotate-0" />
        <div className="absolute w-full h-[1px] bg-cyan-400/40 rotate-45" />
        <div className="absolute w-full h-[1px] bg-cyan-400/40 rotate-90" />
        <div className="absolute w-full h-[1px] bg-cyan-400/40 rotate-135" />
      </div>

      {/* Central Core */}
      <div
        className={`relative z-10 w-16 h-16 rounded-full border-2 ${statusConfig.core} backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-500`}
      >
        <div className="w-6 h-6 rounded-full bg-cyan-100 shadow-[0_0_15px_#fff]" />
        <span className="text-[8px] font-mono tracking-widest text-cyan-200 uppercase mt-1 opacity-80">
          {statusConfig.label}
        </span>
      </div>

      {/* Pulsing Audio Waves when active */}
      {(status === 'listening' || status === 'speaking') && (
        <div className="absolute -inset-4 rounded-full border border-cyan-400/30 animate-ping pointer-events-none" />
      )}
    </div>
  );
};
