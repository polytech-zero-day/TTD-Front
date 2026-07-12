import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/ · 테스트 설정: https://vitest.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom', // 훅 테스트(renderHook)용 DOM 환경
    // Playwright E2E는 별도 러너로 실행한다. Vitest가 e2e/*.spec.ts를 수집하지 않게 분리한다.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  },
});
