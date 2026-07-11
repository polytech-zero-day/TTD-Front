import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signup } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import type { SignupInput } from '@/types/auth';

function validate(input: SignupInput): string | null {
  if (!input.email.includes('@')) return '이메일 형식이 올바르지 않습니다.';
  if (input.nickname.length < 1 || input.nickname.length > 30)
    return '닉네임은 1~30자여야 합니다.';
  if (input.password.length < 8 || input.password.length > 64)
    return '비밀번호는 8~64자여야 합니다.';
  return null;
}

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const input: SignupInput = { email, password, nickname };
    const validationError = validate(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await signup(input);
      navigate('/login');
    } catch (err) {
      setError(
        getApiErrorMessage(err, '회원가입에 실패했습니다.')
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 pt-4">
      <Input
        id="signup-email"
        label="이메일"
        type="email"
        placeholder="예: jisu@ttd.co"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        id="signup-nickname"
        label="닉네임"
        placeholder="예: 김지수"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={30}
        required
      />
      <Input
        id="signup-password"
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        maxLength={64}
        required
      />
      {error && (
        <p className="text-[12.3px] font-medium text-gallery">⚠ {error}</p>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '가입 중…' : '회원가입'}
      </Button>
    </form>
  );
}
