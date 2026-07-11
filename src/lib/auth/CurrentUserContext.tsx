import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchMyProfile } from '@/lib/api/userProfile';
import { getMySubscription } from '@/lib/api/subscription';

export type UserPlan = 'FREE' | 'PAID';

export interface CurrentUser {
  name: string;
  plan: UserPlan;
  isLoading: boolean;
  /** 로그인·로그아웃 후 헤더를 최신 세션으로 다시 맞춘다. */
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUser>({
  name: '',
  plan: 'FREE',
  isLoading: true,
  refresh: async () => {},
});

// 헤더(Topbar) 등에서 현재 로그인 사용자·요금제를 읽는다. 페이지마다 더미로 넘기던 것을 대체.
export const useCurrentUser = () => useContext(CurrentUserContext);

interface UserState {
  name: string;
  plan: UserPlan;
  isLoading: boolean;
}

/**
 * 로그인 사용자 정보를 전역에 공급한다. 프로필(/api/users/me)로 닉네임을,
 * 구독(/api/subscriptions/me)으로 요금제를 판정한다. 비로그인·조회 실패는 게스트로 취급.
 * SPA 특성상 로그인/로그아웃은 페이지 리로드가 없으므로, 그 시점에 refresh()로 다시 맞춰야 한다.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>({
    name: '',
    plan: 'FREE',
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    const [profile, subscription] = await Promise.all([
      fetchMyProfile().catch(() => null),
      getMySubscription(), // 이미 실패 시 null 정규화됨
    ]);
    const plan: UserPlan =
      subscription &&
      (subscription.status === 'ACTIVE' || subscription.status === 'PAST_DUE')
        ? 'PAID'
        : 'FREE';
    setUser({ name: profile?.nickname ?? '', plan, isLoading: false });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <CurrentUserContext.Provider value={{ ...user, refresh }}>
      {children}
    </CurrentUserContext.Provider>
  );
}
