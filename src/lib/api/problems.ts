import { apiFetch } from '@/lib/api/client';
import type { ProblemDetail } from '@/types/problem';

export const fetchProblem = (id: number) =>
  apiFetch<ProblemDetail>(`/api/problems/${id}`);
