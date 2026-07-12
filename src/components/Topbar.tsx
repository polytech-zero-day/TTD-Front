import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { logout } from '@/lib/api/auth';
import { isAuthenticated } from '@/lib/auth/session';
import { fetchMyProfile } from '@/lib/api/userProfile';
import { fetchMyStats, type MyAttemptStats } from '@/lib/api/myPage';

type NavKey = 'catalog' | 'mypage' | 'leaderboard' | 'pricing';

interface TopbarProps {
  active: NavKey;
}

const NAV_ITEMS: { key: NavKey; label: string; path: string }[] = [
  { key: 'catalog', label: '문제 카탈로그', path: '/problems' },
  { key: 'mypage', label: '마이페이지', path: '/mypage' },
  { key: 'leaderboard', label: '리더보드', path: '/leaderboard' },
  { key: 'pricing', label: '요금제', path: '/pricing' },
];

export default function Topbar({ active }: TopbarProps) {
  // 사용자 정보는 전역 컨텍스트에서 읽는다 (페이지별 더미 주입 대체).
  const { name, plan, connectionStatus, refresh } = useCurrentUser();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  // 계정 카드 팝업 — 이메일·통계는 카드가 처음 열릴 때 lazy fetch 후 캐시한다.
  // Topbar는 모든 페이지에 렌더링되므로 페이지 로드마다 요청을 발생시키지 않는다.
  const accountRef = useRef<HTMLDivElement>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<MyAttemptStats | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  async function ensureCardData() {
    if (profileEmail !== null && stats !== null) return; // 캐시 히트
    setIsLoadingCard(true);
    try {
      const tasks: Promise<void>[] = [];
      if (profileEmail === null) {
        tasks.push(fetchMyProfile().then((p) => setProfileEmail(p.email)));
      }
      if (stats === null) {
        tasks.push(fetchMyStats().then((s) => setStats(s)));
      }
      await Promise.all(tasks);
    } catch {
      // 실패 시 캐시하지 않음 — 다음 열림 때 재시도된다
    } finally {
      setIsLoadingCard(false);
    }
  }

  function toggleCard() {
    setIsCardOpen((prev) => {
      const next = !prev;
      if (next) void ensureCardData();
      return next;
    });
  }

  // 바깥 클릭·ESC로 카드 닫기
  useEffect(() => {
    if (!isCardOpen) return;
    function handlePointer(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setIsCardOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsCardOpen(false);
    }
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isCardOpen]);

  async function handleLogout() {
    await logout(); // 서버 세션 무효화 + 로컬 토큰 정리
    await refresh(); // 토큰이 사라졌으니 헤더를 게스트로 갱신
    toast.success('로그아웃되었습니다.');
    navigate('/login');
  }

  return (
    <header className="flex h-[60px] items-center bg-mirage px-6 font-sans">
      <a href="/" className="mr-10 flex items-center gap-2 no-underline">
        <span className="h-[9px] w-[9px] rounded-sm bg-wedgewood" />
        <span className="text-base font-bold tracking-[-0.16px] text-gallery">
          TTD
        </span>
      </a>

      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.path}
            className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap no-underline ${
              active === item.key
                ? 'bg-biscay text-gallery'
                : 'text-santas-gray'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {isLoggedIn && connectionStatus === 'offline' && (
          <button
            type="button"
            onClick={() => void refresh()}
            className="cursor-pointer rounded-md border border-[#e2574c]/50 bg-[#e2574c]/10 px-2.5 py-1 text-xs font-medium text-[#f08a82]"
          >
            서버 연결 끊김 · 재시도
          </button>
        )}
        {isLoggedIn ? (
          <>
            <a href="/pricing" className="no-underline">
              <Badge tone={plan === 'PAID' ? 'paid' : 'pill'}>{plan}</Badge>
            </a>
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={toggleCard}
                aria-haspopup="dialog"
                aria-expanded={isCardOpen}
                aria-label="계정 메뉴 열기"
                className="flex cursor-pointer items-center gap-2 rounded-full bg-charade py-[5px] pr-[10px] pl-[5px] hover:bg-charade/80"
              >
                <Avatar initial={name.charAt(0) || '?'} size="sm" />
                <span className="text-[13px] text-gallery">{name}</span>
              </button>
              {isCardOpen && (
                <div
                  role="dialog"
                  aria-label="계정 카드"
                  className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gallery-9 bg-mirage shadow-2xl"
                >
                  <div className="flex items-center gap-3 p-4">
                    <Avatar initial={name.charAt(0) || '?'} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gallery">
                          {name}
                        </span>
                        <Badge tone={plan === 'PAID' ? 'paid' : 'pill'}>
                          {plan}
                        </Badge>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-santas-gray">
                        {profileEmail ??
                          (isLoadingCard ? '불러오는 중…' : '—')}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gallery-9" />

                  <div className="flex flex-col gap-2 p-4">
                    {stats ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-santas-gray">
                            최고 점수
                          </span>
                          <span className="text-sm font-semibold text-gallery">
                            {stats.bestScore ?? '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-santas-gray">
                            누적 응시
                          </span>
                          <span className="text-sm font-semibold text-gallery">
                            {stats.totalAttempts}건 완료율{' '}
                            {stats.completionRate}%
                          </span>
                        </div>
                      </>
                    ) : isLoadingCard ? (
                      <div className="text-xs text-santas-gray">
                        불러오는 중…
                      </div>
                    ) : (
                      <div className="text-xs text-santas-gray">
                        통계를 불러오지 못했습니다.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gallery-9" />

                  <div className="flex flex-col gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCardOpen(false);
                        navigate('/mypage');
                      }}
                      className="w-full cursor-pointer rounded-lg bg-wedgewood px-3 py-2 text-sm font-medium text-white hover:bg-wedgewood/85"
                    >
                      마이페이지 보기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCardOpen(false);
                        void handleLogout();
                      }}
                      className="w-full cursor-pointer rounded-lg border border-gallery-9 bg-charade px-3 py-2 text-sm font-medium text-santas-gray hover:bg-biscay hover:text-gallery"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="로그아웃"
              title="로그아웃"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-santas-gray hover:bg-charade hover:text-gallery"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="cursor-pointer rounded-lg bg-wedgewood px-4 py-2 text-sm font-medium text-white hover:bg-wedgewood/85"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}
