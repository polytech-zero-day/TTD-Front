import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAttempt } from './useAttempt';
import { ApiError } from '@/lib/api/client';
import {
  getAttemptResult,
  regradeAttempt,
  saveDraft,
  sendAttemptMessage,
  startAttempt,
  submitAttempt,
} from '@/lib/api/attempt';
import type { AttemptResult, AttemptSnapshot } from '@/lib/api/attempt';

// 폴링/제출 목이 반환할 AttemptResult를 채운다. 훅은 status·점수만 읽지만 타입상 전 필드 필요.
const makeResult = (over: Partial<AttemptResult>): AttemptResult => ({
  attemptId: 7,
  status: 'GRADED',
  problemTitle: '문제',
  difficulty: 'L1',
  attemptOrdinal: 1,
  maxAttempts: 3,
  submittedAt: null,
  rubricScore: null,
  efficiencyScore: null,
  finalScore: null,
  feedback: null,
  criteria: [],
  messages: [],
  totalTokens: 0,
  tokenBudget: 3000,
  premium: false,
  chatModel: 'gpt-5.4-mini',
  artifact: null,
  ...over,
});

vi.mock('@/lib/api/attempt', () => ({
  startAttempt: vi.fn(),
  sendAttemptMessage: vi.fn(),
  saveDraft: vi.fn(),
  submitAttempt: vi.fn(),
  getAttemptResult: vi.fn(),
  regradeAttempt: vi.fn(),
}));

const startAttemptMock = vi.mocked(startAttempt);
const sendMessageMock = vi.mocked(sendAttemptMessage);
const saveDraftMock = vi.mocked(saveDraft);
const submitMock = vi.mocked(submitAttempt);
const getResultMock = vi.mocked(getAttemptResult);
const regradeMock = vi.mocked(regradeAttempt);

const snapshot: AttemptSnapshot = {
  attemptId: 7,
  status: 'IN_PROGRESS',
  remainingSeconds: 2700,
  usage: {
    messagesUsed: 1,
    messagesLimit: 10,
    tokensUsed: 500,
    tokensBaseline: 3000,
    unlimited: false,
  },
  messages: [
    { id: 1, role: 'user', content: '질문1' },
    { id: 2, role: 'assistant', content: '답변1' },
  ],
  draft: '저장된 결과물',
  chatModel: 'gpt-5.4-mini',
};

