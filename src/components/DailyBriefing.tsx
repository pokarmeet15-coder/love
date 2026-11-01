import React, { useState, useEffect } from 'react';
import { DailyBriefingData, JarvisState } from '../types';
import { Sun, CloudRain, Wind, Compass, AlertTriangle, Calendar, Newspaper, BellRing, Sparkles, Volume2, RefreshCw } from 'lucide-react';
import { playJarvisSpeech } from '../utils/speech';

interface DailyBriefingProps {
  state: JarvisState;
  onClose?: () => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({ state }) => {
  const [briefing, setBriefing] = useState<DailyBriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/briefing');
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error('Failed to load briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  const handleReadBriefing = () => {
    if (!briefing) return;
    setIsSpeaking(true);
    const spokenText = `${briefing.greeting} The current temperature in ${briefing.weather.city} is ${briefing.weather.temp} degrees, ${briefing.weather.condition}. For traffic, your commute on ${briefing.traffic.route} will take ${briefing.traffic.commuteTimeMin} minutes, with a ${briefing.traffic.delayMin} minute delay. You have ${briefing.schedule.length} scheduled engagements today.`;
    playJarvisSpeech(spokenText, state.personality.voiceProfile, () => {
      setIsSpeaking(false);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-cyan-300 font-mono text-sm">Synthesizing morning telemetry & briefings...</p>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>DAILY INTELLIGENCE BRIEFING • PROACTIVE PROTOCOL</span>
          </div>
          <h2 className="text-2xl font-bold text-cyan-50 font-sans tracking-wide">
            {briefing.greeting}
          </h2>
          <p className="text-sm text-cyan-300/80 mt-1">
            All atmospheric, commute, and schedule parameters synchronized for your day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBriefing}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 rounded-2xl border border-cyan-500/30 transition-all font-mono text-xs flex items-center gap-1.5"
            title="Refresh Briefing Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleReadBriefing}
            className={`px-4 py-3 rounded-2xl font-mono text-xs font-semibold flex items-center gap-2 border transition-all ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeaking ? 'Narrating Briefing...' : 'Read Aloud'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Briefing Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              Meteorology
            </span>
            <span className="text-xs font-mono text-slate-400">{briefing.weather.city}</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black text-cyan-100">{briefing.weather.temp}°</span>
            <span className="text-sm font-mono text-cyan-400">FAHRENHEIT</span>
          </div>
          <p className="text-sm text-cyan-200/90 mb-4">{briefing.weather.condition}</p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-cyan-900/60">
            <div className="flex items-center gap-1 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>High: {briefing.weather.high}°F</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>Low: {briefing.weather.low}°F</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Breeze: 9 mph</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Humidity: 48%</span>
            </div>
          </div>
        </div>

        {/* Traffic & Commute Alert */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              Transit & Commute
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              +{briefing.traffic.delayMin}m delay
            </span>
          </div>

          <h4 className="text-base font-bold text-cyan-100 mb-1">
            {briefing.traffic.route}
          </h4>
          <div className="text-3xl font-extrabold text-cyan-300 mb-3 font-mono">
            {briefing.traffic.commuteTimeMin} <span className="text-sm font-sans font-normal text-slate-400">minutes total</span>
          </div>

          {briefing.traffic.alert && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl mb-3 flex items-start gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{briefing.traffic.alert}</span>
            </div>
          )}

          {briefing.traffic.alternateRoute && (
            <div className="text-xs font-mono text-emerald-400 pt-2 border-t border-cyan-900/60">
              Alternate: {briefing.traffic.alternateRoute}
            </div>
          )}
        </div>

        {/* Contextual Smart Reminder */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-pink-400" />
              Contextual Prompt
            </span>
            <span className="text-xs font-mono text-slate-400">Habit Engine</span>
          </div>

          <h4 className="text-sm font-semibold text-cyan-200 mb-2">
            Proactive Suggestion For Today:
          </h4>
          <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-sm text-cyan-100 font-sans leading-relaxed mb-4">
            "{briefing.contextualReminder}"
          </div>

          <p className="text-xs text-cyan-400/60 font-mono">
            Jarvis analyzes your schedule and previous interactions to suggest optimal time windows for high-focus tasks.
          </p>
        </div>
      </div>

      {/* Schedule & Headlines Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              Today's Agenda ({briefing.schedule.length} Events)
            </span>
          </div>

          <div className="space-y-3">
            {briefing.schedule.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 bg-slate-950/70 border border-cyan-900/60 rounded-2xl flex items-center justify-between hover:border-cyan-500/40 transition-colors"
              >
                <div>
                  <h5 className="font-semibold text-cyan-100 text-sm">{evt.title}</h5>
                  <p className="text-xs text-cyan-400/70 font-mono mt-0.5">
                    {evt.time} {evt.location ? `• ${evt.location}` : ''}
                  </p>
                </div>
                {evt.attendees && evt.attendees.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {evt.attendees.length} Attendees
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global Headlines */}
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-teal-400" />
              Verified Morning Wire
            </span>
          </div>

          <div className="space-y-3">
            {briefing.headlines.map((headline, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/70 border border-cyan-900/60 rounded-2xl flex items-start gap-3 hover:border-cyan-500/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <p className="text-sm text-cyan-100/90 leading-relaxed">{headline}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
