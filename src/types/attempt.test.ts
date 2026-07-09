import { describe, expect, it } from 'vitest';
import { isInputLocked, isOverBaseline } from './attempt';
import type { AttemptState, AttemptUsage } from './attempt';

const baseUsage: AttemptUsage = {
  messagesUsed: 0,
  messagesLimit: 10,
  tokensUsed: 0,
  tokensBaseline: 3000,
};

const baseState: AttemptState = {
  attemptId: 1,
  phase: 'chatting',
  messages: [],
  usage: baseUsage,
  remainingSeconds: 2700,
  draft: '',
};

describe('isInputLocked', () => {
  it('대화 중이고 메시지가 남아 있으면 잠기지 않는다', () => {
    expect(isInputLocked(baseState)).toBe(false);
  });

  it('응답 대기 중이면 잠긴다', () => {
    expect(isInputLocked({ ...baseState, phase: 'waiting' })).toBe(true);
  });

  it('채점 중이면 잠긴다', () => {
    expect(isInputLocked({ ...baseState, phase: 'grading' })).toBe(true);
  });

  it('메시지를 모두 사용하면 잠긴다', () => {
    expect(
      isInputLocked({
        ...baseState,
        usage: { ...baseUsage, messagesUsed: 10 },
      })
    ).toBe(true);
  });
});

describe('isOverBaseline', () => {
  it('적정선과 정확히 같으면 초과가 아니다', () => {
    expect(isOverBaseline({ ...baseUsage, tokensUsed: 3000 })).toBe(false);
  });

  it('적정선을 넘으면 초과다', () => {
    expect(isOverBaseline({ ...baseUsage, tokensUsed: 3001 })).toBe(true);
  });
});
