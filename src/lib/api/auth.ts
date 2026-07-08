import { apiFetch } from '@/lib/api/client';
import { clearTokens, getRefreshToken, setTokens } from '@/lib/auth/session';
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

export async function refreshSession(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('갱신할 세션이 없습니다.');

  const tokenResponse = await apiFetch<TokenResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  setTokens(tokenResponse);
  return tokenResponse;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>('/api/auth/logout', { method: 'POST' });
  } finally {
    clearTokens();
  }
}
