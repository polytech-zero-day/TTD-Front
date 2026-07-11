import { describe, expect, it } from 'vitest';
import { isPaidSubscription } from './plan';

describe('isPaidSubscription', () => {
  it.each(['ACTIVE', 'PAST_DUE'] as const)('%s 상태에는 유료 혜택을 유지한다', (status) => {
    expect(isPaidSubscription(status)).toBe(true);
  });

  it.each(['CANCELED', 'EXPIRED', undefined] as const)('%s 상태에는 유료 혜택을 부여하지 않는다', (status) => {
    expect(isPaidSubscription(status)).toBe(false);
  });
});
