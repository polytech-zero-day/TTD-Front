import { Navigate, Outlet } from 'react-router';
import { getCurrentUserRole, isAuthenticated } from '@/lib/auth/session';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

/**
 * 인증 가드. 로그인하지 않았으면 /login으로, 관리자 전용 경로에 비관리자가 접근하면
 * 홈으로 돌려보낸다. (토큰은 메모리 보관이라 새로고침 시 세션이 사라진다 — 세션 지속은
 * refresh 토큰 재발급 흐름 도입 시 별도 처리.)
 */
export default function ProtectedRoute({
  requireAdmin = false,
}: ProtectedRouteProps) {
  // 인증 갱신 실패로 토큰이 지워진 뒤에도 가드가 다시 평가되도록 컨텍스트를 구독한다.
  useCurrentUser();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && getCurrentUserRole() !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
