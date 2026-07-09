import { useNavigate, useParams } from 'react-router';
import AttemptTopbar from '@/components/feature/attempt/AttemptTopbar';
import ProblemPanel from '@/components/feature/attempt/ProblemPanel';
import ChatPanel from '@/components/feature/attempt/ChatPanel';
import SubmitPanel from '@/components/feature/attempt/SubmitPanel';
import { useAttempt } from '@/hooks/useAttempt';
import { dummyProblemDetails } from '@/data/dummyProblems'; // TODO: A축 상세 API로 교체

export default function AttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = Number(id);
  const problem = dummyProblemDetails[problemId]; // TODO: useProblemDetail(problemId)

  const { state, send, openConfirm, cancelConfirm, confirmSubmit, setDraft } =
    useAttempt(problemId, () => navigate(`/problems/${problemId}/report`));

  if (!problem) return null;

  return (
    <div className="mx-auto flex h-screen w-full max-w-[1920px] flex-col overflow-hidden bg-ebony font-sans">
      <AttemptTopbar
        usage={state.usage}
        remainingSeconds={state.remainingSeconds}
        onExit={() => navigate(`/problems/${problemId}`)}
      />
      <div className="grid h-0 flex-1 grid-cols-[minmax(420px,1fr)_minmax(360px,1.15fr)_minmax(300px,0.7fr)]">
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
