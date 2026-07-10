import Avatar from './ui/Avatar';
import Badge from './ui/Badge';

type NavKey = 'catalog' | 'mypage' | 'leaderboard' | 'pricing';

interface TopbarProps {
  active: NavKey;
  userName: string;
  plan: 'FREE' | 'PAID';
}

const NAV_ITEMS: { key: NavKey; label: string; path: string }[] = [
  { key: 'catalog', label: '문제 카탈로그', path: '/problems' },
  { key: 'mypage', label: '마이페이지', path: '/mypage' },
  { key: 'leaderboard', label: '리더보드', path: '/leaderboard' },
  { key: 'pricing', label: '요금제', path: '/pricing' },
];

export default function Topbar({ active, userName, plan }: TopbarProps) {
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
          <Avatar initial={userName.charAt(0)} size="sm" />
          <span className="text-[13px] text-gallery">{userName}</span>
        </div>
      </div>
    </header>
  );
}
