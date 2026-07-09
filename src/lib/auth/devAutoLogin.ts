import { login } from '@/lib/api/auth';

/**
 * 개발 모드 전용 자동 로그인. 세션 유지/라우트 가드 작업 전까지의 임시 우회로,
 * 프로덕션 빌드에는 포함되지 않는다 (import.meta.env.DEV 가드).
 * TODO(세션 유지 + ProtectedRoute 도입 시): 이 파일과 main.tsx의 호출부를 제거한다.
 */
export async function devAutoLogin() {
  if (!import.meta.env.DEV) return;
  try {
    await login({ email: 'admin@ttd.local', password: 'admin1234!' });
    console.info('[dev] 시드 계정으로 자동 로그인됨');
  } catch {
    console.warn('[dev] 자동 로그인 실패 — 백엔드가 떠 있는지 확인하세요');
  }
}
