import { apiFetch } from '@/lib/api/client';
import type {
  AdminProblem,
  CreateProblemInput,
  UpdateProblemInput,
  UpdateProblemStatusInput,
} from '@/types/problem';

export function fetchAdminProblems() {
  return apiFetch<AdminProblem[]>('/api/admin/problems');
}

export function fetchAdminProblem(id: number) {
  return apiFetch<AdminProblem>(`/api/admin/problems/${id}`);
}

export function createAdminProblem(input: CreateProblemInput) {
  return apiFetch<AdminProblem>('/api/admin/problems', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminProblem(id: number, input: UpdateProblemInput) {
  return apiFetch<AdminProblem>(`/api/admin/problems/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function updateAdminProblemStatus(
  id: number,
  input: UpdateProblemStatusInput
) {
  return apiFetch<AdminProblem>(`/api/admin/problems/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAdminProblem(id: number) {
  return apiFetch<void>(`/api/admin/problems/${id}`, { method: 'DELETE' });
}
