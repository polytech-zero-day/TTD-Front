import type { TokenResponse } from '@/types/auth';

/*
 * 액세스/리프레시 토큰은 XSS 시 탈취 위험이 있는 localStorage/sessionStorage에
 * 저장하지 않는다 (harness/security.md). 메모리(모듈 스코프 변수)에만 두고,
 * 새로고침 시에는 /api/auth/refresh로 재발급받는 흐름을 전제로 한다.
 */
let tokens: TokenResponse | null = null;

export function setTokens(next: TokenResponse) {
  tokens = next;
}

export function clearTokens() {
  tokens = null;
}

export function getAccessToken(): string | null {
  return tokens?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return tokens?.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  return tokens !== null;
}
