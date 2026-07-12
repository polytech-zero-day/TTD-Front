import { apiFetch } from '@/lib/api/client';
import type { UserRole } from '@/types/admin';

// GET /api/users/me — 백엔드 MyProfileResponse
export interface MyProfile {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
}

// 로그인한 사용자의 프로필 조회
export const fetchMyProfile = () => apiFetch<MyProfile>('/api/users/me');

// PATCH /api/users/me/nickname — 백엔드 MyProfileResponse
// 유효성 위반 시 ApiError로 서버 메시지를 그대로 전달한다(호출부에서 처리).
export const updateNickname = (nickname: string) =>
  apiFetch<MyProfile>('/api/users/me/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
