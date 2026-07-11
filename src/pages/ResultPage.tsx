import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import RubricItem from '../components/feature/result/RubricItem';
import AttemptTimelineItem from '../components/feature/result/AttemptTimelineItem';
import ResultScatterChart, {
  type ScatterDot,
} from '../components/feature/result/ResultScatterChart';
import { getAttemptResult, type AttemptResult } from '@/lib/api/attempt';
import { fetchScatterData, type ScatterPoint } from '@/lib/api/myPage';
import { formatDateTime, formatTime } from '@/lib/format';
import type { AttemptRecord, RubricCriterionData } from '../types/result';

interface ResultPageData {
  result: AttemptResult;
  scatter: ScatterPoint[];
}

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ResultPageData | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAttemptResult(Number(attemptId)), fetchScatterData()])
      .then(([result, scatter]) => {
        if (cancelled) return;
        setData({ result, scatter });
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('채점 결과를 불러오지 못했습니다.');
        navigate('/problems', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId, navigate]);

  const rubricItems = useMemo<RubricCriterionData[]>(
    () =>
      (data?.result.criteria ?? []).map((c, i) => ({
        id: String(i),
        title: `${i + 1}. ${c.name}`,
        scoreDisplay: { type: 'score', earned: c.score, max: c.maxScore },
        description: c.comment,
      })),
    [data]
  );

  const timeline = useMemo<AttemptRecord[]>(() => {
    if (!data) return [];
    const messages = data.result.messages ?? [];
    const artifact = data.result.artifact;
    const records: AttemptRecord[] = [];
    messages.forEach((m, i) => {
      if (m.role !== 'user') return;
      const reply = messages[i + 1];
      records.push({
        id: String(m.id),
        label: `${records.length + 1}차 프롬프트`,
        time: formatTime(m.createdAt),
        prompt: m.content,
        totalTokens: reply?.role === 'assistant' ? (reply.tokensUsed ?? 0) : 0,
      });
    });
    // 마지막 프롬프트를 최종 제출로 마킹하고 artifact를 실어 보낸다.
    const last = records[records.length - 1];
    if (last) {
      records[records.length - 1] = { ...last, isFinal: true, artifact };
    }
    return records;
  }, [data]);

  // 산점도·백분위 계산 (data 있을 때만 실효)
  const scatterDots = useMemo<ScatterDot[]>(() => {
    if (!data) return [];
    const { result, scatter } = data;
    // 상위 10% 컷: 종합점수(quality*0.6 + efficiency*0.4) 내림차순에서 상위 10% 인덱스
    const totals = scatter.map(
      (p) => p.rubricScore * 0.6 + p.efficiencyScore * 0.4
    );
    const sortedDesc = [...totals].sort((a, b) => b - a);
    const cutIdx = Math.max(0, Math.ceil(sortedDesc.length * 0.1) - 1);
    const top10Threshold =
      sortedDesc.length > 0 ? (sortedDesc[cutIdx] ?? Infinity) : Infinity;

    return [
      ...scatter.map((p) => {
        const total = p.rubricScore * 0.6 + p.efficiencyScore * 0.4;
        return {
          quality: p.rubricScore,
          efficiency: p.efficiencyScore,
          isTopTen: total >= top10Threshold,
        };
      }),
      {
        quality: result.rubricScore ?? 0,
        efficiency: result.efficiencyScore ?? 0,
        isCurrentPosition: true,
      },
    ];
  }, [data]);

  const percentile = useMemo<number | null>(() => {
    if (!data) return null;
    const { result, scatter } = data;
    if (scatter.length === 0) return null;
    const myTotal = result.finalScore ?? 0;
    const atOrAbove = scatter.filter(
      (p) => p.rubricScore * 0.6 + p.efficiencyScore * 0.4 >= myTotal
    ).length;
    return Math.ceil((atOrAbove * 100) / scatter.length);
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-ebony">
        <span className="text-sm text-santas-gray">
          채점 결과를 불러오는 중…
        </span>
      </div>
    );
  }

  const { result } = data;

  if (result.status !== 'GRADED') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-ebony">
        <span className="text-sm text-santas-gray">
          아직 채점이 완료되지 않은 응시입니다.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/problems')}
        >
          문제 목록으로
        </Button>
      </div>
    );
  }

  const referenceNotes = [
    `품질 점수: 루브릭 ${result.criteria.length}개 항목 채점 합산`,
    `효율성 점수: 적정 토큰 ${result.tokenBudget.toLocaleString()} 대비 사용량(${result.totalTokens.toLocaleString()}) 기반`,
    '종합 점수: 품질×60% + 효율성×40%',
  ];

  return (
    <div className="min-h-screen w-full bg-ebony font-sans">
      <Topbar active="catalog" />

      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-10 pt-8 pb-20">
        {/* ① 헤더 */}
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-white">채점 결과</h1>
          <p className="text-base text-santas-gray">
            {result.problemTitle} · {result.difficulty}
          </p>
          <div className="mt-1 flex items-center gap-6 text-sm">
            <span className="text-santas-gray">
              문제:{' '}
              <span className="font-semibold text-gallery">
                {result.problemTitle}
              </span>
            </span>
            <span className="text-santas-gray">
              난이도:{' '}
              <span className="font-semibold text-gallery">
                {result.difficulty}
              </span>
            </span>
            <span className="text-santas-gray">
              제출 시각:{' '}
              <span className="font-semibold text-gallery">
                {formatDateTime(result.submittedAt)}
              </span>
            </span>
            <span className="text-santas-gray">
              응시 회차:{' '}
              <span className="font-semibold text-gallery">
                {result.attemptOrdinal}/{result.maxAttempts}
              </span>
            </span>
            {result.chatModel && (
              <span className="text-santas-gray">
                응시 모델:{' '}
                <span className="font-semibold text-gallery">
                  {result.chatModel}
                </span>
                {result.premium && (
                  <span className="ml-1.5 rounded-full bg-biscay px-1.5 py-px text-[10px] font-bold text-jungle-mist">
                    PAID
                  </span>
                )}
              </span>
            )}
          </div>
        </header>

        {/* ② 채점 총평 (독립 전폭) */}
        <section className="flex flex-col gap-5 rounded-xl border border-gallery-9 bg-mirage p-[25px]">
          <div>
            <h2 className="text-xl font-bold text-gallery">채점 총평</h2>
            <p className="mt-2 text-sm font-medium text-santas-gray">
              AI 루브릭 채점 — 최종 결과물과 대화 이력을 함께 평가
            </p>
          </div>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-gallery">
            {result.feedback}
          </p>
        </section>

        {/* ③ 산점도 + 최종 점수 (2단) */}
        <section className="flex gap-7">
          <div className="flex flex-1 flex-col gap-5 rounded-xl border border-gallery-9 bg-mirage p-[25px]">
            <div>
              <h2 className="text-xl font-bold text-gallery">내 위치 분포도</h2>
              <p className="mt-2 text-sm font-medium text-santas-gray">
                품질·효율 점수 기준
              </p>
            </div>
            <ResultScatterChart dots={scatterDots} />
          </div>

          <div className="flex flex-1 flex-col gap-1.5 rounded-xl border border-gallery-9 bg-mirage p-[25px]">
            <h2 className="mb-2 text-xl font-bold text-gallery">최종 점수</h2>

            <ScoreRow label="품질 점수" value={result.rubricScore ?? 0} />
            <ScoreRow label="효율성 점수" value={result.efficiencyScore ?? 0} />
            <ScoreRow label="종합 점수" value={result.finalScore ?? 0} big />
            <PercentileRow percentile={percentile} />

            <div className="mt-auto flex flex-col gap-3.5 p-2.5">
              <span className="text-xs font-semibold tracking-[0.88px] text-santas-gray uppercase">
                참고
              </span>
              <ul className="flex flex-col gap-2">
                {referenceNotes.map((note) => (
                  <li key={note} className="text-sm text-santas-gray">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ④ 루브릭 항목별 점수 */}
        {rubricItems.length > 0 && (
          <section className="flex flex-col gap-4 rounded-xl border border-gallery-9 bg-mirage p-[25px]">
            <h2 className="text-xl font-bold text-gallery">
              루브릭 항목별 점수
            </h2>
            {rubricItems.map((item) => (
              <RubricItem key={item.id} data={item} />
            ))}
          </section>
        )}

        {/* ⑤ 프롬프트 제출 이력 */}
        <section className="flex flex-col gap-1.5 rounded-xl border border-gallery-9 bg-mirage p-[25px]">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-gallery">
              프롬프트 제출 이력
            </h2>
            <p className="mt-1 text-sm text-santas-gray">
              각 프롬프트와 토큰 사용량
            </p>
          </div>

          {timeline.length > 0 ? (
            <div className="flex flex-col">
              {timeline.map((attempt, index) => (
                <AttemptTimelineItem
                  key={attempt.id}
                  attempt={attempt}
                  isLast={index === timeline.length - 1}
                />
              ))}
            </div>
          ) : (
            <p className="py-4 text-sm text-santas-gray">
              AI와 주고받은 대화 없이 제출된 응시입니다.
            </p>
          )}

          <div className="flex items-center justify-between rounded-lg border border-wedgewood bg-wedgewood/[0.08] p-4">
            <span className="text-xs text-santas-gray">누적 토큰 사용량</span>
            <span className="text-xl font-bold text-wedgewood">
              {result.totalTokens.toLocaleString()}
            </span>
          </div>
        </section>

        {/* ⑥ 하단 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="lg"
            className="h-[44px] border border-transparent"
            onClick={() => navigate('/problems')}
          >
            다음 문제로
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-[44px]"
            onClick={() => navigate('/leaderboard')}
          >
            리더보드 보기
          </Button>
        </div>
      </main>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  big,
}: {
  label: string;
  value: number;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gallery-9 py-4">
      <span
        className={`font-semibold text-gallery ${big ? 'text-lg' : 'text-base'}`}
      >
        {label}
      </span>
      <span
        className={`flex items-center gap-1 rounded-md font-bold ${
          big
            ? 'border border-wedgewood bg-wedgewood px-5 py-2 text-2xl text-white shadow-[0_0_18px_rgba(80,140,155,0.45)]'
            : 'border border-wedgewood bg-wedgewood/20 px-3 py-1 text-sm text-wedgewood'
        }`}
      >
        {value}
        <span
          className={`font-normal ${big ? 'text-xs text-white/70' : 'text-[11px] text-santas-gray'}`}
        >
          /100
        </span>
      </span>
    </div>
  );
}

function PercentileRow({ percentile }: { percentile: number | null }) {
  return (
    <div className="flex items-center justify-between border-b border-gallery-9 py-4">
      <span className="text-base font-semibold text-gallery">백분위</span>
      <span className="rounded-md border border-wedgewood bg-wedgewood/25 px-4 py-1.5 text-base font-bold text-wedgewood">
        {percentile === null ? '—' : `상위 ${percentile}%`}
      </span>
    </div>
  );
}
