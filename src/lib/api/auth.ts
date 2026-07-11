import { apiFetch } from '@/lib/api/client';
import { clearTokens, setTokens } from '@/lib/auth/session';
import type { AdminUser } from '@/types/admin';
import type { LoginInput, SignupInput, TokenResponse } from '@/types/auth';

export async function login(input: LoginInput): Promise<TokenResponse> {
  const tokenResponse = await apiFetch<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setTokens(tokenResponse);
  return tokenResponse;
}

export function signup(input: SignupInput) {
  return apiFetch<AdminUser>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// 액세스 토큰 만료 시 재발급은 apiFetch(client.ts)가 401을 감지해 자동 처리한다.

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>('/api/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}