describe('useAttempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    startAttemptMock.mockResolvedValue(snapshot);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('시작 스냅샷으로 대화 이력·draft·사용량·남은 시간을 복원한다', async () => {
    const { result } = renderHook(() => useAttempt(1, vi.fn()));

    await waitFor(() => expect(result.current.state.phase).toBe('chatting'));

    expect(result.current.state.attemptId).toBe(7);
    expect(result.current.state.messages).toHaveLength(2);
    expect(result.current.state.draft).toBe('저장된 결과물');
    expect(result.current.state.usage.tokensUsed).toBe(500);
    expect(result.current.state.remainingSeconds).toBe(2700);
  });

  it('PAID 모델 선택을 받은 뒤에만 해당 모델로 응시를 시작한다', async () => {
    const { rerender } = renderHook(
      ({ startRequested }) =>
        useAttempt(1, vi.fn(), undefined, startRequested, 'gpt-5.4-mini'),
      { initialProps: { startRequested: false } }
    );

    expect(startAttemptMock).not.toHaveBeenCalled();
    rerender({ startRequested: true });

    await waitFor(() =>
      expect(startAttemptMock).toHaveBeenCalledWith(1, 'gpt-5.4-mini')
    );
  });

  it('메시지 전송에 성공하면 유저·AI 메시지가 추가되고 사용량이 서버 값으로 갱신된다', async () => {
    sendMessageMock.mockResolvedValue({
      message: { id: 3, role: 'assistant', content: '답변2' },
      usage: {
        messagesUsed: 2,
        messagesLimit: 10,
        tokensUsed: 1200,
        tokensBaseline: 3000,
        unlimited: false,
      },
    });
    const { result } = renderHook(() => useAttempt(1, vi.fn()));
    await waitFor(() => expect(result.current.state.phase).toBe('chatting'));

    await act(async () => {
      await result.current.send('질문2');
    });

    expect(sendMessageMock).toHaveBeenCalledWith(7, '질문2');
    expect(result.current.state.messages).toHaveLength(4); // 기존 2 + 낙관적 유저 + AI 응답
    expect(result.current.state.usage.tokensUsed).toBe(1200);
    expect(result.current.state.phase).toBe('chatting');
  });

  it('메시지 전송에 실패하면 낙관적으로 추가한 유저 메시지를 롤백한다', async () => {
    sendMessageMock.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAttempt(1, vi.fn()));
    await waitFor(() => expect(result.current.state.phase).toBe('chatting'));

    await act(async () => {
      await result.current.send('실패할 질문');
    });

    expect(result.current.state.messages).toHaveLength(2); // 롤백되어 원상복구
    expect(result.current.state.phase).toBe('chatting');
  });

  it('빈 메시지는 전송하지 않는다', async () => {
    const { result } = renderHook(() => useAttempt(1, vi.fn()));
    await waitFor(() => expect(result.current.state.phase).toBe('chatting'));

    await act(async () => {
      await result.current.send('   ');
    });

    expect(sendMessageMock).not.toHaveBeenCalled();
  });

  it('제출 확정 시 draft를 확정 저장한 뒤 제출하고, 폴링이 GRADED를 받으면 onGraded를 호출한다', async () => {
    vi.useFakeTimers();
    saveDraftMock.mockResolvedValue(undefined);
    submitMock.mockResolvedValue(makeResult({ status: 'GRADING', rubricScore: null, efficiencyScore: null, feedback: null }));
    getResultMock.mockResolvedValue(makeResult({ status: 'GRADED', rubricScore: 94, efficiencyScore: 88, feedback: '잘했습니다' }));
    const onGraded = vi.fn();
    const { result } = renderHook(() => useAttempt(1, onGraded));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0); // 시작 스냅샷 flush
    });
    expect(result.current.state.phase).toBe('chatting');

    await act(async () => {
      await result.current.confirmSubmit();
    });

    expect(saveDraftMock).toHaveBeenCalledWith(7, '저장된 결과물');
    expect(submitMock).toHaveBeenCalledWith(7);
    expect(result.current.state.phase).toBe('grading');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000); // 첫 폴링
    });
    expect(getResultMock).toHaveBeenCalledWith(7);
    expect(onGraded).toHaveBeenCalledTimes(1);
  });

  it('제출이 네트워크 오류로 접수되지 않으면 폴링에 들어가지 않고 대화 상태로 복귀한다', async () => {
    vi.useFakeTimers();
    saveDraftMock.mockResolvedValue(undefined);
    submitMock.mockRejectedValue(new TypeError('Failed to fetch')); // ApiError가 아닌 네트워크 오류
    const onGraded = vi.fn();
    const { result } = renderHook(() => useAttempt(1, onGraded));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.confirmSubmit();
    });

    expect(result.current.state.phase).toBe('chatting'); // 무한 채점 모달 방지
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(getResultMock).not.toHaveBeenCalled(); // 폴링 미시작
  });

  it('제출이 401 등 업무 오류로 실패하면 폴링하지 않고 대화 상태로 복귀한다', async () => {
    vi.useFakeTimers();
    saveDraftMock.mockResolvedValue(undefined);
    submitMock.mockRejectedValue(new ApiError('인증이 필요합니다.', 'UNAUTHENTICATED'));
    const { result } = renderHook(() => useAttempt(1, vi.fn()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.confirmSubmit();
    });

    expect(result.current.state.phase).toBe('chatting');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(getResultMock).not.toHaveBeenCalled();
  });

  it('만료 자동제출로 이미 GRADING인 경우(ATTEMPT_NOT_IN_PROGRESS)는 폴링으로 수렴한다', async () => {
    vi.useFakeTimers();
    saveDraftMock.mockResolvedValue(undefined);
    submitMock.mockRejectedValue(
      new ApiError('진행 중인 응시가 아닙니다.', 'ATTEMPT_NOT_IN_PROGRESS')
    );
    getResultMock.mockResolvedValue(makeResult({ status: 'GRADED', rubricScore: 80, efficiencyScore: 90, feedback: 'ok' }));
    const onGraded = vi.fn();
    const { result } = renderHook(() => useAttempt(1, onGraded));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.confirmSubmit();
    });
    expect(result.current.state.phase).toBe('grading'); // 폴링 진입
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(onGraded).toHaveBeenCalledTimes(1);
  });

  it('재진입 시 이미 제출된 세션이면 바로 채점 폴링으로 넘어간다', async () => {
    vi.useFakeTimers();
    startAttemptMock.mockResolvedValue({ ...snapshot, status: 'GRADING' });
    getResultMock.mockResolvedValue(makeResult({ status: 'GRADED', rubricScore: 90, efficiencyScore: 100, feedback: 'ok' }));
    const onGraded = vi.fn();
    const { result } = renderHook(() => useAttempt(1, onGraded));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.state.phase).toBe('grading');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(onGraded).toHaveBeenCalledTimes(1);
  });

  it('draft는 2초 디바운스 후 서버에 저장된다', async () => {
    vi.useFakeTimers();
    saveDraftMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAttempt(1, vi.fn()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    act(() => {
      result.current.setDraft('작성 중인 답안');
    });
    expect(result.current.state.draft).toBe('작성 중인 답안'); // 로컬은 즉시 반영
    expect(saveDraftMock).not.toHaveBeenCalled(); // 서버 저장은 아직

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(saveDraftMock).toHaveBeenCalledWith(7, '작성 중인 답안');
  });

  it('폴링이 GRADING_FAILED를 받으면 폴링을 멈추고 실패 상태로 전환한다', async () => {
    vi.useFakeTimers();
    saveDraftMock.mockResolvedValue(undefined);
    submitMock.mockResolvedValue(makeResult({ status: 'GRADING', rubricScore: null, efficiencyScore: null, feedback: null }));
    getResultMock.mockResolvedValue(makeResult({ status: 'GRADING_FAILED', rubricScore: null, efficiencyScore: null, feedback: null }));
    const onGraded = vi.fn();
    const { result } = renderHook(() => useAttempt(1, onGraded));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.confirmSubmit();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000); // 첫 폴링에서 실패 확인
    });

    expect(result.current.state.phase).toBe('failed');
    expect(onGraded).not.toHaveBeenCalled();

    const callsAfterFail = getResultMock.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000); // 폴링이 멈췄는지 확인
    });
    expect(getResultMock.mock.calls.length).toBe(callsAfterFail);
  });

  it('재채점 요청이 성공하면 다시 채점 폴링으로 돌아가 GRADED 시 onGraded를 호출한다', async () => {
    vi.useFakeTimers();
    startAttemptMock.mockResolvedValue({ ...snapshot, status: 'GRADING_FAILED' });
    regradeMock.mockResolvedValue(makeResult({ status: 'GRADING', rubricScore: null, efficiencyScore: null, feedback: null }));
    getResultMock.mockResolvedValue(makeResult({ status: 'GRADED', rubricScore: 88, efficiencyScore: 100, feedback: '복구 완료' }));
    const onGraded = vi.fn();
    const { result } = renderHook(() => useAttempt(1, onGraded));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.state.phase).toBe('failed'); // 재진입 시 실패 상태 복원

    await act(async () => {
      await result.current.retryGrading();
    });
    expect(regradeMock).toHaveBeenCalledWith(7);
    expect(result.current.state.phase).toBe('grading');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(onGraded).toHaveBeenCalledTimes(1);
  });

  it('재채점 요청이 실패하면 실패 상태를 유지한다', async () => {
    vi.useFakeTimers();
    startAttemptMock.mockResolvedValue({ ...snapshot, status: 'GRADING_FAILED' });
    regradeMock.mockRejectedValue(new Error('server error'));
    const { result } = renderHook(() => useAttempt(1, vi.fn()));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    await act(async () => {
      await result.current.retryGrading();
    });

    expect(result.current.state.phase).toBe('failed');
  });
});
