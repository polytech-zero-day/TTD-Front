import { Navigate, Outlet } from 'react-router';
import { getCurrentUserRole, isAuthenticated } from '@/lib/auth/session';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

/**
 * 인증 가드. 로그인하지 않았으면 /login으로, 관리자 전용 경로에 비관리자가 접근하면
 * 홈으로 돌려보낸다. (토큰은 메모리 보관이라 새로고침 시 세션이 사라진다 — 세션 지속은
 * refresh 토큰 재발급 흐름 도입 시 별도 처리.)
 */
export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && getCurrentUserRole() !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
