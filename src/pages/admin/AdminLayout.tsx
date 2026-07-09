import { Navigate, Outlet } from 'react-router';
import AdminSidebar from '../../components/feature/admin/AdminSidebar';
import { getCurrentUserRole, isAuthenticated } from '@/lib/auth/session';

export default function AdminLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (getCurrentUserRole() !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-ebony">
      <AdminSidebar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 overflow-y-auto px-10 py-8">
        <Outlet />
      </main>
    </div>
  );
}
