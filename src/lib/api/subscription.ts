import { apiFetch } from '@/lib/api/client';
import type { SubscriptionResponse } from '@/types/subscription';

// GET /api/subscriptions/me — 구독 이력이 없는 계정의 에러 응답과 네트워크 장애를
// 스펙상 구분할 방법이 없어 둘 다 null(=FREE)로 정규화한다. 실패 원인은 콘솔로만 남긴다.
export async function getMySubscription(): Promise<SubscriptionResponse | null> {
  try {
    return await apiFetch<SubscriptionResponse>('/api/subscriptions/me');
  } catch (err) {
    console.error('[subscription] failed to load current subscription', err);
    return null;
  }
}

export const subscribe = (billingKey: string) =>
  apiFetch<SubscriptionResponse>('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ billingKey }),
  });

export const cancelSubscription = () =>
  apiFetch<void>('/api/subscriptions', { method: 'DELETE' });
