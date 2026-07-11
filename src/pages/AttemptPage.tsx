// src/pages/AttemptPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import AttemptTopbar from '@/components/feature/attempt/AttemptTopbar';
import ProblemPanel from '@/components/feature/attempt/ProblemPanel';
import ChatPanel from '@/components/feature/attempt/ChatPanel';
import SubmitPanel from '@/components/feature/attempt/SubmitPanel';
import { useAttempt } from '@/hooks/useAttempt';
import { getCurrentAttempt } from '@/lib/api/attempt';
import { fetchProblem } from '@/lib/api/problems';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { ProblemDetail } from '@/types/problem';

export default function AttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = Number(id);
  const { plan, isLoading: isUserLoading } = useCurrentUser();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [startRequested, setStartRequested] = useState(false);
  const [selectedChatModel, setSelectedChatModel] = useState('gpt-5.4');
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  const {
    state,
    send,
    openConfirm,
    cancelConfirm,
    confirmSubmit,
    setDraft,
    retryGrading,
  } = useAttempt(
    problemId,
    (attemptId) => navigate(`/result/${attemptId}`),
    (message) => {
      // 응시 횟수 소진 등 시작 거부 — 안내 후 문제 상세로 돌려보낸다
      toast.error(message);
      navigate(`/problems/${problemId}`, { replace: true });
    },
    startRequested,
    selectedChatModel
  );

  useEffect(() => {
    let cancelled = false;
    if (isUserLoading) return;
    if (plan === 'FREE') {
      setStartRequested(true);
      setIsCheckingExisting(false);
      return;
    }
    getCurrentAttempt(problemId)
      .then(() => {
        if (!cancelled) setStartRequested(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsCheckingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isUserLoading, plan, problemId]);

  useEffect(() => {
    let cancelled = false;
    // 존재하지 않거나 비활성 문제(404)면 카탈로그로 돌려보낸다
    fetchProblem(problemId)
      .then((data) => {
        if (!cancelled) setProblem(data);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('문제 정보를 불러오지 못했습니다.');
        navigate('/problems', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [problemId, navigate]);

  if (!problem || isUserLoading || isCheckingExisting) {
    return (
      <div className="flex h-screen items-center justify-center bg-ebony">
        <span className="text-sm text-santas-gray">
          응시 정보를 불러오는 중…
        </span>
      </div>
    );
  }

  if (state.phase === 'loading' && startRequested) {
    return (
      <div className="flex h-screen items-center justify-center bg-ebony">
        <span className="text-sm text-santas-gray">응시 정보를 불러오는 중…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-[1920px] flex-col bg-ebony font-sans">
      <AttemptTopbar
        usage={state.usage}
        remainingSeconds={state.remainingSeconds}
        chatModel={state.chatModel}
        onExit={() => navigate(`/problems/${problemId}`)}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,0.9fr)_minmax(520px,1.5fr)_minmax(300px,0.8fr)] overflow-hidden">
        <ProblemPanel problem={problem} />
        <ChatPanel
          state={state}
          onSend={send}
          onCancelConfirm={cancelConfirm}
          onConfirmSubmit={confirmSubmit}
          onRegrade={retryGrading}
        />
        <SubmitPanel
          state={state}
          onDraftChange={setDraft}
          onSubmit={openConfirm}
        />
      </div>
      {plan === 'PAID' && !startRequested && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-select-title"
            className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-gallery-9 bg-mirage p-6 shadow-2xl"
          >
            <div>
              <h1 id="model-select-title" className="text-lg font-bold text-gallery">
                응시 모델 선택
              </h1>
              <p className="mt-1 text-sm text-santas-gray">
                선택한 모델은 이 응시가 끝날 때까지 변경할 수 없습니다.
              </p>
            </div>
            <Select
              variant="form"
              value={selectedChatModel}
              onChange={(event) => setSelectedChatModel(event.target.value)}
            >
              <option value="gpt-5.4-mini">GPT-5.4 mini</option>
              <option value="gpt-5.4">GPT-5.4</option>
            </Select>
            <Button onClick={() => setStartRequested(true)}>응시 시작</Button>
          </section>
        </div>
      )}
    </div>
  );
}
