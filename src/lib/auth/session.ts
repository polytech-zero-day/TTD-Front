import { decodeJwtRole } from '@/lib/auth/jwt';
import type { UserRole } from '@/types/admin';
import type { TokenResponse } from '@/types/auth';

/*
 * 토큰은 새로고침 후에도 세션을 유지하기 위해 localStorage에 저장한다.
 * 트레이드오프: XSS로 스크립트가 주입되면 토큰이 노출될 수 있다(httpOnly 쿠키가 더 안전).
 * 팀 결정으로 localStorage 방식을 채택했고, 액세스 토큰 만료 시 apiFetch가 자동으로
 * /api/auth/refresh를 호출해 재발급받는다.
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

export function getRefreshToken(): string | null {
  return tokens?.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  return tokens !== null;
}

export function getCurrentUserRole(): UserRole | null {
  return tokens ? decodeJwtRole(tokens.accessToken) : null;
}
