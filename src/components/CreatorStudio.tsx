import React, { useState } from 'react';
import { Proposal, MemoryPhoto, ProposalQuestion } from '../types';
import { saveProposal } from '../utils/api';
import { Plus, Trash2, Save, Share2, Copy, Check, MessageSquare, Heart, Lock, Music, Sparkles } from 'lucide-react';
import { synth } from '../utils/audioSynth';

interface CreatorStudioProps {
  currentProposal: Proposal;
  onSaved: (savedProposal: Proposal) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  currentProposal,
  onSaved
}) => {
  const [creatorName, setCreatorName] = useState(currentProposal.creatorName || '');
  const [crushName, setCrushName] = useState(currentProposal.crushName || '');
  const [creatorPin, setCreatorPin] = useState(currentProposal.creatorPin || '1234');
  const [title, setTitle] = useState(currentProposal.title || '');
  const [subTitle, setSubTitle] = useState(currentProposal.subTitle || '');
  const [photos, setPhotos] = useState<MemoryPhoto[]>(currentProposal.photos || []);
  const [questions, setQuestions] = useState<ProposalQuestion[]>(currentProposal.questions || []);
  const [letterTitle, setLetterTitle] = useState(currentProposal.finalLoveLetter?.title || '');
  const [letterBody, setLetterBody] = useState(currentProposal.finalLoveLetter?.body || '');
  const [letterSignature, setLetterSignature] = useState(currentProposal.finalLoveLetter?.signature || '');
  const [musicTrack, setMusicTrack] = useState<Proposal['musicTrack']>(currentProposal.musicTrack || 'romantic-melody');
  const [evasiveDifficulty, setEvasiveDifficulty] = useState<Proposal['evasiveDifficulty']>(currentProposal.evasiveDifficulty || 'playful');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedProposalId, setSavedProposalId] = useState<string>(currentProposal.id || 'default');

  // Photo handlers
  const handleAddPhoto = () => {
    const newP: MemoryPhoto = {
      id: `p_${Date.now()}`,
      url: `https://images.unsplash.com/photo-${1518199266791 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=800&q=80`,
      caption: 'A magical moment together',
      date: 'Our Special Day'
    };
    setPhotos([...photos, newP]);
  };

  const handleUpdatePhoto = (id: string, field: keyof MemoryPhoto, val: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  // Question handlers
  const handleAddQuestion = () => {
    const newQ: ProposalQuestion = {
      id: `q_${Date.now()}`,
      questionText: 'Kya tum mere saath date par chalogi? 🌸',
      subtitle: 'Somewhere cozy with candlelight...',
      options: ['Haan, absolutely! ❤️', 'Yes please! ✨'],
      allowNoOption: true,
      noButtonLabel: 'Nahi 😜'
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof ProposalQuestion, val: unknown) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: val } : q));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      synth.playPopSound();

      const payload: Partial<Proposal> = {
        id: currentProposal.id === 'default' ? undefined : currentProposal.id,
        creatorName,
        crushName,
        creatorPin,
        title,
        subTitle,
        photos,
        questions,
        finalLoveLetter: {
          title: letterTitle,
          body: letterBody,
          signature: letterSignature
        },
        musicTrack,
        evasiveDifficulty
      };

      const result = await saveProposal(payload);
      setSavedProposalId(result.proposalId);

      const updatedFull: Proposal = {
        ...currentProposal,
        ...payload,
        id: result.proposalId,
        creatorPin,
        finalLoveLetter: {
          title: letterTitle,
          body: letterBody,
          signature: letterSignature
        }
      } as Proposal;

      onSaved(updatedFull);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving proposal.');
    } finally {
      setIsSaving(false);
    }
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${savedProposalId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    synth.playPopSound();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Hey ${crushName || 'there'}! ❤️ I created a small secret interactive message just for you. Open this link and answer: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100">
        <div className="flex items-center justify-between border-b border-rose-100 pb-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-rose-950 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-rose-500" />
              <span>Proposal Studio & Customizer</span>
            </h2>
            <p className="text-xs text-rose-500">
              Customize questions, names, photos, secret PIN, and shareable link!
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Proposal saved successfully! Shareable link updated below.</span>
          </div>
        )}

        {/* Shareable Link Box */}
        <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 mb-8">
          <label className="block text-xs font-bold text-rose-800 mb-1.5 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-rose-500" />
            <span>Your Shareable Proposal Link for {crushName || 'Crush'}:</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-xs font-mono text-rose-900 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Section 1: Basic Info & Security PIN */}
        <div className="mb-8 space-y-4">
          <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider border-b border-rose-100 pb-1">
            1. Names & Secret PIN
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">Your Name (Creator)</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">Crush's Name</label>
              <input
                type="text"
                value={crushName}
                onChange={(e) => setCrushName(e.target.value)}
                placeholder="e.g. Simran"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-500" />
                <span>Secret PIN (To view Analytics)</span>
              </label>
              <input
                type="text"
                value={creatorPin}
                onChange={(e) => setCreatorPin(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950 focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Banner Title & Subtitle */}
        <div className="mb-8 space-y-4">
          <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider border-b border-rose-100 pb-1">
            2. Hero Banner Title
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">Main Heading</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A Special Secret Message For You... ❤️"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1">Subtitle / Greeting</label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="e.g. Take a small journey before you answer!"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Questions & Evasive No Button Settings */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-1">
            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">
              3. Proposal Questions ({questions.length})
            </h3>
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold bg-rose-50 px-3 py-1 rounded-xl border border-rose-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-0.5 rounded-lg border border-rose-100">
                    Q{qIdx + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-rose-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">Question Text</label>
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleUpdateQuestion(q.id, 'questionText', e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={q.subtitle || ''}
                      onChange={(e) => handleUpdateQuestion(q.id, 'subtitle', e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">Primary Yes Answer</label>
                    <input
                      type="text"
                      value={q.options[0] || ''}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[0] = e.target.value;
                        handleUpdateQuestion(q.id, 'options', newOpts);
                      }}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.allowNoOption ?? true}
                        onChange={(e) => handleUpdateQuestion(q.id, 'allowNoOption', e.target.checked)}
                        className="rounded text-rose-500 focus:ring-rose-400"
                      />
                      <span>Enable Evasive "No" Button</span>
                    </label>

                    {q.allowNoOption && (
                      <input
                        type="text"
                        value={q.noButtonLabel || 'Nahi 😜'}
                        onChange={(e) => handleUpdateQuestion(q.id, 'noButtonLabel', e.target.value)}
                        placeholder="No label"
                        className="w-28 bg-white border border-rose-200 rounded-xl px-2 py-1 text-xs text-rose-950"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Photo Memory Album */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-1">
            <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>4. Photo Memory Gallery ({photos.length})</span>
            </h3>
            <button
              onClick={handleAddPhoto}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-bold bg-rose-50 px-3 py-1 rounded-xl border border-rose-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo, idx) => (
              <div key={photo.id} className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-600">Photo #{idx + 1}</span>
                  <button onClick={() => handleRemovePhoto(photo.id)} className="text-rose-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">Image URL</label>
                  <input
                    type="text"
                    value={photo.url}
                    onChange={(e) => handleUpdatePhoto(photo.id, 'url', e.target.value)}
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">Caption</label>
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) => handleUpdatePhoto(photo.id, 'caption', e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-800 mb-0.5">Date / Tag</label>
                    <input
                      type="text"
                      value={photo.date || ''}
                      onChange={(e) => handleUpdatePhoto(photo.id, 'date', e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-1.5 text-xs text-rose-950"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Love Letter & Audio Settings */}
        <div className="mb-8 space-y-4">
          <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider border-b border-rose-100 pb-1">
            5. Final Love Letter & Atmosphere
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">Celebration Headline</label>
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">Love Letter Body Text</label>
                <textarea
                  rows={4}
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">Signature</label>
                <input
                  type="text"
                  value={letterSignature}
                  onChange={(e) => setLetterSignature(e.target.value)}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950"
                />
              </div>
            </div>

            <div className="space-y-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
              <div>
                <label className="block text-xs font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-rose-500" />
                  <span>Background Music Theme</span>
                </label>
                <select
                  value={musicTrack}
                  onChange={(e) => setMusicTrack(e.target.value as Proposal['musicTrack'])}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950"
                >
                  <option value="romantic-melody">Romantic Ambient Melody (Chords)</option>
                  <option value="sweet-box">Sweet Music Box Chime</option>
                  <option value="soft-piano">Soft Piano Atmosphere</option>
                  <option value="acoustic-vibes">Acoustic Romance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-800 mb-1">
                  Evasive "No" Button Difficulty
                </label>
                <select
                  value={evasiveDifficulty}
                  onChange={(e) => setEvasiveDifficulty(e.target.value as Proposal['evasiveDifficulty'])}
                  className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-950"
                >
                  <option value="playful">Playful (Smooth dodge + grows YES button)</option>
                  <option value="impossible">Impossible (Super fast evasion)</option>
                  <option value="teleport">Teleport Mode (Instantly jumps away)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer save button */}
        <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Update Proposal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
