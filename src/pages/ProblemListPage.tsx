import { useMemo, useState } from 'react';
import Topbar from '../components/Topbar';
import ProblemCard from '../components/ProblemCard';
import { dummyProblems, dummyViewer } from '../data/dummyProblems';
import { TYPE_FILTERS, type Difficulty } from '../types/problem';

type LevelFilter = 'ALL' | Difficulty;

const LEVEL_CHIPS: { key: LevelFilter; label: string }[] = [
  { key: 'ALL', label: '전체 레벨' },
  { key: 'L1', label: 'L1' },
  { key: 'L2', label: 'L2' },
];

// 필터 칩 하나. 활성/비활성 두 상태.
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full px-3.5 py-[7px] text-[13px] font-medium whitespace-nowrap ${
        active
          ? 'bg-breaker-bay-18 text-gallery'
          : 'bg-charade text-santas-gray'
      }`}
    >
      {label}
    </button>
  );
}

export default function ProblemListPage() {
  const [level, setLevel] = useState<LevelFilter>('ALL');
  // 유형 필터: null = 전체 유형, 아니면 TYPE_FILTERS 의 label.
  const [typeLabel, setTypeLabel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const typeFilter = typeLabel
      ? TYPE_FILTERS.find((f) => f.label === typeLabel)
      : null;
    return dummyProblems.filter((p) => {
      const levelOk = level === 'ALL' || p.difficulty === level;
      const typeOk = !typeFilter || typeFilter.match(p.type);
      return levelOk && typeOk;
    });
  }, [level, typeLabel]);

  return (
    <div className="min-h-screen w-full bg-ebony font-sans">
      <Topbar
        active="catalog"
        userName={dummyViewer.name}
        plan={dummyViewer.plan}
      />

      <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-5 pt-8 pb-20">
        {/* 페이지 제목 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold text-gallery">문제 카탈로그</h1>
          <p className="text-sm text-santas-gray">
            실제 AI 활용 능력 평가 전형과 동일한 유형의 문제로 연습하세요.
            문제당 프롬프트는 3회로 제한됩니다.
          </p>
        </div>

        {/* 필터 칩 2그룹 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 레벨 그룹 */}
          <div className="flex items-center gap-2">
            {LEVEL_CHIPS.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                active={level === chip.key}
                onClick={() => setLevel(chip.key)}
              />
            ))}
          </div>

          {/* 구분선 */}
          <span className="h-5 w-px bg-gallery-9" />

          {/* 유형 그룹 */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="전체 유형"
              active={typeLabel === null}
              onClick={() => setTypeLabel(null)}
            />
            {TYPE_FILTERS.map((filter) => (
              <FilterChip
                key={filter.label}
                label={filter.label}
                active={typeLabel === filter.label}
                onClick={() => setTypeLabel(filter.label)}
              />
            ))}
          </div>
        </div>

        {/* 3열 카드 그리드 (gutter 24px) */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-6">
            {filtered.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        ) : (
          // 필터 결과 0건 빈 상태
          <div className="flex flex-col items-center gap-1 py-24 text-center">
            <div className="text-base font-semibold text-gallery">
              조건에 맞는 문제가 없어요
            </div>
            <div className="text-[13px] text-santas-gray">
              필터를 변경해 보세요.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
