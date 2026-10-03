import React, { useState } from 'react';
import { Settings, X, Key, Mic, Sparkles, Sliders, Volume2, Info, ShieldAlert } from 'lucide-react';
import { AssistantConfig, VoiceName } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AssistantConfig;
  onSave: (newConfig: AssistantConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [voiceName, setVoiceName] = useState<VoiceName>(config.voiceName);
  const [modelName, setModelName] = useState(config.modelName);
  const [systemInstruction, setSystemInstruction] = useState(config.systemInstruction);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apiKey,
      voiceName,
      modelName,
      systemInstruction,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow accent header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Assistant Configuration</h2>
              <p className="text-xs text-slate-400">Customize Roxy's live parameters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* API Key Input */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Key className="w-3.5 h-3.5 text-pink-400" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-slate-400" />
              Key stored locally in browser environment/session.
            </p>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Voice Persona
            </label>
            <select
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value as VoiceName)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-pink-500/60 transition-all cursor-pointer"
            >
              <option value="Aoede">Aoede (Female - Energetic & Charming)</option>
              <option value="Kore">Kore (Female - Relaxed & Soft)</option>
              <option value="Puck">Puck (Male - Playful & Lively)</option>
              <option value="Fenrir">Fenrir (Male - Deep & Confident)</option>
              <option value="Charon">Charon (Male - Deep & Calm)</option>
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Gemini Live Model
            </label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-pink-500/60 transition-all cursor-pointer font-mono text-xs"
            >
              <option value="gemini-3.1-flash-live-preview">gemini-3.1-flash-live-preview (Latest)</option>
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Experimental)</option>
            </select>
          </div>

          {/* System Instructions / Persona Prompt */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Persona Instruction
            </label>
            <textarea
              rows={4}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-pink-500/60 leading-relaxed font-sans"
            />
          </div>
        </form>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
