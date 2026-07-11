import { Link, NavLink, useNavigate } from 'react-router';
import { logout } from '@/lib/api/auth';

interface AdminNavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  { to: '/admin/users', label: '사용자 관리' },
  { to: '/admin/problems', label: '문제 관리' },
  { to: '/admin/ai-models', label: 'AI 모델 설정' },
  { to: '/admin/calibration', label: '캘리브레이션' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gallery-9 bg-mirage px-4 py-5">
      <Link to="/admin" className="flex items-center gap-2 px-2 pb-6">
        <span className="size-[9px] shrink-0 rounded-xs bg-wedgewood" />
        <span className="text-[16px] font-bold tracking-[-0.16px] text-gallery">
          TTD Admin
        </span>
      </Link>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-[13.5px] font-medium ${
                isActive
                  ? 'bg-biscay text-gallery'
                  : 'text-santas-gray hover:text-gallery'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto rounded-md px-3 py-2 text-left text-[13.5px] font-medium text-santas-gray hover:text-gallery"
      >
        로그아웃
      </button>
    </aside>
  );
}
