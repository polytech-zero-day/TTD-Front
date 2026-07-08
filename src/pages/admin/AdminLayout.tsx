import { Outlet } from 'react-router';
import AdminSidebar from '../../components/feature/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-full bg-ebony">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
