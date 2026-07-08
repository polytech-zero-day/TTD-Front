import { Link } from 'react-router';
import LoginForm from '@/components/feature/auth/LoginForm';
import SignupForm from '@/components/feature/auth/SignupForm';
import type { AuthMode } from '@/types/auth';

interface AuthPanelProps {
  mode: AuthMode;
}

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: '다시 오셨네요',
    subtitle: '이메일과 비밀번호를 입력해 로그인하세요.',
  },
  signup: {
    title: '환영합니다',
    subtitle: '이메일, 닉네임, 비밀번호로 계정을 만드세요.',
  },
};

function tabClassName(isActive: boolean): string {
  const base =
    'flex-1 rounded-md px-4 py-2 text-center text-[13.5px] font-medium';
  return isActive
    ? `${base} bg-mirage text-gallery drop-shadow-[0px_1px_1px_rgba(0,0,0,0.28)]`
    : `${base} text-santas-gray`;
}

export default function AuthPanel({ mode }: AuthPanelProps) {
  const { title, subtitle } = COPY[mode];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ebony">
      <div className="flex w-[400px] flex-col items-center gap-[18px] p-5">
        <div className="flex items-center gap-[9px]">
          <span className="size-[11px] rounded-xs bg-wedgewood" />
          <span className="text-[19px] font-bold text-gallery">TTD</span>
        </div>

        <div className="flex w-full flex-col gap-5 rounded-xl border border-gallery-9 bg-mirage px-[29px] pt-[37px] pb-[25px] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.28)]">
          <div className="rounded-[9px] bg-charade p-1">
            <div className="flex items-center justify-center gap-0.5">
              <Link to="/login" className={tabClassName(mode === 'login')}>
                로그인
              </Link>
              <Link to="/signup" className={tabClassName(mode === 'signup')}>
                회원가입
              </Link>
            </div>
          </div>

          <div>
            <h1 className="text-[18px] leading-snug font-bold text-gallery">
              {title}
            </h1>
            <p className="text-[12.3px] text-santas-gray">{subtitle}</p>

            {mode === 'login' ? (
              <LoginForm onSubmit={() => {}} />
            ) : (
              <SignupForm onSubmit={() => {}} />
            )}
          </div>
        </div>

        <p className="text-center text-[11.4px] text-santas-gray">
          가입 시 TTD의 이용약관 및 채점 정책에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
