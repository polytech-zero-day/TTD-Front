import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import ScatterPlot from '../components/ScatterPlot';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  dummyUser,
  dummyStats,
  dummyHistory,
  dummyScatterPoints,
} from '../data/dummyMyPage';

export default function MyPage() {
  return (
    <div className="w-full min-h-[1200px] bg-ebony font-sans">
      <Topbar active="mypage" userName={dummyUser.name} plan={dummyUser.plan} />

      <main className="flex flex-col gap-[22px] w-full max-w-[1160px] mx-auto px-5 pt-8 pb-20">
        {/* 프로필 패널 */}
        <section className="flex items-center gap-[18px] p-[22px] bg-mirage border border-gallery-9 shadow-[0_1px_2px_rgba(0,0,0,0.28)] rounded-xl">
          <Avatar initial={dummyUser.name.charAt(0)} size="lg" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gallery">{dummyUser.name}</span>
              <Badge tone="pill">{dummyUser.plan}</Badge>
            </div>
            <div className="text-base text-santas-gray">
              가입일 {dummyUser.joinedAt} · 총 제출 {dummyUser.totalSubmissions}회 · 최근 응시{' '}
              {dummyUser.lastAttemptAt}
            </div>
          </div>
          <Button variant="outline" size="lg" onClick={() => (window.location.href = '/pricing')}>
            요금제 보기
          </Button>
        </section>

        {/* 통계 카드 4개 */}
        <section className="flex gap-3.5">
          <StatCard
            label="평균 품질 점수"
            value={dummyStats.avgQualityScore.toFixed(1)}
            sub="최근 10회 기준"
            accent
          />
          <StatCard
            label="평균 효율 점수"
            value={dummyStats.avgEfficiencyScore.toFixed(1)}
            sub="시도·토큰 종합"
            accent
          />
          <StatCard
            label="총 시도 횟수"
            value={String(dummyStats.totalAttempts)}
            sub={`${dummyUser.totalSubmissions}개 문제`}
          />
          <StatCard label="총 토큰 사용량" value={dummyStats.totalTokens} sub="입력+출력 합계" />
        </section>

        {/* 산점도 + 제출 이력 */}
        <section className="flex gap-5 items-stretch">
          <div className="flex-1 min-w-0 bg-mirage border border-gallery-9 shadow-[0_1px_2px_rgba(0,0,0,0.28)] rounded-xl">
            <div className="flex items-center p-5">
              <div>
                <div className="text-lg font-semibold text-gallery">품질 – 효율 산점도</div>
                <div className="text-sm text-santas-gray mt-1">전체 응시자 대비 내 위치</div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <ScatterPlot points={dummyScatterPoints} />
              <div className="flex justify-between mt-2 text-[11.5px] text-santas-gray">
                <span>← 효율성 낮음</span>
                <span>효율성 높음 →</span>
              </div>
            </div>
          </div>

          <div className="flex-[1.3] min-w-0 flex flex-col overflow-hidden bg-mirage border border-gallery-9 shadow-[0_1px_2px_rgba(0,0,0,0.28)] rounded-xl">
            <div className="flex items-center justify-between p-5">
              <div className="text-lg font-semibold text-gallery">제출 이력</div>
              <Badge tone="neutral">최근 {dummyHistory.length}건</Badge>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-themed px-5 pb-5">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="sticky top-0 bg-mirage text-left py-3 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
                      문제명
                    </th>
                    <th className="sticky top-0 bg-mirage text-left py-3 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
                      제출일
                    </th>
                    <th className="sticky top-0 bg-mirage text-right py-3 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
                      품질
                    </th>
                    <th className="sticky top-0 bg-mirage text-right py-3 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
                      효율
                    </th>
                    <th className="sticky top-0 bg-mirage text-left py-3 px-3.5 text-xs font-semibold uppercase tracking-[0.46px] text-santas-gray">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dummyHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3.5 text-[13.5px] text-gallery">{item.problemName}</td>
                      <td className="py-3 px-3.5 text-[13.5px] text-gallery">{item.submittedAt}</td>
                      <td className="py-3 px-3.5 text-right text-[13.5px] text-gallery">
                        {item.qualityScore}
                      </td>
                      <td className="py-3 px-3.5 text-right text-[13.5px] text-gallery">
                        {item.efficiencyScore}
                      </td>
                      <td className="py-3 px-3.5">
                        <Badge tone="success">{item.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 유료 업그레이드 유도 패널 */}
        <section className="flex items-center gap-3.5 p-5 bg-mirage border border-gallery-9 shadow-[0_1px_2px_rgba(0,0,0,0.28)] rounded-xl">
          <span className="text-2xl">🔒</span>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gallery">심화 리포트는 유료 플랜에서 제공돼요</div>
            <div className="text-sm text-santas-gray mt-0.5">
              성장 추이 그래프와 약점 분석으로 더 깊은 인사이트를 확인하세요.
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => (window.location.href = '/pricing')}>
            업그레이드
          </Button>
        </section>
      </main>
    </div>
  );
}
