import Badge from './ui/Badge';
import { PROBLEM_TYPE_LABEL, type ProblemSummary } from '../types/problem';

interface ProblemCardProps {
  problem: ProblemSummary;
}

// S-02 문제 카드. 팀 패널 스타일(bg-mirage border-gallery-9 rounded-xl + shadow)을 따름.
// 카드 전체가 클릭 영역이며 문제 상세(S-03)로 이동한다.
// 설명·누적 응시 인원은 목록 API 미제공 필드라 제외 (집계 필드 추가 시 복원 검토).
export default function ProblemCard({ problem }: ProblemCardProps) {
  const { id, title, difficulty, type, maxAttempts } = problem;

  return (
    <button
      type="button"
      onClick={() => (window.location.href = `/problems/${id}`)}
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-gallery-9 bg-mirage p-6 text-left shadow-[0_1px_2px_rgba(0,0,0,0.28)] hover:border-wedgewood"
    >
      {/* 배지 줄: 난이도(accent) + 유형(neutral) */}
      <div className="flex items-center gap-2">
        <Badge tone="accent">{difficulty}</Badge>
        <Badge tone="neutral">{PROBLEM_TYPE_LABEL[type]}</Badge>
      </div>

      {/* 제목 (1줄 말줄임) */}
      <div className="truncate text-base font-bold text-gallery">{title}</div>

      {/* 푸터: 응시 한도 / 시작 → */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-santas-gray">
          최대 {maxAttempts}회 응시
        </span>
        <span className="text-[13px] font-medium text-wedgewood">시작 →</span>
      </div>
    </button>
  );
}
