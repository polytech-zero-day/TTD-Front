export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface SubscriptionResponse {
  status: SubscriptionStatus;
  currentPeriodStart: string;
  nextBillingAt: string;
  canceledAt: string | null;
}
