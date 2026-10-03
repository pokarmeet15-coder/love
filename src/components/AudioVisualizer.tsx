import React, { useEffect, useRef } from 'react';
import { SessionState } from '../types';

interface AudioVisualizerProps {
  state: SessionState;
  inputLevel: number;
  outputLevel: number;
  inputFrequencies: Uint8Array;
  outputFrequencies: Uint8Array;
  accentColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  state,
  inputLevel,
  outputLevel,
  inputFrequencies,
  outputFrequencies,
  accentColor = '#ec4899',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const activeLevel = state === 'speaking' ? outputLevel : state === 'listening' ? inputLevel : 0.05;
      const freqData = state === 'speaking' ? outputFrequencies : inputFrequencies;

      const barCount = 32;
      const barWidth = 4;
      const gap = (width - barCount * barWidth) / (barCount + 1);

      // Draw mirrored frequency wave bars
      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * (freqData.length / 2));
        const value = freqData[index] ? freqData[index] / 255 : Math.sin(Date.now() * 0.003 + i * 0.2) * 0.15 + 0.1;

        const calculatedHeight = Math.max(6, value * (height * 0.7) * (state === 'disconnected' ? 0.3 : 1));
        const x = gap + i * (barWidth + gap);
        const yPos = centerY - calculatedHeight / 2;

        const gradient = ctx.createLinearGradient(0, yPos, 0, yPos + calculatedHeight);
        if (state === 'speaking') {
          gradient.addColorStop(0, '#f43f5e'); // Rose
          gradient.addColorStop(0.5, accentColor);
          gradient.addColorStop(1, '#a855f7'); // Purple
        } else if (state === 'listening') {
          gradient.addColorStop(0, '#06b6d4'); // Cyan
          gradient.addColorStop(0.5, '#3b82f6'); // Blue
          gradient.addColorStop(1, accentColor);
        } else if (state === 'connecting') {
          gradient.addColorStop(0, '#eab308'); // Amber
          gradient.addColorStop(1, '#f97316'); // Orange
        } else {
          gradient.addColorStop(0, '#475569');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.shadowBlur = activeLevel > 0.1 ? 12 : 4;
        ctx.shadowColor = accentColor;

        // Rounded bar
        ctx.beginPath();
        ctx.roundRect(x, yPos, barWidth, calculatedHeight, 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, inputLevel, outputLevel, inputFrequencies, outputFrequencies, accentColor]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-4">
      <canvas
        ref={canvasRef}
        width={320}
        height={70}
        className="w-full max-w-xs h-16 rounded-xl backdrop-blur-md bg-slate-950/40 border border-slate-800/60 shadow-inner"
      />
    </div>
  );
};
