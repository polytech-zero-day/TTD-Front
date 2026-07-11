import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import RankingTable from '../components/RankingTable';
import Select from '@/components/ui/Select.tsx';
import { ApiError } from '@/lib/api/client';
import {
  fetchLeaderboard,
  type Leaderboard as LeaderboardData,
} from '@/lib/api/leaderboard';
import { fetchProblems } from '@/lib/api/problems';
import { fetchMyProfile, type MyProfile } from '@/lib/api/userProfile';
import type { ProblemSummary } from '@/types/problem';

type TabKey = 'overall' | 'byProblem';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overall');
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null,
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [ready, setReady] = useState(false);

  // 초기 로드: profile + problems (실패 시 케이스 B)
  useEffect(() => {
    Promise.all([fetchMyProfile(), fetchProblems()])
      .then(([p, probs]) => {
        setProfile(p);
        setProblems(probs);
        const firstProblem = probs[0];
        if (firstProblem) setSelectedProblemId(firstProblem.id);
        setReady(true);
      })
      .catch(() => {
        toast.error('랭킹을 불러오지 못했습니다.');
        navigate('/', { replace: true });
      });
  }, [navigate]);

  // 랭킹 페칭: activeTab / selectedProblemId 변화마다
  useEffect(() => {
    if (!ready) return;
    if (activeTab === 'byProblem' && selectedProblemId === null) return;

    let canceled = false;
    setLeaderboard(null); // 탭 전환 중 통계 카드 "—"로 리셋

    const params =
      activeTab === 'byProblem'
        ? { problemId: selectedProblemId as number }
        : undefined;

    fetchLeaderboard(params)
      .then((lb) => {
        if (!canceled) setLeaderboard(lb);
      })
      .catch((err: unknown) => {
        if (canceled) return;
        if (activeTab === 'overall') {
          // 케이스 B — 전체 랭킹은 페이지 핵심
          toast.error('랭킹을 불러오지 못했습니다.');
          navigate('/', { replace: true });
        } else {
          // 케이스 A — 문제별 랭킹은 백엔드 message 우선
          toast.error(
            err instanceof ApiError
              ? err.message
              : '랭킹을 불러오지 못했습니다.',
          );
        }
      });

    return () => {
      canceled = true;
    };
  }, [activeTab, selectedProblemId, ready, navigate]);

  if (!ready || !profile) {
    return (
      <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
        <Topbar active="leaderboard" />
        <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-5 px-10 pt-8 pb-20">
          <p className="text-[13px] text-santas-gray">불러오는 중…</p>
        </main>
      </div>
    );
  }

  const stats = leaderboard?.stats ?? null;
  const rows = leaderboard?.rows ?? [];

  const avgAttemptsText =
    stats?.avgTopAttempts !== null && stats?.avgTopAttempts !== undefined
      ? `${stats.avgTopAttempts}회`
      : '—';
  const avgTokensText =
    stats?.avgTopTokens !== null && stats?.avgTopTokens !== undefined
      ? stats.avgTopTokens.toLocaleString()
      : '—';
  const myRankValue =
    stats?.myRank !== null && stats?.myRank !== undefined
      ? String(stats.myRank)
      : '—';
  const myRankSuffix =
    stats?.myRank !== null && stats?.myRank !== undefined ? '위' : undefined;
  const myRankSub =
    stats?.myPercentile !== null && stats?.myPercentile !== undefined
      ? `상위 ${stats.myPercentile}%`
      : '집계 없음';

  return (
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar active="leaderboard" />

      <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-5 px-10 pt-8 pb-20">
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
            value={avgAttemptsText}
            sub="3회 제한 기준"
            accent
          />
          <StatCard
            label="상위 10명 평균 토큰 사용량"
            value={avgTokensText}
            sub="문제당 누적"
            accent
          />
          <StatCard
            label="내 순위"
            value={myRankValue}
            valueSuffix={myRankSuffix}
            sub={myRankSub}
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
              {leaderboard ? (
                <RankingTable entries={rows} />
              ) : (
                <p className="px-5 py-6 text-[13px] text-santas-gray">
                  불러오는 중…
                </p>
              )}
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
              <Select
                variant="form"
                className="w-56"
                value={selectedProblemId !== null ? String(selectedProblemId) : ''}
                onChange={(e) => setSelectedProblemId(Number(e.target.value))}
              >
                {problems.map((p) => (
                  <option key={p.id} value={String(p.id)} className="bg-mirage text-gallery">
                    {p.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-themed">
              {leaderboard ? (
                <RankingTable entries={rows} />
              ) : (
                <p className="px-5 py-6 text-[13px] text-santas-gray">
                  불러오는 중…
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
