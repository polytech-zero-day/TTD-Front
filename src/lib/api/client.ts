import { getAccessToken } from '@/lib/auth/session';

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

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
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
