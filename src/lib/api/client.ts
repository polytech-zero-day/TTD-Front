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

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
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
