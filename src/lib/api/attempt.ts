import type { AttemptUsage, ChatMessage } from '@/types/attempt';

// ── 제안 스키마 (1.3 회의용) ───────────────────────────────
// POST /api/attempts                 { problemId } → AttemptStartResponse
// POST /api/attempts/{id}/messages   { content }   → AttemptMessageResponse
// POST /api/attempts/{id}/submit     { artifact }  → { attemptId }
// GET  /api/attempts/{id}/result     → 채점 완료 여부 폴링 (or SSE)

export interface AttemptStartResponse {
  attemptId: string;
  usage: AttemptUsage;
  timeLimitSeconds: number;
}

export interface AttemptMessageResponse {
  message: ChatMessage; // assistant 응답
  usage: AttemptUsage; //  서버 기준 누적 사용량
}

const MOCK = true; // TODO(3.4 API 연결 시): false로 바꾸고 apiFetch 경로 활성화

export async function startAttempt(
  problemId: number
): Promise<AttemptStartResponse> {
  if (MOCK) {
    return {
      attemptId: `mock-${problemId}`,
      usage: {
        messagesUsed: 0,
        messagesLimit: 10,
        tokensUsed: 0,
        tokensBaseline: 3000,
      },
      timeLimitSeconds: 45 * 60,
    };
  }
  // return apiFetch<AttemptStartResponse>('/api/attempts', { ... });
  throw new Error('not implemented');
}

export async function sendAttemptMessage(
  attemptId: string,
  content: string,
  prevUsage: AttemptUsage
): Promise<AttemptMessageResponse> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 1200)); // '응답 생성중…' 상태 확인용
    return {
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `(목 응답) "${content.slice(0, 30)}…"에 대한 절차를 제안합니다.`,
      },
      usage: {
        ...prevUsage,
        messagesUsed: prevUsage.messagesUsed + 1,
        tokensUsed: prevUsage.tokensUsed + 300 + Math.floor(content.length / 2),
      },
    };
  }
  throw new Error('not implemented');
}

export async function submitAttempt(attemptId: string, artifact: string) {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return { attemptId };
  }
  throw new Error('not implemented');
}
