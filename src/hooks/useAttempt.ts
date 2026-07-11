import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApiError, getApiErrorMessage } from '@/lib/api/client';
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
    unlimited: false,
  },
  remainingSeconds: 0,
  draft: '',
  chatModel: null,
};

const DRAFT_SAVE_DELAY_MS = 2000;
const RESULT_POLL_MS = 3000;

// 타이머가 도는 "살아있는" 페이즈. grading/failed/loading에서는 카운트다운을 멈춘다
// (failed에서 타이머가 계속 돌면 grading↔failed 진동을 유발한다).
const LIVE_PHASES: AttemptState['phase'][] = [
  'chatting',
  'waiting',
  'confirming',
];
const isLivePhase = (phase: AttemptState['phase']) =>
  LIVE_PHASES.includes(phase);

export function useAttempt(
  problemId: number,
  onGraded: (attemptId: number) => void,
  onStartBlocked?: (message: string) => void,
  startRequested = true,
  selectedChatModel?: string
) {
  const [state, setState] = useState<AttemptState>(INITIAL);
  const startedRef = useRef(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pollTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // 콜백을 ref로 안정화 — 이걸 deps에 두면 매 렌더마다 이펙트가 재생성되어 카운트다운이 리셋된다
  const onGradedRef = useRef(onGraded);
  const onStartBlockedRef = useRef(onStartBlocked);

  useEffect(() => {
    onGradedRef.current = onGraded;
    onStartBlockedRef.current = onStartBlocked;
  }, [onGraded, onStartBlocked]);

  // 폴링 시작. 기존 interval을 먼저 정리해 중복 호출 시 interval이 새는 것을 막는다.
  const beginResultPolling = useCallback((attemptId: number) => {
    clearInterval(pollTimerRef.current);
    setState((s) => ({ ...s, phase: 'grading' }));
    pollTimerRef.current = setInterval(async () => {
      try {
        const result = await getAttemptResult(attemptId);
        if (result.status === 'GRADED') {
          clearInterval(pollTimerRef.current);
          onGradedRef.current(attemptId);
        } else if (result.status === 'GRADING_FAILED') {
          // 채점 실패 확정 — 폴링을 멈추고 재채점 UI로 전환
          clearInterval(pollTimerRef.current);
          setState((s) => ({ ...s, phase: 'failed' }));
        }
      } catch (err) {
        if (err instanceof ApiError && err.errorCode === 'ATTEMPT_NOT_FOUND') {
          // 응시가 사라짐(서버 초기화 등) — 폴링을 멈추고 이탈 처리
          clearInterval(pollTimerRef.current);
          onStartBlockedRef.current?.(err.message);
        }
        /* 그 외 일시 오류는 다음 폴링에서 재시도 */
      }
    }, RESULT_POLL_MS);
  }, []);

  // 시작 + 새로고침 복원 (서버 스냅샷이 대화·draft·남은 시간까지 내려줌)
  useEffect(() => {
    if (!startRequested) return;
    if (startedRef.current) return;
    startedRef.current = true;
    startAttempt(problemId, selectedChatModel)
      .then((snap) => {
        if (snap.status === 'GRADING_FAILED') {
          // 재진입했는데 채점 실패 상태면 바로 재채점 UI로
          setState((s) => ({
            ...s,
            attemptId: snap.attemptId,
            phase: 'failed',
          }));
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
          chatModel: snap.chatModel,
        });
      })
      .catch((err: unknown) => {
        // 응시 횟수 소진(QUOTA_EXCEEDED) 등 시작 불가 — 호출부에서 안내 후 이탈 처리
        onStartBlockedRef.current?.(
          err instanceof Error && err.message
            ? err.message
            : '응시를 시작할 수 없습니다.'
        );
      });
    return () => {
      clearTimeout(draftTimerRef.current);
      clearInterval(pollTimerRef.current);
    };
  }, [problemId, beginResultPolling, startRequested, selectedChatModel]);

  // 카운트다운: 살아있는 페이즈에서 1초마다 순수 감소만 한다(부작용 없음).
  // deps는 phase만 — 콜백을 넣지 않아 매 렌더 리셋되지 않는다.
  useEffect(() => {
    if (!isLivePhase(state.phase)) return;
    const t = setInterval(() => {
      setState((s) =>
        s.remainingSeconds <= 0
          ? s
          : { ...s, remainingSeconds: s.remainingSeconds - 1 }
      );
    }, 1000);
    return () => clearInterval(t);
  }, [state.phase]);

  // 만료 처리: 남은 시간이 0이 되면 서버에 만료를 트리거하고 채점 폴링으로 전환한다.
  // beginResultPolling이 phase를 grading으로 바꾸면 isLivePhase가 false가 되어 한 번만 실행된다.
  useEffect(() => {
    if (state.remainingSeconds > 0) return;
    if (!isLivePhase(state.phase) || !state.attemptId) return;
    const attemptId = state.attemptId;
    // start 재호출로 서버가 만료된 세션을 자동 제출하게 한다(백엔드 expireIfNeeded 경로).
    // 다음 작업으로 넘겨 effect 중 동기 상태 갱신을 피하고, cleanup 전에는 실행되지 않게 한다.
    const expiryTask = setTimeout(() => {
      startAttempt(problemId).catch(() => {});
      beginResultPolling(attemptId);
    }, 0);
    return () => clearTimeout(expiryTask);
  }, [
    state.remainingSeconds,
    state.phase,
    state.attemptId,
    problemId,
    beginResultPolling,
  ]);

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
      } catch (err) {
        toast.error(
          getApiErrorMessage(
            err,
            '메시지 전송에 실패했습니다. 다시 시도해주세요.'
          )
        );
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
      toast.success('제출이 완료되었습니다. 채점을 시작할게요.');
    } catch (err) {
      // 만료 자동제출로 이미 GRADING인 경우(ATTEMPT_NOT_IN_PROGRESS)만 폴링으로 수렴시킨다.
      // 그 외(401/500/네트워크 등)는 제출이 접수되지 않았으므로 폴링에 들어가면 무한 대기가 된다.
      const alreadySubmitted =
        err instanceof ApiError && err.errorCode === 'ATTEMPT_NOT_IN_PROGRESS';
      if (!alreadySubmitted) {
        toast.error(
          getApiErrorMessage(
            err,
            '제출에 실패했습니다. 연결을 확인하고 다시 시도해주세요.'
          )
        );
        setState((s) => ({ ...s, phase: 'chatting' }));
        return;
      }
    }
    beginResultPolling(state.attemptId);
  }, [state.attemptId, state.draft, beginResultPolling]);

  // 채점 실패 상태에서 재채점 요청 — 성공하면 다시 채점 폴링으로
  const retryGrading = useCallback(async () => {
    const attemptId = state.attemptId;
    if (!attemptId || state.phase !== 'failed') return;
    try {
      await regradeAttempt(attemptId);
      toast.success('재채점을 요청했습니다.');
      beginResultPolling(attemptId);
    } catch (err) {
      // 실패 상태 유지 — 사용자가 다시 시도하거나 관리자 문의
      toast.error(getApiErrorMessage(err, '재채점 요청에 실패했습니다.'));
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
