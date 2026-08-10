import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { synth } from '../utils/audioSynth';

interface EvasiveButtonProps {
  label: string;
  onAttemptNo: () => void;
  noCount: number;
  difficulty?: 'playful' | 'impossible' | 'teleport';
}

const PLAYFUL_RESPONSES = [
  "Nice try! 😜",
  "You can't click No! ❤️",
  "Nope, try again! 🌸",
  "Are you sure? 🥺",
  "It's a trap! 💖",
  "Error 404: 'No' not found! 🙈",
  "Just say YES! 🎉",
  "I won't let you! 💖"
];

export const EvasiveButton: React.FC<EvasiveButtonProps> = ({
  label,
  onAttemptNo,
  noCount,
  difficulty = 'playful'
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveButton = () => {
    synth.playEvasiveSqueak();
    onAttemptNo();

    // Pick a funny label
    const randomMsg = PLAYFUL_RESPONSES[Math.floor(Math.random() * PLAYFUL_RESPONSES.length)];
    setTooltipText(randomMsg);

    // Calculate maximum offset distance
    const rangeX = difficulty === 'impossible' ? 240 : 160;
    const rangeY = difficulty === 'impossible' ? 180 : 120;

    let newX = (Math.random() - 0.5) * rangeX * 2;
    let newY = (Math.random() - 0.5) * rangeY * 2;

    // Prevent sticking to extreme edge
    if (Math.abs(newX) < 40) newX = newX > 0 ? 60 : -60;
    if (Math.abs(newY) < 30) newY = newY > 0 ? 50 : -50;

    setPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    if (tooltipText) {
      const timer = setTimeout(() => setTooltipText(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [tooltipText]);

  return (
    <div ref={containerRef} className="relative inline-block m-2">
      {tooltipText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -42, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute left-1/2 -translate-x-1/2 -top-8 bg-rose-900/90 text-rose-100 text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg border border-rose-400/30 whitespace-nowrap z-30 pointer-events-none"
        >
          {tooltipText}
        </motion.div>
      )}

      <motion.button
        id="evasive-no-btn"
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        onMouseEnter={moveButton}
        onTouchStart={moveButton}
        onClick={moveButton}
        type="button"
        className="px-5 py-2.5 rounded-2xl bg-rose-100 text-rose-700 font-medium text-sm border border-rose-300/80 shadow-xs hover:bg-rose-200 transition-colors cursor-pointer select-none"
      >
        {noCount > 0 ? `${label} (${noCount})` : label}
      </motion.button>
    </div>
  );
};
