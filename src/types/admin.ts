export type UserRole = 'USER' | 'ADMIN';

export interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateAdminUserInput {
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
}

export interface UpdateAdminUserInput {
  nickname: string;
  role: UserRole;
}
