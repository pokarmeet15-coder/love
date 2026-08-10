import React, { useState } from 'react';
import { Proposal, QuestionAnswer } from '../types';
import { EvasiveButton } from './EvasiveButton';
import { Heart, Sparkles, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/audioSynth';
import { PhotoGalleryModal } from './PhotoGalleryModal';
import { MemoryCard } from './MemoryCard';

interface ProposalQuestionnaireProps {
  proposal: Proposal;
  onComplete: (answers: QuestionAnswer[], saidYes: boolean) => void;
}

export const ProposalQuestionnaire: React.FC<ProposalQuestionnaireProps> = ({
  proposal,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [noAttemptsMap, setNoAttemptsMap] = useState<Record<string, number>>({});
  const [yesScaleMultiplier, setYesScaleMultiplier] = useState<number>(1);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const questions = proposal.questions || [];
  const currentQ = questions[currentStep];

  const handleSelectAnswer = (optionText: string) => {
    synth.playPopSound();

    const noAttempts = noAttemptsMap[currentQ.id] || 0;
    const newAnswer: QuestionAnswer = {
      questionId: currentQ.id,
      questionText: currentQ.questionText,
      selectedAnswer: optionText,
      noAttempts
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setYesScaleMultiplier(1); // Reset scale for next question

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Completed all questions!
      onComplete(updatedAnswers, true);
    }
  };

  const handleAttemptNo = () => {
    if (!currentQ) return;
    setNoAttemptsMap((prev) => {
      const currentCount = prev[currentQ.id] || 0;
      return { ...prev, [currentQ.id]: currentCount + 1 };
    });

    // Make the YES button bigger every time she tries to click NO!
    setYesScaleMultiplier((prev) => Math.min(prev + 0.15, 2.2));
  };

  if (!currentQ) return null;

  const currentNoCount = noAttemptsMap[currentQ.id] || 0;
  const isFinalQuestion = currentStep === questions.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        photos={proposal.photos}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Hero Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-900/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>A Special Message For {proposal.crushName}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">
          {proposal.title}
        </h2>
        <p className="text-rose-100 text-xs sm:text-sm font-medium max-w-md mx-auto">
          {proposal.subTitle}
        </p>

        {proposal.photos && proposal.photos.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-rose-600 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-rose-50 transition-all shadow-sm active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-rose-500" />
              <span>View Our Memory Gallery ({proposal.photos.length})</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Memory Preview Cards (If photos present) */}
      {proposal.photos && proposal.photos.length > 0 && currentStep === 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>A Few Special Moments</span>
            </h3>
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              See All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {proposal.photos.slice(0, 3).map((photo, idx) => (
              <MemoryCard key={photo.id} photo={photo} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Questionnaire Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 relative">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 mb-2">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-rose-100 h-2.5 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full"
              animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Question Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-2"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-2xl text-rose-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Heart className={`w-6 h-6 fill-rose-500 ${isFinalQuestion ? 'animate-bounce' : ''}`} />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-rose-950 mb-2 leading-snug">
              {currentQ.questionText}
            </h3>

            {currentQ.subtitle && (
              <p className="text-xs sm:text-sm text-rose-500 mb-6 font-medium max-w-md mx-auto">
                {currentQ.subtitle}
              </p>
            )}

            {/* Answer Options */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 flex-wrap">
              {currentQ.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  id={`option-${currentStep}-${idx}`}
                  style={{ transform: `scale(${idx === 0 ? yesScaleMultiplier : 1})` }}
                  onClick={() => handleSelectAnswer(option)}
                  whileHover={{ scale: (idx === 0 ? yesScaleMultiplier : 1) * 1.05 }}
                  whileTap={{ scale: (idx === 0 ? yesScaleMultiplier : 1) * 0.95 }}
                  className="w-full sm:w-auto min-w-[200px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-rose-300"
                >
                  <span>{option}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              ))}

              {/* Evasive No Option */}
              {currentQ.allowNoOption && (
                <EvasiveButton
                  label={currentQ.noButtonLabel || 'Nahi 🙈'}
                  onAttemptNo={handleAttemptNo}
                  noCount={currentNoCount}
                  difficulty={proposal.evasiveDifficulty}
                />
              )}
            </div>

            {currentNoCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-rose-400 font-semibold mt-4 italic"
              >
                No button dodged {currentNoCount} time{currentNoCount > 1 ? 's' : ''}! 😜
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
