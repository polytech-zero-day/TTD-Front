import { useCallback, useEffect, useState } from 'react';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
} from '@/lib/api/adminUsers';
import { getApiErrorMessage } from '@/lib/api/client';
import type { AdminUser, CreateAdminUserInput } from '@/types/admin';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchAdminUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err, '사용자 목록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  async function addUser(input: CreateAdminUserInput) {
    const created = await createAdminUser(input);
    setUsers((prev) => [...prev, created]);
  }

  async function toggleRole(user: AdminUser) {
    const updated = await updateAdminUser(user.id, {
      nickname: user.nickname,
      role: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
    });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  }

  async function removeUser(id: number) {
    await deleteAdminUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return { users, isLoading, error, addUser, toggleRole, removeUser, reload };
}
