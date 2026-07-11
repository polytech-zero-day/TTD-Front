import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { login } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { getCurrentUserRole } from '@/lib/auth/session';
import type { LoginInput } from '@/types/auth';

function validate(input: LoginInput): string | null {
  if (!input.email.includes('@')) return '이메일 형식이 올바르지 않습니다.';
  if (input.password.length < 1) return '비밀번호를 입력해주세요.';
  return null;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input: LoginInput = { email, password };
    const validationError = validate(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login(input);
      navigate(getCurrentUserRole() === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(
        getApiErrorMessage(err, '로그인에 실패했습니다.')
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 pt-4">
      <Input
        id="login-email"
        label="이메일"
        type="email"
        placeholder="예: jisu@ttd.co"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        id="login-password"
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && (
        <p className="text-[12.3px] font-medium text-gallery">⚠ {error}</p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  );
}
