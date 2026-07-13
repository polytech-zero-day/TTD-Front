import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import RankingTable from '../components/RankingTable';
import Select from '@/components/ui/Select.tsx';
import Button from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  fetchLeaderboard,
  type Leaderboard as LeaderboardData,
} from '@/lib/api/leaderboard';
import { fetchProblems } from '@/lib/api/problems';
import { isAuthenticated } from '@/lib/auth/session';
import type { ProblemSummary } from '@/types/problem';

type TabKey = 'overall' | 'byProblem';

function InsufficientLeaderboardData({
  isLoggedIn,
  onBrowseProblems,
}: {
  isLoggedIn: boolean;
  onBrowseProblems: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
      <p className="text-base font-semibold text-gallery">
        아직 리더보드 데이터가 충분하지 않습니다.
      </p>
      <p className="text-sm text-santas-gray">
        첫 번째 응시 결과를 제출해 랭킹을 만들어보세요.
      </p>
      <Button variant="outline" size="sm" onClick={onBrowseProblems}>
        {isLoggedIn ? '문제 풀러 가기' : '문제 둘러보기'}
      </Button>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overall');
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(
    null
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [ready, setReady] = useState(false);
  const isLoggedIn = isAuthenticated();

  // 공개 리더보드의 문제별 필터용 문제 목록 로드.
  useEffect(() => {
    let cancelled = false;
    fetchProblems()
      .then((probs) => {
        if (cancelled) return;
        setProblems(probs);
        const firstProblem = probs[0];
        if (firstProblem) setSelectedProblemId(firstProblem.id);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('문제 목록을 불러오지 못했습니다. 전체 랭킹만 표시합니다.');
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // 랭킹 페칭: activeTab / selectedProblemId 변화마다
  useEffect(() => {
    if (!ready) return;
    if (activeTab === 'byProblem' && selectedProblemId === null) return;

    let canceled = false;
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
          toast.error(getApiErrorMessage(err, '랭킹을 불러오지 못했습니다.'));
        }
      });

    return () => {
      canceled = true;
    };
  }, [activeTab, selectedProblemId, ready, navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen w-full bg-ebony font-sans">
        <Topbar active="leaderboard" />
        <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-5 px-10 pt-8 pb-20">
          <p className="text-[13px] text-santas-gray">불러오는 중…</p>
        </main>
      </div>
    );
  }

  const stats = leaderboard?.stats ?? null;
  const rows = leaderboard?.rows ?? [];
  const hasSufficientRankingData = rows.length >= 2;

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
  const rankingContent = !leaderboard ? (
    <p className="px-5 py-6 text-[13px] text-santas-gray">불러오는 중…</p>
  ) : hasSufficientRankingData ? (
    <RankingTable entries={rows} />
  ) : (
    <InsufficientLeaderboardData
      isLoggedIn={isLoggedIn}
      onBrowseProblems={() => navigate('/problems')}
    />
  );

  return (
    <div className="min-h-screen w-full bg-ebony font-sans">
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
            sub={activeTab === 'overall' ? '문제당 평균' : '이 문제 평균'}
            accent
          />
          <StatCard
            label="내 순위"
            value={isLoggedIn ? myRankValue : '—'}
            valueSuffix={isLoggedIn ? myRankSuffix : undefined}
            sub={isLoggedIn ? myRankSub : '로그인 후 내 순위 확인'}
          />
        </section>

        {activeTab === 'overall' ? (
          <div className="flex max-h-[821px] flex-col overflow-hidden rounded-xl border border-gallery-9 bg-mirage shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
            <div className="flex items-center p-5">
              <div>
                <div className="text-[14.6px] font-semibold text-gallery">
                  전체 랭킹
                </div>
                <div className="mt-1 text-xs text-santas-gray">
                  품질·효율 종합 점수 기준
                </div>
              </div>
            </div>
            <div className="scrollbar-themed min-h-0 flex-1 overflow-y-auto">
              {rankingContent}
            </div>
          </div>
        ) : (
          <div className="flex max-h-[821px] flex-col overflow-hidden rounded-xl border border-gallery-9 bg-mirage shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <div className="text-[14.6px] font-semibold text-gallery">
                  문제별 랭킹
                </div>
                <div className="mt-1 text-xs text-santas-gray">
                  선택한 문제 기준 상위 랭킹
                </div>
              </div>
              <Select
                variant="form"
                className="max-w-96 min-w-56"
                value={
                  selectedProblemId !== null ? String(selectedProblemId) : ''
                }
                onChange={(e) => setSelectedProblemId(Number(e.target.value))}
              >
                {problems.map((p) => (
                  <option
                    key={p.id}
                    value={String(p.id)}
                    className="bg-ebony text-gallery"
                  >
                    {p.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="scrollbar-themed min-h-0 flex-1 overflow-y-auto">
              {rankingContent}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
