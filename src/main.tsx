import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './styles/tokens.css';
import { devAutoLogin } from '@/lib/auth/devAutoLogin';

async function bootstrap() {
  await devAutoLogin(); // 개발 모드 전용 — 프로덕션에선 즉시 반환

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap();
