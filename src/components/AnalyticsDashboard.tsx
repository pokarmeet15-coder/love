import React, { useState, useEffect, useCallback } from 'react';
import { ProposalResponse } from '../types';
import { fetchProposalResponses } from '../utils/api';
import { Lock, Heart, CheckCircle2, MessageCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { synth } from '../utils/audioSynth';

interface AnalyticsDashboardProps {
  proposalId: string;
  defaultPin?: string;
  crushName?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  proposalId,
  defaultPin = '1234',
  crushName = 'Crush'
}) => {
  const [pin, setPin] = useState(defaultPin);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [responses, setResponses] = useState<ProposalResponse[]>([]);

  const loadData = useCallback(async (pinToUse: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await fetchProposalResponses(proposalId, pinToUse);
      setResponses(data.responses || []);
      setIsUnlocked(true);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Invalid PIN';
      setErrorMsg(msg);
      setIsUnlocked(false);
    } finally {
      setIsLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    if (defaultPin) {
      loadData(defaultPin);
    }
  }, [defaultPin, loadData]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    loadData(pin.trim());
  };

  const handleReplayConfetti = () => {
    synth.playCelebrationFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#ec4899', '#ffffff', '#fbbf24']
    });
  };

  if (!isUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-rose-100 text-center">
          <div className="w-14 h-14 bg-rose-100 rounded-2xl text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-rose-950 mb-1">Creator PIN Required</h3>
          <p className="text-xs text-rose-500 mb-6">
            Enter your secret PIN to unlock {crushName}'s response analytics!
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                className="w-full bg-rose-50/60 border border-rose-200 rounded-2xl px-4 py-3 text-center text-sm font-mono text-rose-950 focus:outline-none focus:border-rose-400"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 rounded-2xl text-xs shadow-md transition-all active:scale-95"
            >
              {isLoading ? 'Verifying...' : 'Unlock Analytics'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-rose-100 pb-4 mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Unlocked Analytics Dashboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-rose-950">
              {crushName}'s Live Responses & Results
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(pin)}
              disabled={isLoading}
              className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
              title="Refresh Answers"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleReplayConfetti}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrate! 🎉</span>
            </button>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="text-center py-12 bg-rose-50/50 rounded-2xl border border-rose-100">
            <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-rose-900 mb-1">No Answers Submitted Yet</h4>
            <p className="text-xs text-rose-500 max-w-sm mx-auto">
              Share your proposal link with {crushName}. As soon as she completes the questions, her answers will appear right here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((resp, idx) => (
              <div
                key={resp.id || idx}
                className="bg-gradient-to-br from-rose-50/80 to-pink-50/50 p-6 rounded-2xl border border-rose-200/80 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-rose-200/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-rose-950">
                        {resp.crushName || crushName} Said YES! 🎉❤️
                      </h4>
                      <p className="text-[11px] text-rose-500 font-medium">
                        Submitted on {new Date(resp.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
                    STATUS: SAID YES
                  </span>
                </div>

                {/* Answers List */}
                <div className="space-y-2 mb-4">
                  <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                    Question Answers Breakdown
                  </h5>

                  {resp.answers && resp.answers.length > 0 ? (
                    resp.answers.map((ans, aIdx) => (
                      <div
                        key={aIdx}
                        className="bg-white p-3 rounded-xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                      >
                        <span className="font-semibold text-rose-900">{ans.questionText}</span>
                        <div className="flex items-center gap-2">
                          {ans.noAttempts > 0 && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                              Dodged NO {ans.noAttempts}x 😜
                            </span>
                          )}
                          <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            {ans.selectedAnswer}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-rose-400 italic">All questions answered!</p>
                  )}
                </div>

                {/* Love Note */}
                {resp.loveNote && (
                  <div className="bg-white p-4 rounded-xl border border-rose-200 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>Personal Love Note from {resp.crushName || crushName}:</span>
                    </div>
                    <p className="text-xs font-medium text-rose-950 italic bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                      "{resp.loveNote}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
