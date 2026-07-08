import { useState } from 'react';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import RankingTable from '../components/RankingTable';
import {
  dummyTopStats,
  dummyOverallRanking,
  dummyProblems,
  getProblemRanking,
} from '../data/dummyLeaderboard';

const dummyUser = { name: '김지수', plan: 'FREE' as const };

type TabKey = 'overall' | 'byProblem';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('overall');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    dummyProblems[0]?.id ?? ''
  );
  const problemRanking = getProblemRanking(selectedProblemId);

  return (
    <div className="w-[1920px] min-h-[1200px] bg-ebony font-sans">
      <Topbar active="leaderboard" userName={dummyUser.name} plan={dummyUser.plan} />

      <main className="flex flex-col gap-5 w-[1160px] mx-auto px-10 pt-8 pb-20">
        <h1 className="text-xl font-bold text-gallery">리더보드</h1>
        <Tabs
          items={[
            { key: 'overall', label: '전체 랭킹' },
            { key: 'byProblem', label: '문제별 랭킹' },
          ]}
          active={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
        />

        {/* 통계 카드 3개 */}
        <section className="flex gap-3.5">
          <StatCard
            label="상위 10명 평균 시도 횟수"
            value={`${dummyTopStats.avgTopAttempts}회`}
            sub="3회 제한 기준"
            accent
          />
          <StatCard
            label="상위 10명 평균 토큰 사용량"
            value={dummyTopStats.avgTopTokens.toLocaleString()}
            sub="문제당 누적"
            accent
          />
          <StatCard
            label="내 전체 순위"
            value={String(dummyTopStats.myRank)}
            valueSuffix="위"
            sub={`상위 ${dummyTopStats.myPercentile}%`}
          />
        </section>

        {activeTab === 'overall' ? (
          <div className="flex flex-col max-h-[821px] overflow-hidden bg-mirage border border-gallery-9 shadow-[0_1px_2px_rgba(0,0,0,0.28)] rounded-xl">
            <div className="flex items-center p-5">
              <div>
                <div className="text-[14.6px] font-semibold text-gallery">전체 랭킹</div>
                <div className="text-xs text-santas-gray mt-1">품질·효율 종합 점수 기준</div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-themed">
              <RankingTable entries={dummyOverallRanking} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col max-h-[821px] overflow-hidden bg-mirage border border-gallery-9 shadow-[0_1px_2px_rgba(0,0,0,0.28)] rounded-xl">
            <div className="flex items-center justify-between p-5 gap-4">
              <div>
                <div className="text-[14.6px] font-semibold text-gallery">문제별 랭킹</div>
                <div className="text-xs text-santas-gray mt-1">
                  선택한 문제 기준 상위 랭킹
                </div>
              </div>
              {/* TODO: 백엔드 연동 후 실제 문제 목록/문제별 랭킹 API로 교체 */}
              <select
                value={selectedProblemId}
                onChange={(e) => setSelectedProblemId(e.target.value)}
                className="bg-ebony border border-gallery-9 text-gallery text-sm rounded-md px-3 py-2 cursor-pointer focus:outline-none focus:border-wedgewood"
              >
                {dummyProblems.map((p) => (
                  <option key={p.id} value={p.id} className="bg-mirage text-gallery">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-themed">
              <RankingTable entries={problemRanking} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
