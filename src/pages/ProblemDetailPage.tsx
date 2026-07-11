import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Topbar from '../components/Topbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { fetchProblem } from '@/lib/api/problems';
import {
  PROBLEM_TYPE_LABEL,
  type ProblemDetail as ProblemDetailData,
  type SourceType,
} from '../types/problem';

// 채점 방식(sourceType) -> 칩 라벨/톤.
const SOURCE_TYPE_CHIP: Record<
  SourceType,
  { label: string; tone: 'accent' | 'neutral' }
> = {
  AUTO_GRADED: { label: '자동 채점 + AI 루브릭', tone: 'accent' },
  RUBRIC_ONLY: { label: 'AI 루브릭 채점', tone: 'neutral' },
};

// 섹션 라벨 + 불릿 리스트 (요구사항/제약 조건 공용).
function BulletSection({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-sm font-semibold text-gallery">{label}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-wedgewood" />
            <span className="text-sm leading-relaxed text-santas-gray">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProblemDetail({ problem }: { problem: ProblemDetailData }) {
  const {
    id,
    title,
    difficulty,
    type,
    maxAttempts,
    sourceType,
    description,
    requirements,
    constraints,
    skeletonCode,
  } = problem;

  const chip = SOURCE_TYPE_CHIP[sourceType];

  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 pt-8 pb-20">
      {/* 뒤로가기 */}
      <a
        href="/problems"
        className="text-sm text-santas-gray no-underline hover:text-gallery"
      >
        ← 문제 카탈로그
      </a>

      {/* 상세 패널 */}
      <div className="flex flex-col gap-6 rounded-xl border border-gallery-9 bg-mirage p-8 shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
        {/* 헤더: 배지 + 제목 + 메타 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{difficulty}</Badge>
            <Badge tone="neutral">{PROBLEM_TYPE_LABEL[type]}</Badge>
          </div>
          <h1 className="text-[28px] font-bold text-gallery">{title}</h1>
          <div className="text-xs text-santas-gray">
            최대 {maxAttempts}회 응시
          </div>
        </div>

        <div className="h-px bg-gallery-9" />

        {/* 문제 설명 */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-semibold text-gallery">문제 설명</h2>
          <p className="text-sm leading-relaxed text-santas-gray">
            {description}
          </p>
        </section>

        {/* 요구사항 / 제약 조건 */}
        <BulletSection label="요구사항" items={requirements} />
        <BulletSection label="제약 조건" items={constraints} />

        {/* 채점 방식 */}
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-semibold text-gallery">채점 방식</h2>
          <div>
            <Badge tone={chip.tone}>{chip.label}</Badge>
          </div>
        </section>

        {/* 기초 코드 콜아웃 (스켈레톤형만) */}
        {skeletonCode !== null && (
          <div className="flex flex-col gap-3 rounded-lg bg-charade p-4">
            <div className="text-[13px] font-semibold text-gallery">
              📄 이 문제는 기초 코드가 제공됩니다
            </div>
            <div className="text-[13px] text-santas-gray">
              응시 화면 진입 시 코드 에디터에 아래 코드가 채워집니다.
            </div>
            <pre className="overflow-x-auto rounded-lg bg-ebony p-4 font-mono text-[12.5px] leading-relaxed text-gallery">
              {skeletonCode}
            </pre>
          </div>
        )}

        <div className="h-px bg-gallery-9" />

        {/* 하단 액션 */}
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="primary"
            size="lg"
            // S-04(C파트) 응시 화면 라우트 연결 예정. 현재는 해당 라우트가 없어
            // 클릭 시 빈 화면이 나오는 것이 정상이며, S-04 완성 시 자연스럽게 연결됨.
            onClick={() => (window.location.href = `/problems/${id}/attempt`)}
          >
            응시 시작하기
          </Button>
          <span className="text-xs text-santas-gray">
            최대 {maxAttempts}회 응시 가능 · 문제당 프롬프트 3회 제한
          </span>
        </div>
      </div>
    </main>
  );
}

// 없는 문제 id 처리 (PROBLEM_NOT_FOUND).
function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 pt-8 pb-20">
      <a
        href="/problems"
        className="text-sm text-santas-gray no-underline hover:text-gallery"
      >
        ← 문제 카탈로그
      </a>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-gallery-9 bg-mirage px-5 py-24 text-center shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
        <div className="text-base font-semibold text-gallery">
          문제를 찾을 수 없어요
        </div>
        <div className="text-[13px] text-santas-gray">
          삭제되었거나 아직 공개되지 않은 문제입니다.
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => (window.location.href = '/problems')}
        >
          목록으로
        </Button>
      </div>
    </main>
  );
}

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState<ProblemDetailData | null>(null);
  const [notFound, setNotFound] = useState(false); // 미존재·비공개 문제(404) 포함 조회 실패

  useEffect(() => {
    fetchProblem(Number(id))
      .then(setProblem)
      .catch(() => setNotFound(true));
  }, [id]);

  return (
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar active="catalog" />
      {notFound ? (
        <NotFound />
      ) : problem === null ? (
        <main className="mx-auto flex w-full max-w-[880px] items-center justify-center px-5 py-24">
          <span className="text-sm text-santas-gray">
            문제 정보를 불러오는 중…
          </span>
        </main>
      ) : (
        <ProblemDetail problem={problem} />
      )}
    </div>
  );
}
