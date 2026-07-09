import { PROBLEM_STATUS_LABEL, type ProblemStatus } from '@/types/problem';

interface StatusDistributionChartProps {
  counts: Record<ProblemStatus, number>;
}

// 단일 색상(teal 계열) 내 명도 단계로 진행도를 표현하는 순서형(ordinal) 램프.
// draft(가장 어두움) -> pending -> active(가장 밝음) 순, dataviz 스킬의
// validate_palette.js --ordinal 검증을 통과한 조합 (tokens.css 기존 토큰만 사용).
const STATUS_ORDER: ProblemStatus[] = ['draft', 'pending', 'active'];
const STATUS_FILL_CLASS: Record<ProblemStatus, string> = {
  draft: 'bg-wedgewood',
  pending: 'bg-neptune',
  active: 'bg-jungle-mist',
};

export default function StatusDistributionChart({
  counts,
}: StatusDistributionChartProps) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);

  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-gallery-9 bg-ebony p-5">
      {STATUS_ORDER.map((status) => {
        const count = counts[status];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={status} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-[13px] text-santas-gray">
              {PROBLEM_STATUS_LABEL[status]}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-charade">
              <div
                className={`h-full rounded-full ${STATUS_FILL_CLASS[status]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-[13px] font-semibold text-gallery">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
