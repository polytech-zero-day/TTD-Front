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
  const locked = state.phase === 'grading';
  return (
    <section className="flex h-full min-w-0 flex-col overflow-auto">
      <div className="shrink-0 border-b border-gallery-9 px-5 py-3">
        <span className="text-sm font-semibold text-gallery">결과물 제출</span>
      </div>

      <textarea
        value={state.draft}
        onChange={(e) => onDraftChange(e.target.value)}
        disabled={locked}
        placeholder={DRAFT_PLACEHOLDER}
        className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4 font-mono text-[13px] leading-relaxed text-gallery placeholder:text-santas-gray/50 focus:outline-none disabled:opacity-60"
      />

      <div className="flex shrink-0 flex-col gap-2.5 px-5 pb-5">
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
