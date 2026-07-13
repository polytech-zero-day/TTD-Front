import { apiFetch } from '@/lib/api/client';
import type { SubscriptionResponse } from '@/types/subscription';

/** 현재 구독 조회의 원본 요청. 연결·인증 오류를 호출부에서 구분해야 할 때 사용한다. */
export const fetchMySubscription = () =>
  apiFetch<SubscriptionResponse>('/api/subscriptions/me');

// 구독 이력이 없는 계정은 FREE로 정규화하는 화면용 편의 함수.
export async function getMySubscription(): Promise<SubscriptionResponse | null> {
  try {
    return await fetchMySubscription();
  } catch {
    // FREE 사용자의 구독 없음은 정상 상태이므로 null로 정규화한다.
    return null;
  }
}

export const subscribe = (billingKey: string) =>
  apiFetch<SubscriptionResponse>('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ billingKey }),
  });

export const cancelSubscription = () =>
  apiFetch<SubscriptionResponse>('/api/subscriptions', { method: 'DELETE' });
