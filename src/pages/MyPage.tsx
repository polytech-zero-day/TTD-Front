import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import ScatterPlot, {
  type ScatterPoint as ChartPoint,
} from '../components/ScatterPlot';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { cancelSubscription, getMySubscription } from '@/lib/api/subscription';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatDate } from '@/lib/format';
import type { SubscriptionResponse } from '@/types/subscription';
import {
  fetchMyProfile,
  updateNickname,
  type MyProfile,
} from '@/lib/api/userProfile';
import {
  fetchMyAttempts,
  fetchMyStats,
  fetchScatterData,
  type MyAttemptStats,
  type MyAttemptSummary,
  type ScatterPoint as ApiScatterPoint,
} from '@/lib/api/myPage';

interface MyPageData {
  profile: MyProfile;
  attempts: MyAttemptSummary[];
  stats: MyAttemptStats;
  scatter: ApiScatterPoint[];
  subscription: SubscriptionResponse | null;
}

const fmtScore = (n: number | null) => (n === null ? '—' : n.toFixed(1));
const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : null);
const statusLabel = (s: MyAttemptSummary['status']) =>
  s === 'GRADED' ? '완료' : '진행중';

export default function MyPage() {
  const navigate = useNavigate();
  const { plan, refresh } = useCurrentUser();
  const [data, setData] = useState<MyPageData | null>(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  function goToAttempt(item: MyAttemptSummary) {
    if (item.status === 'GRADED') {
      navigate(`/result/${item.attemptId}`);
    } else {
      // IN_PROGRESS — 진행 중 세션 복원 (서버가 idempotent하게 처리)
      navigate(`/problems/${item.problemId}/attempt`);
    }
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchMyProfile(),
      fetchMyAttempts(),
      fetchMyStats(),
      fetchScatterData(),
      getMySubscription(),
    ])
      .then(([profile, attempts, stats, scatter, subscription]) => {
        if (cancelled) return;
        setData({ profile, attempts, stats, scatter, subscription });
      })
      .catch(() => {
        // StrictMode의 개발용 effect 재실행에서 정리된 첫 요청은 무시한다.
        if (cancelled) return;
        toast.error('마이페이지 정보를 불러오지 못했습니다.');
        navigate('/', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!data) {
    return (
      <div className="min-h-screen w-full bg-ebony font-sans">
        <Topbar active="mypage" />
        <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-[22px] px-5 pt-8 pb-20">
          <p className="text-[13px] text-santas-gray">불러오는 중…</p>
        </main>
      </div>
    );
  }

  const { profile, attempts, stats, scatter } = data;

  function startEditNickname() {
    setNicknameDraft(profile.nickname);
    setIsEditingNickname(true);
  }

  function cancelEditNickname() {
    setIsEditingNickname(false);
  }

  async function saveNickname() {
    const trimmed = nicknameDraft.trim();
    if (!trimmed || isSavingNickname) return;
    setIsSavingNickname(true);
    try {
      const updated = await updateNickname(trimmed);
      setData((current) =>
        current ? { ...current, profile: updated } : current
      );
      await refresh(); // Topbar 등 전역 사용자명 갱신
      toast.success('닉네임이 변경되었습니다.');
      setIsEditingNickname(false);
    } catch (err) {
      // 케이스 A: 백엔드 유효성 메시지(@NotBlank/@Size)를 그대로 노출
      toast.error(getApiErrorMessage(err, '닉네임 변경에 실패했습니다.'));
    } finally {
      setIsSavingNickname(false);
    }
  }

  async function handleCancelSubscription() {
    const nextBillingAt = data?.subscription?.nextBillingAt;
    if (!nextBillingAt) return;
    if (
      !window.confirm(
        `자동 갱신을 중단할까요? ${formatDate(nextBillingAt)}까지 PAID 혜택을 이용할 수 있습니다.`
      )
    ) {
      return;
    }
    try {
      const subscription = await cancelSubscription();
      setData((current) => (current ? { ...current, subscription } : current));
      await refresh();
      toast.success(
        '자동 갱신이 취소되었습니다. 현재 결제 주기 종료일까지 이용할 수 있습니다.'
      );
    } catch {
      toast.error('구독 취소에 실패했습니다. 다시 시도해주세요.');
    }
  }

  const joinedAt = fmtDate(profile.createdAt) ?? '—';
  const lastAttemptAt =
    fmtDate(attempts.find((a) => a.submittedAt)?.submittedAt ?? null) ?? '없음';
  const distinctProblems = new Set(attempts.map((a) => a.problemId)).size;

  const scatterForChart: ChartPoint[] = [
    ...scatter.map((p) => ({
      quality: p.rubricScore,
      efficiency: p.efficiencyScore,
    })),
    ...(stats.avgQualityScore !== null && stats.avgEfficiencyScore !== null
      ? [
          {
            quality: stats.avgQualityScore,
            efficiency: stats.avgEfficiencyScore,
            isCurrentUser: true,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen w-full bg-ebony font-sans">
      <Topbar active="mypage" />

      <main className="mx-auto flex w-full max-w-[1160px] flex-col gap-[22px] px-5 pt-8 pb-20">
        {/* 프로필 패널 */}
        <section className="flex items-center gap-[18px] rounded-xl border border-gallery-9 bg-mirage p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
          <Avatar initial={profile.nickname.charAt(0)} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              {isEditingNickname ? (
                <>
                  <input
                    type="text"
                    value={nicknameDraft}
                    onChange={(e) => setNicknameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void saveNickname();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEditNickname();
                      }
                    }}
                    disabled={isSavingNickname}
                    maxLength={30}
                    autoFocus
                    aria-label="새 닉네임"
                    className="min-w-0 rounded-md border border-gallery-9 bg-charade px-3 py-1 text-2xl font-bold text-gallery outline-none focus:border-wedgewood disabled:opacity-60"
                  />
                  <Badge tone={plan === 'PAID' ? 'paid' : 'pill'}>{plan}</Badge>
                  <button
                    type="button"
                    onClick={() => void saveNickname()}
                    disabled={!nicknameDraft.trim() || isSavingNickname}
                    aria-label="닉네임 저장"
                    title="저장 (Enter)"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-santas-gray hover:bg-charade hover:text-gallery disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-santas-gray"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 8.5 6.5 12 13 4.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditNickname}
                    disabled={isSavingNickname}
                    aria-label="닉네임 변경 취소"
                    title="취소 (Esc)"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-santas-gray hover:bg-charade hover:text-gallery disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 4 L12 12 M12 4 L4 12"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gallery">
                    {profile.nickname}
                  </span>
                  <Badge tone={plan === 'PAID' ? 'paid' : 'pill'}>{plan}</Badge>
                  <button
                    type="button"
                    onClick={startEditNickname}
                    className="cursor-pointer rounded-md px-2 py-1 text-xs text-santas-gray hover:bg-charade hover:text-gallery"
                  >
                    닉네임 변경
                  </button>
                </>
              )}
            </div>
            <div className="text-base text-santas-gray">
              가입일 {joinedAt} · 총 제출 {stats.totalAttempts}회 · 최근 응시{' '}
              {lastAttemptAt}
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/pricing')}
          >
            요금제 보기
          </Button>
        </section>

        {data.subscription && plan === 'PAID' && (
          <section className="flex items-center gap-4 rounded-xl border border-gallery-9 bg-mirage p-5 shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-gallery">
                PAID 월간 구독
              </div>
              <div className="mt-1 text-sm text-santas-gray">
                {data.subscription.cancelAtPeriodEnd
                  ? `${formatDate(data.subscription.nextBillingAt)}까지 이용 가능 · 자동 갱신이 취소되었습니다.`
                  : `다음 결제일 ${formatDate(data.subscription.nextBillingAt)} · 자동 갱신 중`}
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              disabled={data.subscription.cancelAtPeriodEnd}
              onClick={handleCancelSubscription}
            >
              {data.subscription.cancelAtPeriodEnd
                ? '취소 예약됨'
                : '구독 취소'}
            </Button>
          </section>
        )}

        {/* 통계 카드 4개 */}
        <section className="flex gap-3.5">
          <StatCard
            label="평균 품질 점수"
            value={fmtScore(stats.avgQualityScore)}
            sub="전체 평균"
            accent
          />
          <StatCard
            label="평균 효율 점수"
            value={fmtScore(stats.avgEfficiencyScore)}
            sub="시도·토큰 종합"
            accent
          />
          <StatCard
            label="총 시도 횟수"
            value={String(stats.totalAttempts)}
            sub={`${distinctProblems}개 문제`}
          />
          <StatCard
            label="총 토큰 사용량"
            value={stats.totalTokens.toLocaleString()}
            sub="입력+출력 합계"
          />
        </section>

        {/* 산점도 + 제출 이력 */}
        <section className="flex items-start gap-5">
          <div className="min-w-0 flex-1 rounded-xl border border-gallery-9 bg-mirage shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
            <div className="flex items-center p-5">
              <div>
                <div className="text-lg font-semibold text-gallery">
                  품질 – 효율 산점도
                </div>
                <div className="mt-1 text-sm text-santas-gray">
                  전체 응시자 대비 내 위치
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <ScatterPlot points={scatterForChart} />
            </div>
          </div>

          <div className="flex max-h-[460px] min-w-0 flex-[1.3] flex-col overflow-hidden rounded-xl border border-gallery-9 bg-mirage shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between p-5">
              <div className="text-lg font-semibold text-gallery">
                제출 이력
              </div>
              <Badge tone="neutral">최근 {attempts.length}건</Badge>
            </div>
            <div className="scrollbar-themed min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {attempts.length === 0 ? (
                <p className="px-3.5 py-6 text-[13.5px] text-santas-gray">
                  제출 이력이 없습니다.
                </p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky top-0 bg-mirage px-3.5 py-3 text-left text-xs font-semibold tracking-[0.46px] text-santas-gray uppercase">
                        문제명
                      </th>
                      <th className="sticky top-0 bg-mirage px-3.5 py-3 text-left text-xs font-semibold tracking-[0.46px] text-santas-gray uppercase">
                        제출일
                      </th>
                      <th className="sticky top-0 bg-mirage px-3.5 py-3 text-right text-xs font-semibold tracking-[0.46px] text-santas-gray uppercase">
                        품질
                      </th>
                      <th className="sticky top-0 bg-mirage px-3.5 py-3 text-right text-xs font-semibold tracking-[0.46px] text-santas-gray uppercase">
                        효율
                      </th>
                      <th className="sticky top-0 bg-mirage px-3.5 py-3 text-left text-xs font-semibold tracking-[0.46px] whitespace-nowrap min-w-[64px] text-santas-gray uppercase">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((item) => (
                      <tr
                        key={item.attemptId}
                        className="hover:bg-white/[0.02]"
                      >
                        <td className="px-3.5 py-3 text-[13.5px]">
                          <button
                            type="button"
                            onClick={() => goToAttempt(item)}
                            className="cursor-pointer text-left text-gallery hover:text-wedgewood/80 hover:underline"
                          >
                            {item.problemTitle}
                          </button>
                        </td>
                        <td className="px-3.5 py-3 text-[13.5px] text-gallery">
                          {fmtDate(item.submittedAt) ?? '-'}
                        </td>
                        <td className="px-3.5 py-3 text-right text-[13.5px] text-gallery">
                          {item.rubricScore ?? '-'}
                        </td>
                        <td className="px-3.5 py-3 text-right text-[13.5px] text-gallery">
                          {item.efficiencyScore ?? '-'}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <Badge
                            tone={
                              item.status === 'GRADED' ? 'success' : 'neutral'
                            }
                          >
                            {statusLabel(item.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {plan === 'FREE' && (
          <section className="flex items-center gap-3.5 rounded-xl border border-gallery-9 bg-mirage p-5 shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
            <span className="text-2xl">✨</span>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-gallery">
                유료 플랜으로 응시 제한 없이 연습하세요
              </div>
              <div className="mt-0.5 text-sm text-santas-gray">
                상위 AI 모델과 문제·프롬프트 무제한 응시를 이용할 수 있습니다.
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/pricing')}
            >
              업그레이드
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
