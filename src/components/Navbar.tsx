import React, { useState } from 'react';
import { Heart, Music, Music2, Share2, Sparkles, Settings2, BarChart2, Check } from 'lucide-react';
import { synth } from '../utils/audioSynth';

interface NavbarProps {
  activeView: 'proposal' | 'studio' | 'analytics';
  setActiveView: (view: 'proposal' | 'studio' | 'analytics') => void;
  proposalId: string;
  musicTrack?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  proposalId,
  musicTrack = 'romantic-melody'
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleMusic = () => {
    const newState = synth.toggleMusic(musicTrack);
    setIsPlayingMusic(newState);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${proposalId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    synth.playPopSound();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <div 
          onClick={() => setActiveView('proposal')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent leading-tight">
              LoveProposal
            </h1>
            <p className="text-[11px] text-rose-400 font-medium">Romantic Experience</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-rose-50/80 p-1 rounded-2xl border border-rose-100/80">
          <button
            id="nav-proposal-btn"
            onClick={() => setActiveView('proposal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'proposal'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-100/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proposal</span>
          </button>

          <button
            id="nav-studio-btn"
            onClick={() => setActiveView('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'studio'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-100/50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            id="nav-analytics-btn"
            onClick={() => setActiveView('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'analytics'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md scale-105'
                : 'text-rose-700 hover:text-rose-900 hover:bg-rose-100/50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Romantic Music Toggle */}
          <button
            id="music-toggle-btn"
            onClick={handleToggleMusic}
            title={isPlayingMusic ? 'Mute romantic background music' : 'Play romantic music'}
            className={`p-2 rounded-2xl border transition-all ${
              isPlayingMusic
                ? 'bg-rose-100 border-rose-300 text-rose-600 shadow-inner animate-bounce'
                : 'bg-white border-rose-200 text-rose-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            {isPlayingMusic ? <Music className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
          </button>

          {/* Quick Share Link */}
          <button
            id="share-link-btn"
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold hover:bg-rose-100 transition-all active:scale-95 shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
