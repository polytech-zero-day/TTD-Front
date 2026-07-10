import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAttemptResult,
  regradeAttempt,
  saveDraft,
  sendAttemptMessage,
  startAttempt,
  submitAttempt,
} from '@/lib/api/attempt';
import type { AttemptState } from '@/types/attempt';
import { isInputLocked } from '@/types/attempt';

const INITIAL: AttemptState = {
  attemptId: null,
  phase: 'loading',
  messages: [],
  usage: {
    messagesUsed: 0,
    messagesLimit: 10,
    tokensUsed: 0,
    tokensBaseline: 3000,
  },
  remainingSeconds: 0,
  draft: '',
};

const DRAFT_SAVE_DELAY_MS = 2000;
const RESULT_POLL_MS = 3000;

export function useAttempt(problemId: number, onGraded: (attemptId: number) => void) {
  const [state, setState] = useState<AttemptState>(INITIAL);
  const startedRef = useRef(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pollTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const beginResultPolling = useCallback(
    (attemptId: number) => {
      setState((s) => ({ ...s, phase: 'grading' }));
      pollTimerRef.current = setInterval(async () => {
        try {
          const result = await getAttemptResult(attemptId);
          if (result.status === 'GRADED') {
            clearInterval(pollTimerRef.current);
            onGraded(attemptId);
          } else if (result.status === 'GRADING_FAILED') {
            // 채점 실패 확정 — 폴링을 멈추고 재채점 UI로 전환
            clearInterval(pollTimerRef.current);
            setState((s) => ({ ...s, phase: 'failed' }));
          }
        } catch {
          /* 일시 오류는 다음 폴링에서 재시도 */
        }
      }, RESULT_POLL_MS);
    },
    [onGraded]
  );

  // 시작 + 새로고침 복원 (서버 스냅샷이 대화·draft·남은 시간까지 내려줌)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startAttempt(problemId).then((snap) => {
      if (snap.status === 'GRADING_FAILED') {
        // 재진입했는데 채점 실패 상태면 바로 재채점 UI로
        setState((s) => ({ ...s, attemptId: snap.attemptId, phase: 'failed' }));
        return;
      }
      if (snap.status !== 'IN_PROGRESS') {
        // 재진입했는데 이미 제출된 세션이면 바로 채점 폴링으로
        setState((s) => ({ ...s, attemptId: snap.attemptId }));
        beginResultPolling(snap.attemptId);
        return;
      }
      setState({
        attemptId: snap.attemptId,
        phase: 'chatting',
        messages: snap.messages,
        usage: snap.usage,
        remainingSeconds: snap.remainingSeconds,
        draft: snap.draft ?? '',
      });
    });
    return () => {
      clearTimeout(draftTimerRef.current);
      clearInterval(pollTimerRef.current);
    };
  }, [problemId, beginResultPolling]);

  // 타이머: 0이 되면 서버가 자동 제출하므로(다음 요청 시) 채점 폴링으로 전환
  useEffect(() => {
    if (state.phase === 'grading' || state.phase === 'loading') return;
    const t = setInterval(() => {
      setState((s) => {
        if (s.remainingSeconds <= 1) {
          if (s.attemptId) startAttempt(problemId).catch(() => {}); // 서버 만료 처리 트리거
          if (s.attemptId) beginResultPolling(s.attemptId);
          return { ...s, remainingSeconds: 0 };
        }
        return { ...s, remainingSeconds: s.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state.phase, problemId, beginResultPolling]);

  const send = useCallback(
    async (content: string) => {
      if (!state.attemptId || isInputLocked(state) || !content.trim()) return;
      const optimistic = {
        id: `temp-${Date.now()}`,
        role: 'user' as const,
        content,
      };
      setState((s) => ({
        ...s,
        phase: 'waiting',
        messages: [...s.messages, optimistic],
      }));
      try {
        const { message, usage } = await sendAttemptMessage(
          state.attemptId,
          content
        );
        setState((s) => ({
          ...s,
          phase: 'chatting',
          messages: [...s.messages, message],
          usage,
        }));
      } catch {
        setState((s) => ({
          ...s,
          phase: 'chatting',
          messages: s.messages.filter((m) => m.id !== optimistic.id),
        }));
      }
    },
    [state]
  );

  // draft: 로컬 즉시 반영 + 2초 디바운스 서버 저장 (만료 자동 제출 대비)
  const setDraft = useCallback(
    (draft: string) => {
      setState((s) => ({ ...s, draft }));
      clearTimeout(draftTimerRef.current);
      const attemptId = state.attemptId;
      if (!attemptId) return;
      draftTimerRef.current = setTimeout(() => {
        saveDraft(attemptId, draft).catch(() => {});
      }, DRAFT_SAVE_DELAY_MS);
    },
    [state.attemptId]
  );

  const openConfirm = useCallback(
    () =>
      setState((s) =>
        s.phase === 'chatting' ? { ...s, phase: 'confirming' } : s
      ),
    []
  );
  const cancelConfirm = useCallback(
    () =>
      setState((s) =>
        s.phase === 'confirming' ? { ...s, phase: 'chatting' } : s
      ),
    []
  );

  const confirmSubmit = useCallback(async () => {
    if (!state.attemptId) return;
    clearTimeout(draftTimerRef.current);
    try {
      await saveDraft(state.attemptId, state.draft); // 디바운스 미반영분 확정 저장
      await submitAttempt(state.attemptId);
    } catch {
      /* 이미 만료로 자동 제출된 경우(ATTEMPT_NOT_IN_PROGRESS)도 폴링으로 수렴 */
    }
    beginResultPolling(state.attemptId);
  }, [state.attemptId, state.draft, beginResultPolling]);

  // 채점 실패 상태에서 재채점 요청 — 성공하면 다시 채점 폴링으로
  const retryGrading = useCallback(async () => {
    const attemptId = state.attemptId;
    if (!attemptId || state.phase !== 'failed') return;
    try {
      await regradeAttempt(attemptId);
      beginResultPolling(attemptId);
    } catch {
      /* 실패 상태 유지 — 사용자가 다시 시도하거나 관리자 문의 */
    }
  }, [state.attemptId, state.phase, beginResultPolling]);

  return {
    state,
    send,
    openConfirm,
    cancelConfirm,
    confirmSubmit,
    setDraft,
    retryGrading,
  };
}
