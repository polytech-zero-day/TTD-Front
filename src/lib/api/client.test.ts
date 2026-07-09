import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from './client';
import { clearTokens, setTokens } from '@/lib/auth/session';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    text: () => Promise.resolve(body === null ? '' : JSON.stringify(body)),
  } as Response;
}

const fetchMock = vi.fn();

describe('apiFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    clearTokens();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('성공 봉투(ApiResponse)에서 data만 꺼내 반환한다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { id: 1, title: '문제' } })
    );

    const data = await apiFetch<{ id: number; title: string }>('/api/problems/1');

    expect(data).toEqual({ id: 1, title: '문제' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/problems/1',
      expect.anything()
    );
  });

  it('로그인 상태면 Authorization 헤더를 붙인다', async () => {
    setTokens({
      accessToken: 'token-abc',
      refreshToken: 'r',
      tokenType: 'Bearer',
      expiresInSeconds: 1800,
    });
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await apiFetch('/api/attempts');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({ Authorization: 'Bearer token-abc' });
  });

  it('비로그인 상태면 Authorization 헤더를 붙이지 않는다', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await apiFetch('/api/problems');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('에러 봉투를 받으면 errorCode를 담은 ApiError를 던진다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          success: false,
          errorCode: 'ATTEMPT_QUOTA_EXCEEDED',
          message: '이 문제의 응시 가능 횟수를 모두 사용했습니다.',
        },
        false,
        409
      )
    );

    const error = await apiFetch('/api/attempts').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).errorCode).toBe('ATTEMPT_QUOTA_EXCEEDED');
    expect((error as ApiError).message).toContain('횟수');
  });

  it('본문 없는 실패 응답이면 기본 메시지로 ApiError를 던진다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 500));

    await expect(apiFetch('/api/attempts')).rejects.toThrow(
      '요청 처리 중 문제가 발생했습니다.'
    );
  });
});
