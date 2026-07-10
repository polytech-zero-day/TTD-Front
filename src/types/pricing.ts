export type PlanId = 'FREE' | 'PAID';

export interface PlanFeature {
  label: string;
  included: boolean;
  emphasis?: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceSuffix: string;
  recommended?: boolean;
  features: PlanFeature[];
}
