import AuthPanel from '@/components/feature/auth/AuthPanel';
import type { AuthMode } from '@/types/auth';

interface AuthPageProps {
  mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
  return <AuthPanel mode={mode} />;
}
