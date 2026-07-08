import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { AdminUser } from '@/types/admin';

interface UserTableProps {
  users: AdminUser[];
  onToggleRole: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ko-KR');
}

export default function UserTable({
  users,
  onToggleRole,
  onDelete,
}: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gallery-9 bg-mirage">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gallery-9">
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              닉네임
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              이메일
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              권한
            </th>
            <th className="px-5 py-3 text-[11px] font-semibold tracking-[0.11px] text-santas-gray">
              가입일
            </th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gallery-9 last:border-b-0"
            >
              <td className="px-5 py-3 text-[13px] font-medium text-gallery">
                {user.nickname}
              </td>
              <td className="px-5 py-3 text-[13px] text-santas-gray">
                {user.email}
              </td>
              <td className="px-5 py-3">
                <Badge tone={user.role === 'ADMIN' ? 'accent' : 'neutral'}>
                  {user.role}
                </Badge>
              </td>
              <td className="px-5 py-3 text-[13px] text-santas-gray">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="muted"
                    onClick={() => onToggleRole(user)}
                  >
                    {user.role === 'ADMIN' ? 'USER로 변경' : 'ADMIN으로 변경'}
                  </Button>
                  <Button
                    size="sm"
                    variant="muted"
                    onClick={() => onDelete(user)}
                  >
                    삭제
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
