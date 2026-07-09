import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  setTokens,
} from './session';
import type { TokenResponse } from '@/types/auth';

const tokens: TokenResponse = {
  accessToken: 'access-123',
  refreshToken: 'refresh-456',
  tokenType: 'Bearer',
  expiresInSeconds: 1800,
};

describe('session 토큰 저장소', () => {
  beforeEach(() => {
    clearTokens(); // 모듈 스코프 상태라 테스트 간 격리 필요
  });

  it('초기 상태는 비인증이며 토큰이 없다', () => {
    expect(isAuthenticated()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('토큰을 저장하면 인증 상태가 되고 각 토큰을 꺼낼 수 있다', () => {
    setTokens(tokens);

    expect(isAuthenticated()).toBe(true);
    expect(getAccessToken()).toBe('access-123');
    expect(getRefreshToken()).toBe('refresh-456');
  });

  it('토큰을 지우면 비인증 상태로 돌아간다', () => {
    setTokens(tokens);
    clearTokens();

    expect(isAuthenticated()).toBe(false);
    expect(getAccessToken()).toBeNull();
  });
});
