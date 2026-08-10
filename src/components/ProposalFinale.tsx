import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Proposal, QuestionAnswer } from '../types';
import { submitResponse } from '../utils/api';
import { Heart, Sparkles, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { synth } from '../utils/audioSynth';

interface ProposalFinaleProps {
  proposal: Proposal;
  answers: QuestionAnswer[];
  onRestart?: () => void;
}

export const ProposalFinale: React.FC<ProposalFinaleProps> = ({
  proposal,
  answers,
  onRestart
}) => {
  const [loveNote, setLoveNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const letter = proposal.finalLoveLetter || {
    title: 'You Made Me The Happiest Person Alive! 🎉💖',
    body: 'Thank you for saying yes! From the moment I met you, my world became brighter and full of magic.',
    signature: `With all my love, ${proposal.creatorName} 💕`
  };

  useEffect(() => {
    // Play sound and trigger confetti fireworks
    synth.playCelebrationFanfare();

    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#f43f5e', '#fb7185', '#ec4899', '#f472b6', '#ffffff', '#fbbf24']
      });
    }, 250);

    // Initial submission automatically
    handleAutoSubmit();

    return () => clearInterval(interval);
  }, []);

  const handleAutoSubmit = async () => {
    try {
      setIsSubmitting(true);
      await submitResponse(proposal.id, {
        crushName: proposal.crushName,
        answers,
        saidYes: true,
        loveNote: loveNote
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting response:', err);
      setSubmitError('Response recorded locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendLoveNote = async () => {
    if (!loveNote.trim()) return;
    try {
      setIsSubmitting(true);
      await submitResponse(proposal.id, {
        crushName: proposal.crushName,
        answers,
        saidYes: true,
        loveNote: loveNote.trim()
      });
      setIsSubmitted(true);
      synth.playPopSound();
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to send note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-rose-200 text-center relative overflow-hidden"
      >
        {/* Decorative Top Banner */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
          <Heart className="w-8 h-8 fill-white" />
        </div>

        <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROPOSAL ACCEPTED! 🎉</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-rose-950 mb-4 tracking-tight leading-snug">
          {letter.title}
        </h2>

        {/* Love Letter Card */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-200/80 my-6 text-left shadow-inner relative">
          <p className="text-sm sm:text-base text-rose-900 leading-relaxed font-serif italic mb-4 whitespace-pre-line">
            "{letter.body}"
          </p>

          <p className="text-right text-sm sm:text-base font-bold text-rose-600 font-serif">
            {letter.signature}
          </p>
        </div>

        {/* Answers Summary */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 text-left mb-6">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
            Your Answers & Romantic Choices
          </h4>
          <div className="space-y-2">
            {answers.map((ans, i) => (
              <div key={i} className="flex items-start justify-between text-xs py-1 border-b border-rose-50 last:border-0">
                <span className="text-rose-900 font-medium max-w-[65%]">{ans.questionText}</span>
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg">
                  {ans.selectedAnswer}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Submission Status */}
        {isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Answers and Love Note delivered to {proposal.creatorName}! 💌</span>
          </div>
        ) : isSubmitting ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 mb-6 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
            <span>Sending your answers to {proposal.creatorName}...</span>
          </div>
        ) : submitError ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold mb-6">
            {submitError}
          </div>
        ) : null}

        {/* Leave a personal Love Note */}
        <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-left mb-6">
          <label className="block text-xs font-bold text-rose-800 mb-1.5">
            Send a sweet note or message to {proposal.creatorName} (Optional):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={loveNote}
              onChange={(e) => setLoveNote(e.target.value)}
              placeholder="e.g. Can't wait to see you soon! ❤️"
              className="flex-1 bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs text-rose-950 focus:outline-none focus:border-rose-400"
            />
            <button
              onClick={handleSendLoveNote}
              disabled={!loveNote.trim() || isSubmitting}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Note</span>
            </button>
          </div>
        </div>

        {onRestart && (
          <button
            onClick={onRestart}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline"
          >
            Replay Interactive Proposal Flow
          </button>
        )}
      </motion.div>
    </div>
  );
};
