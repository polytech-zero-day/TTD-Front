import { NavLink } from 'react-router';

interface AdminNavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  { to: '/admin/users', label: '사용자 관리' },
];

export default function AdminSidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gallery-9 bg-mirage px-4 py-5">
      <div className="flex items-center gap-2 px-2 pb-6">
        <span className="size-[9px] shrink-0 rounded-xs bg-wedgewood" />
        <span className="text-[16px] font-bold tracking-[-0.16px] text-gallery">
          TTD Admin
        </span>
      </div>
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
    </aside>
  );
}
