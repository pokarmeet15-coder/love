export interface MemoryPhoto {
  id: string;
  url: string;
  caption: string;
  date?: string;
}

export interface ProposalQuestion {
  id: string;
  questionText: string;
  subtitle?: string;
  options: string[];
  allowNoOption?: boolean;
  noButtonLabel?: string;
}

export interface FinalLoveLetter {
  title: string;
  body: string;
  signature: string;
}

export interface Proposal {
  id: string;
  creatorName: string;
  crushName: string;
  creatorPin: string; // Secret PIN to view responses in Analytics
  title: string;
  subTitle: string;
  photos: MemoryPhoto[];
  questions: ProposalQuestion[];
  finalLoveLetter: FinalLoveLetter;
  musicTrack: 'romantic-melody' | 'soft-piano' | 'acoustic-vibes' | 'sweet-box';
  evasiveDifficulty: 'playful' | 'impossible' | 'teleport';
  createdAt: string;
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  noAttempts: number;
}

export interface ProposalResponse {
  id: string;
  proposalId: string;
  crushName: string;
  submittedAt: string;
  answers: QuestionAnswer[];
  saidYes: boolean;
  loveNote?: string;
}
