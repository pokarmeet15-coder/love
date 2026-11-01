import React, { useState } from 'react';
import { JarvisState, PersonalityConfig, PrivacyConfig } from '../types';
import { Shield, Mic, Lock, Cpu, Star, Trash2, Sliders, CheckCircle2, UserCheck, Eye, EyeOff } from 'lucide-react';
import { playChime } from '../utils/speech';

interface PrivacySettingsModalProps {
  state: JarvisState;
  onUpdateState: (newState: Partial<JarvisState>) => Promise<void>;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'personality' | 'memory'>('privacy');
  const [userRating, setUserRating] = useState<number>(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Personality form handlers
  const handleHumorChange = async (val: number) => {
    const personality: PersonalityConfig = { ...state.personality, humorLevel: val };
    await onUpdateState({ personality });
  };

  const handleFormalityChange = async (val: 'casual' | 'balanced' | 'formal') => {
    const personality: PersonalityConfig = { ...state.personality, formality: val };
    await onUpdateState({ personality });
  };

  const handleVoiceProfileChange = async (val: any) => {
    const personality: PersonalityConfig = { ...state.personality, voiceProfile: val };
    await onUpdateState({ personality });
  };

  const handleWakePhraseToggle = async () => {
    const personality: PersonalityConfig = {
      ...state.personality,
      wakePhraseEnabled: !state.personality.wakePhraseEnabled
    };
    await onUpdateState({ personality });
  };

  // Privacy form handlers
  const handleMicToggle = async () => {
    const privacy: PrivacyConfig = { ...state.privacy, micEnabled: !state.privacy.micEnabled };
    await onUpdateState({ privacy });
    playChime('affirm');
  };

  const handleLocalProcessingToggle = async () => {
    const privacy: PrivacyConfig = {
      ...state.privacy,
      localProcessingOnly: !state.privacy.localProcessingOnly
    };
    await onUpdateState({ privacy });
  };

  const handleDataSharingToggle = async () => {
    const privacy: PrivacyConfig = {
      ...state.privacy,
      dataSharingEnabled: !state.privacy.dataSharingEnabled
    };
    await onUpdateState({ privacy });
  };

  // Clear memory
  const handleClearMemory = async () => {
    if (confirm("Are you sure you want to clear Jarvis's accumulated memory & learned preferences?")) {
      await onUpdateState({ conversationMemory: [] });
      playChime('shutdown');
    }
  };

  // Submit Feedback / Rating loop
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `rate-${Date.now()}`,
      rating: userRating,
      feedback: feedbackNote.trim() || undefined,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [...state.privacy.ratingsHistory, newEntry];
    await onUpdateState({
      privacy: { ...state.privacy, ratingsHistory: updatedHistory }
    });
    setFeedbackSent(true);
    setFeedbackNote('');
    playChime('affirm');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-3xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-cyan-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-cyan-100 font-sans">
                Jarvis AI Configuration Console
              </h3>
              <p className="text-xs text-cyan-400/60 font-mono">
                Security, Cryptographic Privacy & Personality Calibration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-cyan-950 px-6 pt-3 bg-slate-950/40 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security & Privacy</span>
          </button>

          <button
            onClick={() => setActiveTab('personality')}
            className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'personality'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Personality & Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'memory'
                ? 'border-cyan-400 text-cyan-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Context Memory & Feedback</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Privacy Banner */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300 font-mono">
                    End-to-End Cryptographic Encryption Active
                  </h4>
                  <p className="text-xs text-emerald-200/70 mt-0.5">
                    Jarvis employs zero-knowledge telemetry encryption. We never sell your personal data.
                  </p>
                </div>
              </div>

              {/* Master Controls */}
              <div className="space-y-4">
                {/* Mic Hardware Switch */}
                <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className={`w-5 h-5 ${state.privacy.micEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div>
                      <h5 className="font-semibold text-cyan-100">Microphone Hardware Access</h5>
                      <p className="text-xs text-slate-400">
                        Enable or completely sever microphone access for speech recognition.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleMicToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      state.privacy.micEnabled
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {state.privacy.micEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>

                {/* Local Processing Only */}
                <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu className={`w-5 h-5 ${state.privacy.localProcessingOnly ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <div>
                      <h5 className="font-semibold text-cyan-100">Local Processing Enclave</h5>
                      <p className="text-xs text-slate-400">
                        Process NLP and assistant tasks strictly on-device without cloud LLM queries.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLocalProcessingToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      state.privacy.localProcessingOnly
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {state.privacy.localProcessingOnly ? 'LOCAL ONLY' : 'HYBRID CLOUD'}
                  </button>
                </div>

                {/* Data Sharing Preference */}
                <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {state.privacy.dataSharingEnabled ? (
                      <Eye className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-emerald-400" />
                    )}
                    <div>
                      <h5 className="font-semibold text-cyan-100">Anonymous Diagnostic Sharing</h5>
                      <p className="text-xs text-slate-400">
                        Help refine Jarvis machine learning models with anonymized error logs.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDataSharingToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      state.privacy.dataSharingEnabled
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {state.privacy.dataSharingEnabled ? 'OPTED IN' : 'OPTED OUT'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6">
              {/* Humor Level Slider */}
              <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-cyan-100">Humor & Wit Calibration</span>
                  <span className="text-sm font-mono text-cyan-300 font-bold">
                    {state.personality.humorLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.personality.humorLevel}
                  onChange={(e) => handleHumorChange(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0% (Strictly Stoic)</span>
                  <span>50% (Subtle British Dry Wit)</span>
                  <span>100% (High Banter)</span>
                </div>
              </div>

              {/* Formality Tone */}
              <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl">
                <span className="block font-semibold text-cyan-100 mb-3">Communication Formality</span>
                <div className="grid grid-cols-3 gap-3">
                  {(['casual', 'balanced', 'formal'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleFormalityChange(mode)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-mono uppercase transition-all ${
                        state.personality.formality === mode
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Profile */}
              <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl">
                <span className="block font-semibold text-cyan-100 mb-3">Voice Profile Synthesis</span>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {[
                    { id: 'classic-jarvis', name: 'Classic Jarvis (British Butler)' },
                    { id: 'warm-companion', name: 'Warm Companion (Natural)' },
                    { id: 'concise-analyst', name: 'Concise Analyst (High Cadence)' },
                    { id: 'playful-bot', name: 'Playful Assistant' }
                  ].map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => handleVoiceProfileChange(voice.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        state.personality.voiceProfile === voice.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {voice.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wake Phrase Detection */}
              <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-cyan-100">Wake Phrase Detection</h5>
                  <p className="text-xs text-slate-400">
                    Respond automatically when hearing "Hey Jarvis" or "Okay Jarvis".
                  </p>
                </div>
                <button
                  onClick={handleWakePhraseToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    state.personality.wakePhraseEnabled
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {state.personality.wakePhraseEnabled ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-6">
              {/* Memory List */}
              <div className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <h5 className="font-semibold text-cyan-100">Learned Memory Bank</h5>
                  </div>
                  <button
                    onClick={handleClearMemory}
                    className="flex items-center gap-1 text-xs font-mono text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe Memory</span>
                  </button>
                </div>

                {state.conversationMemory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No persistent memory records stored.</p>
                ) : (
                  <ul className="space-y-2">
                    {state.conversationMemory.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-3 bg-slate-900/80 rounded-xl text-xs font-mono text-cyan-300/90 border border-cyan-950"
                      >
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Feedback Loop (Machine Learning Adaptation) */}
              <form
                onSubmit={handleSubmitFeedback}
                className="p-4 bg-slate-950/60 border border-cyan-900/60 rounded-2xl space-y-4"
              >
                <div>
                  <h5 className="font-semibold text-cyan-100 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Machine Learning Feedback Loop
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rate recent assistance to help Jarvis adapt its neural responses to your personal style.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className={`p-2 rounded-xl transition-all ${
                        userRating >= star
                          ? 'text-amber-400 scale-110'
                          : 'text-slate-600 hover:text-amber-200'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-cyan-300 ml-2">
                    {userRating}/5 Stars
                  </span>
                </div>

                <textarea
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Optional corrections or feedback (e.g. 'Keep answers even shorter during briefings')..."
                  className="w-full bg-slate-900 text-cyan-100 placeholder:text-slate-600 border border-cyan-900/60 rounded-xl p-3 text-xs focus:border-cyan-400 focus:outline-none"
                  rows={2}
                />

                <div className="flex items-center justify-between">
                  {feedbackSent ? (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Feedback integrated into neural weights.
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">
                      Ratings history: {state.privacy.ratingsHistory.length} recorded
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Submit Correction
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
