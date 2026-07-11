import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import RubricItem from '../components/feature/result/RubricItem';
import AttemptTimelineItem from '../components/feature/result/AttemptTimelineItem';
import { getAttemptResult, type AttemptResult } from '@/lib/api/attempt';
import type { AttemptRecord, RubricCriterionData } from '../types/result';


// "2026-07-10T15:34:28.123" → "2026-07-10 15:34:28"
const formatDateTime = (iso: string | null) =>
  iso ? iso.replace('T', ' ').slice(0, 19) : '-';
const formatTime = (iso?: string) => (iso ? iso.slice(11, 19) : '');

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<AttemptResult | null>(null);

  useEffect(() => {
    getAttemptResult(Number(attemptId))
      .then(setResult)
      .catch(() => {
        toast.error('채점 결과를 불러오지 못했습니다.');
        navigate('/problems', { replace: true });
      });
  }, [attemptId, navigate]);

  // 루브릭 항목·프롬프트 이력을 기존 표시 컴포넌트의 형태로 매핑
  const rubricItems = useMemo<RubricCriterionData[]>(
    () =>
      (result?.criteria ?? []).map((c, i) => ({
        id: String(i),
        title: `${i + 1}. ${c.name}`,
        scoreDisplay: { type: 'score', earned: c.score, max: c.maxScore },
        description: c.comment,
      })),
    [result]
  );

  const timeline = useMemo<AttemptRecord[]>(() => {
    const records: AttemptRecord[] = [];
    const messages = result?.messages ?? [];
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
    return records;
  }, [result]);

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-ebony">
        <span className="text-sm text-santas-gray">채점 결과를 불러오는 중…</span>
      </div>
    );
  }

  if (result.status !== 'GRADED') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-ebony">
        <span className="text-sm text-santas-gray">
          아직 채점이 완료되지 않은 응시입니다.
        </span>
        <Button variant="outline" size="md" onClick={() => navigate('/problems')}>
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
    <div className="w-full min-h-screen bg-ebony font-sans">
      <Topbar active="catalog" />

      <main className="flex flex-col gap-5 w-full max-w-[1240px] mx-auto px-10 pt-8 pb-20">
        {/* 헤더 */}
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-white">채점 결과</h1>
          <p className="text-base text-santas-gray">
            {result.problemTitle} · {result.difficulty}
          </p>
          <div className="flex items-center gap-6 text-sm mt-1">
            <span className="text-santas-gray">
              문제: <span className="text-gallery font-semibold">{result.problemTitle}</span>
            </span>
            <span className="text-santas-gray">
              난이도: <span className="text-gallery font-semibold">{result.difficulty}</span>
            </span>
            <span className="text-santas-gray">
              제출 시각:{' '}
              <span className="text-gallery font-semibold">
                {formatDateTime(result.submittedAt)}
              </span>
            </span>
            <span className="text-santas-gray">
              응시 회차:{' '}
              <span className="text-gallery font-semibold">
                {result.attemptOrdinal}/{result.maxAttempts}
              </span>
            </span>
          </div>
        </header>

        {/* 채점 총평 + 최종 점수 2단 */}
        <section className="flex gap-7">
          <div className="flex-1 flex flex-col gap-5 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
            <div>
              <h2 className="text-xl font-bold text-gallery">채점 총평</h2>
              <p className="text-sm font-medium text-santas-gray mt-1">
                AI 루브릭 채점 — 최종 결과물과 대화 이력을 함께 평가
              </p>
            </div>
            <p className="text-[15px] text-gallery leading-relaxed whitespace-pre-wrap">
              {result.feedback}
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
            <h2 className="text-xl font-bold text-gallery mb-2">최종 점수</h2>

            <ScoreRow label="품질 점수" value={result.rubricScore ?? 0} />
            <ScoreRow label="효율성 점수" value={result.efficiencyScore ?? 0} />
            <ScoreRow label="종합 점수" value={result.finalScore ?? 0} big />

            <div className="flex flex-col gap-3.5 p-2.5 mt-auto">
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

        {/* 루브릭 항목별 점수 */}
        {rubricItems.length > 0 && (
          <section className="flex flex-col gap-4 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
            <h2 className="text-xl font-bold text-gallery">루브릭 항목별 점수</h2>
            {rubricItems.map((item) => (
              <RubricItem key={item.id} data={item} />
            ))}
          </section>
        )}

        {/* 프롬프트 제출 이력 */}
        <section className="flex flex-col gap-1.5 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-gallery">프롬프트 제출 이력</h2>
            <p className="text-sm text-santas-gray mt-1">각 프롬프트와 토큰 사용량</p>
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
            <p className="text-sm text-santas-gray py-4">
              AI와 주고받은 대화 없이 제출된 응시입니다.
            </p>
          )}

          <div className="flex items-center justify-between p-4 bg-wedgewood/[0.08] border border-wedgewood rounded-lg">
            <span className="text-xs text-santas-gray">누적 토큰 사용량</span>
            <span className="text-xl font-bold text-wedgewood">
              {result.totalTokens.toLocaleString()}
            </span>
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="flex gap-2">
          <Button variant="primary" size="lg" onClick={() => navigate('/problems')}>
            다음 문제로
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/leaderboard')}>
            리더보드 보기
          </Button>
        </div>
      </main>
    </div>
  );
}

function ScoreRow({ label, value, big }: { label: string; value: number; big?: boolean }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gallery-9">
      <span className={`font-semibold text-gallery ${big ? 'text-lg' : 'text-base'}`}>
        {label}
      </span>
      <span
        className={`flex items-center gap-1 rounded-md font-bold ${
          big
            ? 'px-5 py-2 bg-wedgewood border border-wedgewood text-white text-2xl shadow-[0_0_18px_rgba(80,140,155,0.45)]'
            : 'px-3 py-1 bg-wedgewood/20 border border-wedgewood text-wedgewood text-sm'
        }`}
      >
        {value}
        <span
          className={`font-normal ${big ? 'text-white/70 text-xs' : 'text-santas-gray text-[11px]'}`}
        >
          /100
        </span>
      </span>
    </div>
  );
}
