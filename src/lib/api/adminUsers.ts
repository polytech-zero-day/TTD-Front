import { apiFetch } from '@/lib/api/client';
import type {
  AdminUser,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from '@/types/admin';

export function fetchAdminUsers() {
  return apiFetch<AdminUser[]>('/api/admin/users');
}

export function createAdminUser(input: CreateAdminUserInput) {
  return apiFetch<AdminUser>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateAdminUser(id: number, input: UpdateAdminUserInput) {
  return apiFetch<AdminUser>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteAdminUser(id: number) {
  return apiFetch<void>(`/api/admin/users/${id}`, { method: 'DELETE' });
}
