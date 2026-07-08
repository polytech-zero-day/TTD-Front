import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { LoginInput } from '@/types/auth';

interface LoginFormProps {
  onSubmit: (input: LoginInput) => void;
}

function validate(input: LoginInput): string | null {
  if (!input.email.includes('@')) return '이메일 형식이 올바르지 않습니다.';
  if (input.password.length < 1) return '비밀번호를 입력해주세요.';
  return null;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input: LoginInput = { email, password };
    const validationError = validate(input);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit(input);
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
      <Button type="submit" className="w-full">
        로그인
      </Button>
    </form>
  );
}
