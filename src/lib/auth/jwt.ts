import type { UserRole } from '@/types/admin';

// JWT는 base64url 인코딩이라 표준 atob()에 그대로 넣으면 -/_ 문자에서 깨진다.
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  );
  return atob(padded);
}

// 서명 검증 없이 payload만 읽는다. UI 편의(리다이렉트/메뉴 노출)용일 뿐,
// 실제 인가는 백엔드가 매 요청마다 토큰 서명을 검증해 수행한다 (harness/security.md).
// TODO: 실제 발급된 토큰으로 role 클레임 키가 'role'이 맞는지 확인 필요.
export function decodeJwtRole(accessToken: string): UserRole | null {
  try {
    const [, payloadSegment] = accessToken.split('.');
    if (!payloadSegment) return null;
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as {
      role?: string;
    };
    return payload.role === 'ADMIN' || payload.role === 'USER'
      ? payload.role
      : null;
  } catch {
    return null;
  }
}
