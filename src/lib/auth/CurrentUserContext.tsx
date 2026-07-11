import {
  createContext,
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
}

const CurrentUserContext = createContext<CurrentUser>({
  name: '',
  plan: 'FREE',
  isLoading: true,
});

// 헤더(Topbar) 등에서 현재 로그인 사용자·요금제를 읽는다. 페이지마다 더미로 넘기던 것을 대체.
export const useCurrentUser = () => useContext(CurrentUserContext);

/**
 * 로그인 사용자 정보를 앱 루트에서 1회 조회해 하위 전역에 공급한다.
 * 프로필(/api/users/me)로 닉네임을, 구독(/api/subscriptions/me)으로 요금제를 판정한다.
 * 비로그인·조회 실패는 게스트(빈 이름·FREE)로 취급해 화면이 깨지지 않게 한다.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>({
    name: '',
    plan: 'FREE',
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchMyProfile().catch(() => null),
      getMySubscription(), // 이미 실패 시 null 정규화됨
    ]).then(([profile, subscription]) => {
      if (cancelled) return;
      const plan: UserPlan =
        subscription &&
        (subscription.status === 'ACTIVE' || subscription.status === 'PAST_DUE')
          ? 'PAID'
          : 'FREE';
      setUser({ name: profile?.nickname ?? '', plan, isLoading: false });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}
