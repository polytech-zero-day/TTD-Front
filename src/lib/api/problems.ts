import { apiFetch } from '@/lib/api/client';
import type { ProblemDetail, ProblemSummary } from '@/types/problem';

// ACTIVE 상태 문제만 내려온다 (draft/pending 제외)
export const fetchProblems = () => apiFetch<ProblemSummary[]>('/api/problems');

export const fetchProblem = (id: number) =>
  apiFetch<ProblemDetail>(`/api/problems/${id}`);
