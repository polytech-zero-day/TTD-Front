// src/pages/AttemptPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import AttemptTopbar from '@/components/feature/attempt/AttemptTopbar';
import ProblemPanel from '@/components/feature/attempt/ProblemPanel';
import ChatPanel from '@/components/feature/attempt/ChatPanel';
import SubmitPanel from '@/components/feature/attempt/SubmitPanel';
import { useAttempt } from '@/hooks/useAttempt';
import { fetchProblem } from '@/lib/api/problems';
import type { ProblemDetail } from '@/types/problem';

export default function AttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = Number(id);

  const [problem, setProblem] = useState<ProblemDetail | null>(null);

  const { state, send, openConfirm, cancelConfirm, confirmSubmit, setDraft } =
    useAttempt(problemId, () => navigate(`/problems/${problemId}/report`));

  useEffect(() => {
    // 존재하지 않거나 비활성 문제(404)면 카탈로그로 돌려보낸다
    fetchProblem(problemId)
      .then(setProblem)
      .catch(() => navigate('/problems', { replace: true }));
  }, [problemId, navigate]);

  if (!problem || state.phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-ebony">
        <span className="text-sm text-santas-gray">
          응시 정보를 불러오는 중…
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen w-full max-w-[1920px] flex-col bg-ebony font-sans">
      <AttemptTopbar
        usage={state.usage}
        remainingSeconds={state.remainingSeconds}
        onExit={() => navigate(`/problems/${problemId}`)}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,0.9fr)_minmax(520px,1.5fr)_minmax(300px,0.8fr)] overflow-hidden">
        <ProblemPanel problem={problem} />
        <ChatPanel
          state={state}
          onSend={send}
          onCancelConfirm={cancelConfirm}
          onConfirmSubmit={confirmSubmit}
        />
        <SubmitPanel
          state={state}
          onDraftChange={setDraft}
          onSubmit={openConfirm}
        />
      </div>
    </div>
  );
}
