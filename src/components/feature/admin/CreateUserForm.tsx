import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { CreateAdminUserInput, UserRole } from '@/types/admin';

interface CreateUserFormProps {
  onSubmit: (input: CreateAdminUserInput) => Promise<void>;
  onCancel: () => void;
}

function validate(input: CreateAdminUserInput): string | null {
  if (!input.email.includes('@')) return '이메일 형식이 올바르지 않습니다.';
  if (input.nickname.length < 1 || input.nickname.length > 30)
    return '닉네임은 1~30자여야 합니다.';
  if (input.password.length < 8 || input.password.length > 64)
    return '비밀번호는 8~64자여야 합니다.';
  return null;
}

export default function CreateUserForm({
  onSubmit,
  onCancel,
}: CreateUserFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input: CreateAdminUserInput = { email, password, nickname, role };
    const validationError = validate(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '사용자 생성에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-gallery-9 bg-mirage p-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="new-user-email"
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          required
        />
        <Input
          id="new-user-password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={64}
          required
        />
        <Input
          id="new-user-nickname"
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={30}
          required
        />
        <label className="flex w-full flex-col gap-1.5" htmlFor="new-user-role">
          <span className="text-[12.4px] font-medium text-gallery">권한</span>
          <select
            id="new-user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="text-[12.3px] font-medium text-gallery">⚠ {error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="muted" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? '생성 중…' : '생성'}
        </Button>
      </div>
    </form>
  );
}
