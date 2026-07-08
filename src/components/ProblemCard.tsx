import Badge from './ui/Badge';
import { PROBLEM_TYPE_LABEL, type ProblemListItem } from '../types/problem';

interface ProblemCardProps {
  problem: ProblemListItem;
}

// S-02 문제 카드. 팀 패널 스타일(bg-mirage border-gallery-9 rounded-xl + shadow)을 따름.
// 카드 전체가 클릭 영역이며 문제 상세(S-03)로 이동한다.
export default function ProblemCard({ problem }: ProblemCardProps) {
  const { id, title, difficulty, type, description, attemptCount } = problem;

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

      {/* 설명 (2줄 말줄임) */}
      <p className="line-clamp-2 text-[13px] leading-relaxed text-santas-gray">
        {description}
      </p>

      {/* 푸터: 누적 응시 / 시작 → */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-santas-gray">
          누적 응시 {attemptCount.toLocaleString('ko-KR')}명
        </span>
        <span className="text-[13px] font-medium text-wedgewood">시작 →</span>
      </div>
    </button>
  );
}
