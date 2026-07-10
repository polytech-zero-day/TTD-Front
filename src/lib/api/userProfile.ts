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
