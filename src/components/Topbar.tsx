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
    <header className="flex items-center h-[60px] px-6 bg-mirage font-sans">
      <a href="/" className="flex items-center gap-2 mr-10 no-underline">
        <span className="w-[9px] h-[9px] rounded-sm bg-wedgewood" />
        <span className="font-bold text-base tracking-[-0.16px] text-gallery">TTD</span>
      </a>

      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.path}
            className={`px-3 py-2 rounded-md text-sm font-medium no-underline whitespace-nowrap ${
              active === item.key ? 'bg-biscay text-gallery' : 'text-santas-gray'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3 ml-auto">
        <Badge tone="pill">{plan}</Badge>
        <div className="flex items-center gap-2 pl-[5px] pr-[10px] py-[5px] rounded-full bg-charade">
          <Avatar initial={userName.charAt(0)} size="sm" />
          <span className="text-[13px] text-gallery">{userName}</span>
        </div>
      </div>
    </header>
  );
}
