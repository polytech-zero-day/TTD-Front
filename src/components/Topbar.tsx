import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { logout } from '@/lib/api/auth';

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
  const { name, plan } = useCurrentUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout(); // 서버 세션 무효화 + 로컬 토큰 정리
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
        <a href="/pricing" className="no-underline">
          <Badge tone="pill">{plan}</Badge>
        </a>
        <div className="flex items-center gap-2 rounded-full bg-charade py-[5px] pr-[10px] pl-[5px]">
          <Avatar initial={name.charAt(0) || '?'} size="sm" />
          <span className="text-[13px] text-gallery">{name || '게스트'}</span>
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
      </div>
    </header>
  );
}
