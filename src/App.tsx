import { useState, useEffect } from 'react';
import { Proposal, QuestionAnswer } from './types';
import { fetchProposal } from './utils/api';
import { FloatingHeartsCanvas } from './components/FloatingHeartsCanvas';
import { Navbar } from './components/Navbar';
import { ProposalQuestionnaire } from './components/ProposalQuestionnaire';
import { ProposalFinale } from './components/ProposalFinale';
import { CreatorStudio } from './components/CreatorStudio';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { RefreshCw, Heart } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'proposal' | 'studio' | 'analytics'>('proposal');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Completed questionnaire state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<QuestionAnswer[]>([]);

  // Detect URL parameter ?id=...
  const urlParams = new URLSearchParams(window.location.search);
  const proposalIdFromUrl = urlParams.get('id') || 'default';

  useEffect(() => {
    loadProposalData(proposalIdFromUrl);
  }, [proposalIdFromUrl]);

  const loadProposalData = async (id: string) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await fetchProposal(id);
      setProposal(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load proposal. Displaying default template.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposalComplete = (answers: QuestionAnswer[], _saidYes: boolean) => {
    setSubmittedAnswers(answers);
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setSubmittedAnswers([]);
  };

  const handleSavedStudioProposal = (savedProposal: Proposal) => {
    setProposal(savedProposal);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-rose-200 flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl flex items-center gap-3 border border-rose-200">
          <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
          <span className="text-sm font-bold text-rose-900">Preparing secret proposal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 text-rose-950 font-sans relative selection:bg-rose-200 flex flex-col">
      {/* Background Floating Hearts Particle Effect */}
      <FloatingHeartsCanvas />

      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view === 'proposal') {
            // Keep completion state intact or reset if switching back
          }
        }}
        proposalId={proposal?.id || proposalIdFromUrl}
        musicTrack={proposal?.musicTrack || 'romantic-melody'}
      />

      {/* Error alert fallback */}
      {errorMsg && (
        <div className="max-w-md mx-auto mt-4 px-4 py-2 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded-2xl text-center">
          {errorMsg}
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 relative z-10 pb-12">
        {activeView === 'proposal' && (
          <>
            {!isCompleted && proposal ? (
              <ProposalQuestionnaire
                proposal={proposal}
                onComplete={handleProposalComplete}
              />
            ) : proposal ? (
              <ProposalFinale
                proposal={proposal}
                answers={submittedAnswers}
                onRestart={handleRestart}
              />
            ) : null}
          </>
        )}

        {activeView === 'studio' && proposal && (
          <CreatorStudio
            currentProposal={proposal}
            onSaved={handleSavedStudioProposal}
          />
        )}

        {activeView === 'analytics' && proposal && (
          <AnalyticsDashboard
            proposalId={proposal.id}
            defaultPin={proposal.creatorPin}
            crushName={proposal.crushName}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-rose-500 font-medium border-t border-rose-200/50 bg-white/40 backdrop-blur-xs">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for romantic moments
        </p>
      </footer>
    </div>
  );
}
