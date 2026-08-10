import { Proposal, ProposalResponse } from '../types';

export async function fetchProposal(id: string = 'default'): Promise<Proposal> {
  const res = await fetch(`/api/proposal/${id}`);
  if (!res.ok) {
    throw new Error('Failed to load proposal');
  }
  return res.json();
}

export async function saveProposal(proposalData: Partial<Proposal>): Promise<{ proposalId: string; creatorPin: string }> {
  const res = await fetch('/api/proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposalData),
  });
  if (!res.ok) {
    throw new Error('Failed to save proposal');
  }
  return res.json();
}

export async function submitResponse(proposalId: string, responseData: {
  crushName: string;
  answers: Array<{ questionId: string; questionText: string; selectedAnswer: string; noAttempts: number }>;
  saidYes: boolean;
  loveNote?: string;
}): Promise<{ responseId: string }> {
  const res = await fetch(`/api/proposal/${proposalId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responseData),
  });
  if (!res.ok) {
    throw new Error('Failed to submit proposal response');
  }
  return res.json();
}

export async function fetchProposalResponses(proposalId: string, pin: string): Promise<{
  proposalId: string;
  proposalTitle: string;
  crushName: string;
  creatorName: string;
  responses: ProposalResponse[];
}> {
  const res = await fetch(`/api/proposal/${proposalId}/responses?pin=${encodeURIComponent(pin)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Invalid PIN or unauthorized');
  }
  return res.json();
}
