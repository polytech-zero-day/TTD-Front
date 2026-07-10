export type AttemptPhase =
  'loading' | 'chatting' | 'waiting' | 'confirming' | 'grading' | 'failed';

export type AttemptStatus =
  'IN_PROGRESS' | 'GRADING' | 'GRADING_FAILED' | 'GRADED';

export interface ChatMessage {
  id: number | string; // 서버는 number, 낙관적 렌더링용 임시 메시지는 string
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number; // 이 교환에 든 총 토큰 — assistant 메시지에만 기록 (리포트용)
  createdAt?: string;
}

export interface AttemptUsage {
  messagesUsed: number;
  messagesLimit: number;
  tokensUsed: number;
  tokensBaseline: number;
}

export interface AttemptState {
  attemptId: number | null; // 백엔드 id가 Long이라 string → number
  phase: AttemptPhase;
  messages: ChatMessage[];
  usage: AttemptUsage;
  remainingSeconds: number;
  draft: string;
}

export const isInputLocked = (s: AttemptState) =>
  s.phase !== 'chatting' || s.usage.messagesUsed >= s.usage.messagesLimit;

export const isOverBaseline = (u: AttemptUsage) =>
  u.tokensUsed > u.tokensBaseline;
