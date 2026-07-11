import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchMyProfile, type MyProfile } from '@/lib/api/userProfile';
import { fetchMySubscription } from '@/lib/api/subscription';
import { isPaidSubscription } from '@/lib/subscription/plan';
import { ApiError } from '@/lib/api/client';
import { isAuthenticated } from '@/lib/auth/session';

export type UserPlan = 'FREE' | 'PAID';
export type ConnectionStatus = 'online' | 'offline';

export interface CurrentUser {
  name: string;
  plan: UserPlan;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
  /** 로그인·로그아웃 후 헤더를 최신 세션으로 다시 맞춘다. */
  refresh: () => Promise<void>;
}

const CurrentUserContext = createContext<CurrentUser>({
  name: '',
  plan: 'FREE',
  isLoading: true,
  connectionStatus: 'online',
  refresh: async () => {},
});

// 헤더(Topbar) 등에서 현재 로그인 사용자·요금제를 읽는다. 페이지마다 더미로 넘기던 것을 대체.
// eslint-disable-next-line react-refresh/only-export-components
export const useCurrentUser = () => useContext(CurrentUserContext);

interface UserState {
  name: string;
  plan: UserPlan;
  isLoading: boolean;
  connectionStatus: ConnectionStatus;
}

/**
 * 로그인 사용자 정보를 전역에 공급한다. 프로필(/api/users/me)로 닉네임을,
 * 구독(/api/subscriptions/me)으로 요금제를 판정한다. 인증 실패와 서버 연결 실패를 분리해,
 * 연결 오류가 사용자를 게스트/FREE로 보이게 하지 않는다.
 * SPA 특성상 로그인/로그아웃은 페이지 리로드가 없으므로, 그 시점에 refresh()로 다시 맞춰야 한다.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>({
    name: '',
    plan: 'FREE',
    isLoading: true,
    connectionStatus: 'online',
  });

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser({
        name: '',
        plan: 'FREE',
        isLoading: false,
        connectionStatus: 'online',
      });
      return;
    }

    let profile: MyProfile;
    try {
      profile = await fetchMyProfile();
    } catch {
      if (!isAuthenticated()) {
        setUser({
          name: '',
          plan: 'FREE',
          isLoading: false,
          connectionStatus: 'online',
        });
      } else {
        setUser((current) => ({
          ...current,
          isLoading: false,
          connectionStatus: 'offline',
        }));
      }
      return;
    }

    try {
      const subscription = await fetchMySubscription();
      const plan: UserPlan = isPaidSubscription(subscription.status)
        ? 'PAID'
        : 'FREE';
      setUser({
        name: profile.nickname,
        plan,
        isLoading: false,
        connectionStatus: 'online',
      });
    } catch (err) {
      // 구독 이력이 없는 404만 FREE로 판정한다. 그 외는 연결 오류로 현재 플랜을 보존한다.
      if (
        err instanceof ApiError &&
        err.errorCode === 'SUBSCRIPTION_NOT_FOUND'
      ) {
        setUser({
          name: profile.nickname,
          plan: 'FREE',
          isLoading: false,
          connectionStatus: 'online',
        });
        return;
      }
      setUser((current) => ({
        ...current,
        name: profile.nickname,
        isLoading: false,
        connectionStatus: 'offline',
      }));
    }
  }, []);

  useEffect(() => {
    const task = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(task);
  }, [refresh]);

  return (
    <CurrentUserContext.Provider value={{ ...user, refresh }}>
      {children}
    </CurrentUserContext.Provider>
  );
}
