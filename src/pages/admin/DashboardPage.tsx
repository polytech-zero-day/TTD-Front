import { useMemo } from 'react';
import StatCard from '@/components/StatCard';
import StatusDistributionChart from '@/components/feature/admin/StatusDistributionChart';
import RecentActivityFeed, {
  type ActivityItem,
} from '@/components/feature/admin/RecentActivityFeed';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminProblems } from '@/hooks/useAdminProblems';
import type { ProblemStatus } from '@/types/problem';

const RECENT_ACTIVITY_LIMIT = 8;

export default function DashboardPage() {
  const { users, isLoading: usersLoading, error: usersError } = useAdminUsers();
  const {
    problems,
    isLoading: problemsLoading,
    error: problemsError,
  } = useAdminProblems();

  const isLoading = usersLoading || problemsLoading;
  const error = usersError ?? problemsError;

  const statusCounts = useMemo(() => {
    const counts: Record<ProblemStatus, number> = {
      draft: 0,
      pending: 0,
      active: 0,
    };
    for (const problem of problems) counts[problem.status] += 1;
    return counts;
  }, [problems]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const userEvents: ActivityItem[] = users.map((user) => ({
      id: `user-${user.id}`,
      type: 'user',
      title: user.nickname,
      detail: '신규 가입',
      timestamp: user.createdAt,
    }));
    const problemEvents: ActivityItem[] = problems.map((problem) => ({
      id: `problem-${problem.id}`,
      type: 'problem',
      title: problem.title,
      detail: '문제 등록',
      timestamp: problem.createdAt,
    }));
    return [...userEvents, ...problemEvents]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, RECENT_ACTIVITY_LIMIT);
  }, [users, problems]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[22.7px] font-bold tracking-[-0.24px] text-gallery">
          대시보드
        </h1>
        <p className="text-[13.3px] text-santas-gray">
          사용자와 문제 현황을 한눈에 확인합니다.
        </p>
      </div>

      {error && (
        <p className="text-[13px] font-medium text-gallery">⚠ {error}</p>
      )}

      {isLoading ? (
        <p className="text-[13px] text-santas-gray">불러오는 중…</p>
      ) : (
        <>
          <section className="flex gap-3.5">
            <StatCard
              label="전체 사용자"
              value={String(users.length)}
              sub="가입 완료 기준"
            />
            <StatCard
              label="관리자 수"
              value={String(users.filter((u) => u.role === 'ADMIN').length)}
              sub="ADMIN 권한"
            />
            <StatCard
              label="전체 문제"
              value={String(problems.length)}
              sub="등록된 문제"
              accent
            />
            <StatCard
              label="게시된 문제"
              value={String(statusCounts.active)}
              sub="사용자에게 노출 중"
              accent
            />
          </section>

          <section className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-sm font-semibold text-gallery">
                문제 상태 분포
              </h2>
              <StatusDistributionChart counts={statusCounts} />
            </div>
            <div className="flex flex-col gap-2.5">
              <h2 className="text-sm font-semibold text-gallery">최근 활동</h2>
              <RecentActivityFeed items={recentActivity} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
