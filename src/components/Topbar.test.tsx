import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Topbar from './Topbar';
import { fetchMyProfile } from '@/lib/api/userProfile';
import { fetchMyStats } from '@/lib/api/myPage';

vi.mock('@/lib/auth/CurrentUserContext', () => ({
  useCurrentUser: () => ({
    name: 'seongmin',
    plan: 'FREE',
    connectionStatus: 'online',
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/auth/session', () => ({
  isAuthenticated: () => true,
}));

vi.mock('@/lib/api/userProfile', () => ({
  fetchMyProfile: vi.fn(),
}));

vi.mock('@/lib/api/myPage', () => ({
  fetchMyStats: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  logout: vi.fn(),
}));

const fetchMyProfileMock = vi.mocked(fetchMyProfile);
const fetchMyStatsMock = vi.mocked(fetchMyStats);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

describe('Topbar account card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('프로필과 통계의 응답 순서가 달라도 로딩을 종료하고 모두 표시한다', async () => {
    const profile = deferred<Awaited<ReturnType<typeof fetchMyProfile>>>();
    const stats = deferred<Awaited<ReturnType<typeof fetchMyStats>>>();
    fetchMyProfileMock.mockReturnValue(profile.promise);
    fetchMyStatsMock.mockReturnValue(stats.promise);

    render(
      <MemoryRouter>
        <Topbar active="catalog" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '계정 메뉴 열기' }));
    expect(screen.getAllByText('불러오는 중…')).toHaveLength(2);

    await act(async () => {
      profile.resolve({
        id: 1,
        email: 'seongmin@example.com',
        nickname: 'seongmin',
        role: 'USER',
        createdAt: '2026-07-14T00:00:00',
      });
    });

    await act(async () => {
      stats.resolve({
        totalAttempts: 4,
        avgQualityScore: 80,
        avgEfficiencyScore: 70,
        bestScore: 92,
        totalTokens: 1200,
        completionRate: 75,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('seongmin@example.com')).toBeTruthy();
      expect(screen.getByText('92')).toBeTruthy();
      expect(screen.getByText('4건 완료율 75%')).toBeTruthy();
      expect(screen.queryByText('불러오는 중…')).toBeNull();
    });
  });
});
