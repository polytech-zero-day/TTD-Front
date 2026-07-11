import type { SubscriptionStatus } from '@/types/subscription';

/** 백엔드가 유료 혜택을 유지하는 구독 상태와 동일한 기준이다. */
export const isPaidSubscription = (
  status: SubscriptionStatus | undefined
): boolean => status === 'ACTIVE' || status === 'PAST_DUE';
