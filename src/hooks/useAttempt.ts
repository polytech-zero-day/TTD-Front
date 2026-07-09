import { useCallback, useEffect, useRef, useState } from 'react';
import {
  sendAttemptMessage,
  startAttempt,
  submitAttempt,
} from '@/lib/api/attempt';
import type { AttemptState } from '@/types/attempt';
import { isInputLocked } from '@/types/attempt';

const INITIAL: AttemptState = {
  attemptId: null,
  phase: 'chatting',
  messages: [],
  usage: {
    messagesUsed: 0,
    messagesLimit: 10,
    tokensUsed: 0,
    tokensBaseline: 3000,
  },
  remainingSeconds: 45 * 60,
  draft: '',
};

export function useAttempt(problemId: number, onGraded: () => void) {
  const [state, setState] = useState<AttemptState>(INITIAL);
  const startedRef = useRef(false);

  // 응시 시작 (StrictMode 이중 실행 방지)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startAttempt(problemId).then(({ attemptId, usage, timeLimitSeconds }) =>
      setState((s) => ({
        ...s,
        attemptId,
        usage,
        remainingSeconds: timeLimitSeconds,
      }))
    );
  }, [problemId]);

  // 타이머: grading 중엔 정지, 0이 되면 강제 제출 확인 단계로
  useEffect(() => {
    if (state.phase === 'grading') return;
    const t = setInterval(() => {
      setState((s) =>
        s.remainingSeconds <= 1
          ? { ...s, remainingSeconds: 0, phase: 'confirming' }
          : { ...s, remainingSeconds: s.remainingSeconds - 1 }
      );
    }, 1000);
    return () => clearInterval(t);
  }, [state.phase]);

  const send = useCallback(
    async (content: string) => {
      if (!state.attemptId || isInputLocked(state) || !content.trim()) return;
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content,
      };
      setState((s) => ({
        ...s,
        phase: 'waiting',
        messages: [...s.messages, userMessage],
      }));
      try {
        const { message, usage } = await sendAttemptMessage(
          state.attemptId,
          content,
          state.usage
        );
        setState((s) => ({
          ...s,
          phase: 'chatting',
          messages: [...s.messages, message],
          usage,
        }));
      } catch {
        // 실패 시 사용량 미차감 — 사용자 메시지 롤백
        setState((s) => ({
          ...s,
          phase: 'chatting',
          messages: s.messages.filter((m) => m.id !== userMessage.id),
        }));
      }
    },
    [state]
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
    setState((s) => ({ ...s, phase: 'grading' }));
    await submitAttempt(state.attemptId, state.draft);
    // TODO(채점 API 연결 시): 결과 폴링/SSE 후 onGraded() 호출.
    setTimeout(onGraded, 3000); // 목: 3초 뒤 리포트 이동
  }, [state.attemptId, state.draft, onGraded]);

  const setDraft = useCallback(
    (draft: string) => setState((s) => ({ ...s, draft })),
    []
  );

  return { state, send, openConfirm, cancelConfirm, confirmSubmit, setDraft };
}
