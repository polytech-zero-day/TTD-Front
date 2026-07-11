import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/session';
import type { TokenResponse } from '@/types/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  message?: string;
}

export class ApiError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.errorCode = errorCode;
  }
}

/** ApiError면 서버 메시지를, 아니면 fallback을 반환한다. 사용자 안내 문구 추출 공용 헬퍼. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 수행하고 결과를 공유한다.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const text = await res.text();
        const body = text ? (JSON.parse(text) as ApiEnvelope<TokenResponse>) : null;
        if (!res.ok || !body?.success || !body.data) {
          clearTokens(); // refresh 만료·무효 → 세션 종료
          return false;
        }
        setTokens(body.data);
        return true;
      } catch {
        // 네트워크 단절은 인증 만료가 아니다. 토큰을 보존해 연결 복구 후 세션을 이어간다.
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<T> {
  const accessToken = getAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  // 액세스 토큰 만료(401) → refresh로 재발급 후 원 요청 1회 재시도.
  // 인증 엔드포인트 자체(login/refresh/logout)는 루프 방지를 위해 제외한다.
  if (res.status === 401 && !retried && !path.startsWith('/api/auth/')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, init, true);
    }
  }

  const text = await res.text();
  const body = text ? (JSON.parse(text) as ApiEnvelope<T>) : null;

  if (!res.ok || (body && !body.success)) {
    throw new ApiError(
      body?.message ?? '요청 처리 중 문제가 발생했습니다.',
      body?.errorCode
    );
  }

  return (body?.data ?? undefined) as T;
}
