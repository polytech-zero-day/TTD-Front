import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import ResultScatterChart from '../components/feature/result/ResultScatterChart';
import RubricItem from '../components/feature/result/RubricItem';
import AttemptTimelineItem from '../components/feature/result/AttemptTimelineItem';
import {
  dummyMeta,
  dummyScore,
  dummyRubric,
  dummyAttempts,
  dummyTotalTokens,
  dummyReferenceNotes,
  dummyScatterDots,
} from '../data/dummyResult';

const dummyUser = { name: '김지수', plan: 'FREE' as const };

export default function ResultPage() {
  return (
    <div className="w-full min-h-screen bg-ebony font-sans">
      <Topbar active="catalog" userName={dummyUser.name} plan={dummyUser.plan} />

      <main className="flex flex-col gap-5 w-full max-w-[1240px] mx-auto px-10 pt-8 pb-20">
        {/* 헤더 */}
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-white">채점 결과</h1>
          <p className="text-base text-santas-gray">
            {dummyMeta.problemName} · {dummyMeta.difficulty}
          </p>
          <div className="flex items-center gap-6 text-sm mt-1">
            <span className="text-santas-gray">
              문제: <span className="text-gallery font-semibold">{dummyMeta.problemName}</span>
            </span>
            <span className="text-santas-gray">
              난이도: <span className="text-gallery font-semibold">{dummyMeta.difficulty}</span>
            </span>
            <span className="text-santas-gray">
              채점 완료:{' '}
              <span className="text-gallery font-semibold">{dummyMeta.completedAt}</span>
            </span>
            <span className="text-santas-gray">
              최종 시도:{' '}
              <span className="text-gallery font-semibold">{dummyMeta.finalAttemptRatio}</span>
            </span>
          </div>
        </header>

        {/* 산점도 + 최종 점수 2단 */}
        <section className="flex gap-7">
          <div className="flex-1 flex flex-col gap-5 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
            <div>
              <h2 className="text-xl font-bold text-gallery">품질 vs 효율성</h2>
              <p className="text-sm font-medium text-santas-gray mt-1">
                최고 품질점수(3회 중) 기준 / 효율성은 시도 횟수 + 누적 토큰 기반
              </p>
            </div>
            <ResultScatterChart dots={dummyScatterDots} />
          </div>

          <div className="flex-1 flex flex-col gap-1.5 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
            <h2 className="text-xl font-bold text-gallery mb-2">최종 점수</h2>

            <ScoreRow label="품질 점수" value={dummyScore.quality} />
            <ScoreRow label="효율성 점수" value={dummyScore.efficiency} />
            <ScoreRow label="종합 점수" value={dummyScore.final} big />
            <PercentileRow percentile={dummyScore.percentile} />

            <div className="flex flex-col gap-3.5 p-2.5 mt-2">
              <span className="text-[10.5px] font-semibold tracking-[0.88px] text-santas-gray uppercase">
                참고
              </span>
              <ul className="flex flex-col gap-2">
                {dummyReferenceNotes.map((note) => (
                  <li key={note} className="text-xs text-santas-gray">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 루브릭 항목별 점수 */}
        <section className="flex flex-col gap-4 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
          <h2 className="text-xl font-bold text-gallery">루브릭 항목별 점수</h2>
          {dummyRubric.map((item) => (
            <RubricItem key={item.id} data={item} />
          ))}
        </section>

        {/* 프롬프트 제출 이력 */}
        <section className="flex flex-col gap-1.5 p-[25px] bg-mirage border border-gallery-9 rounded-xl">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-gallery">프롬프트 제출 이력</h2>
            <p className="text-sm text-santas-gray mt-1">
              각 시도의 프롬프트, 토큰 사용량, 채점 결과
            </p>
          </div>

          <div className="flex flex-col">
            {dummyAttempts.map((attempt, index) => (
              <AttemptTimelineItem
                key={attempt.id}
                attempt={attempt}
                isLast={index === dummyAttempts.length - 1}
              />
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-wedgewood/[0.08] border border-wedgewood rounded-lg">
            <span className="text-xs text-santas-gray">누적 토큰 사용량</span>
            <span className="text-xl font-bold text-wedgewood">
              {dummyTotalTokens.toLocaleString()}
            </span>
          </div>
        </section>

        {/* 하단 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = '/problems')}
          >
            다음 문제로
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.href = '/leaderboard')}
          >
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
      <span className="text-base font-semibold text-gallery">{label}</span>
      <span
        className={`flex items-center gap-1 rounded-md border border-wedgewood bg-wedgewood/20 font-bold text-wedgewood ${
          big ? 'px-4 py-1.5 text-lg' : 'px-3 py-1 text-sm'
        }`}
      >
        {value}
        <span className="text-santas-gray text-[11px] font-normal">/100</span>
      </span>
    </div>
  );
}

function PercentileRow({ percentile }: { percentile: number }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gallery-9">
      <span className="text-base font-semibold text-gallery">백분위</span>
      <span className="px-3 py-1.5 rounded-md bg-charade text-gallery text-sm font-bold">
        상위 {percentile}%
      </span>
    </div>
  );
}
