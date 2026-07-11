import { decodeJwtRole } from '@/lib/auth/jwt';
import type { UserRole } from '@/types/admin';
import type { TokenResponse } from '@/types/auth';

/*
 * 단기 access token만 새로고침 유지를 위해 localStorage에 저장한다.
 * 장기 refresh token은 서버가 HttpOnly 쿠키로만 관리해 JavaScript에서 접근할 수 없다.
 */
const STORAGE_KEY = 'ttd.tokens';

function load(): TokenResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenResponse) : null;
  } catch {
    return null;
  }
}

let tokens: TokenResponse | null = load();

export function setTokens(next: TokenResponse) {
  tokens = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패(사생활 보호 모드 등)해도 메모리 세션은 유지 */
  }
}

export function clearTokens() {
  tokens = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | null {
  return tokens?.accessToken ?? null;
}

export function isAuthenticated(): boolean {
  return tokens !== null;
}

export function getCurrentUserRole(): UserRole | null {
  return tokens ? decodeJwtRole(tokens.accessToken) : null;
}
