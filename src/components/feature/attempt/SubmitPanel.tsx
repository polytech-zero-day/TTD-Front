import CodeEditor from '@uiw/react-textarea-code-editor';
import '@uiw/react-textarea-code-editor/dist.css';
import Button from '@/components/ui/Button';
import type { AttemptState } from '@/types/attempt';

const DRAFT_PLACEHOLDER = `// 유형 / 긴급도 / 근거를 포함한 최종 결과물을 작성하세요
1. 배송지연 문의 → 유형: 배송, 긴급도: 상, 근거: '오늘까지' 표현 포함
2. 상품 파손 문의 → 유형: 품질, 긴급도: 상, 근거: '파손' 키워드
3. 단순 문의 → 유형: 기타, 긴급도: 하, 근거: 요청성 표현 없음`;

interface Props {
  state: AttemptState;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
}

export default function SubmitPanel({ state, onDraftChange, onSubmit }: Props) {
  // 제출 이후(채점 중·채점 실패)에는 결과물이 서버에 확정된 상태라 수정 불가
  const locked = state.phase === 'grading' || state.phase === 'failed';
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gallery-9 px-5 py-3">
        <span className="text-sm font-semibold text-gallery">결과물 제출</span>
      </div>

      {/* 코드 하이라이트 지원 에디터. 결과물이 텍스트여도 무해하고 코드면 색이 입혀진다 */}
      <div
        data-color-mode="dark"
        className="min-h-0 flex-1 overflow-y-auto [&_.w-tc-editor]:min-h-full [&_.w-tc-editor]:!bg-transparent"
      >
        <CodeEditor
          value={state.draft}
          language="python"
          placeholder={DRAFT_PLACEHOLDER}
          onChange={(e) => onDraftChange(e.target.value)}
          disabled={locked}
          padding={20}
          style={{
            fontFamily: 'ui-monospace, Consolas, monospace',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        />
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 px-5 pt-3 pb-5">
        <p className="rounded-lg border border-[#3d5a9e]/50 bg-biscay/30 px-3.5 py-2.5 text-xs text-gallery">
          ⚠ 제출은 1회 확정이며 이후 대화도 잠깁니다.
        </p>
        <Button
          className="w-full"
          disabled={locked || !state.draft.trim()}
          onClick={onSubmit}
        >
          최종 결과물 제출
        </Button>
      </div>
    </section>
  );
}
