import { useState } from 'react';
import CreateUserForm from '@/components/feature/admin/CreateUserForm';
import UserTable from '@/components/feature/admin/UserTable';
import Button from '@/components/ui/Button';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import type { AdminUser } from '@/types/admin';

export default function UserManagementPage() {
  const { users, isLoading, error, addUser, toggleRole, removeUser } =
    useAdminUsers();
  const [isCreating, setIsCreating] = useState(false);

  async function handleDelete(user: AdminUser) {
    if (!confirm(`${user.nickname} 사용자를 삭제할까요?`)) return;
    await removeUser(user.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22.7px] font-bold tracking-[-0.24px] text-gallery">
            사용자 관리
          </h1>
          <p className="text-[13.3px] text-santas-gray">
            가입한 사용자 목록을 확인하고 권한을 관리합니다.
          </p>
        </div>
        {!isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            새 사용자
          </Button>
        )}
      </div>

      {isCreating && (
        <CreateUserForm
          onSubmit={async (input) => {
            await addUser(input);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {error && (
        <p className="text-[13px] font-medium text-gallery">⚠ {error}</p>
      )}

      {isLoading ? (
        <p className="text-[13px] text-santas-gray">불러오는 중…</p>
      ) : (
        <UserTable
          users={users}
          onToggleRole={toggleRole}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
