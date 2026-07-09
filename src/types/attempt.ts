// 응시(S-04) 도메인 타입.
// 백엔드 3.4(대화 API) 스키마 확정 전이므로, 이 파일이 곧 API 스키마 제안서 역할을 한다.

export type AttemptPhase =
  | 'chatting' //   입력 가능 (기본)
  | 'waiting' //    AI 응답 생성 중 — 입력 잠금
  | 'confirming' // 제출 확인 모달 표시 중
  | 'grading'; //   제출 확정 — 채점 중, 전체 잠금

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// 서버가 매 응답마다 내려줘야 하는 사용량
export interface AttemptUsage {
  messagesUsed: number; //   사용한 메시지 수
  messagesLimit: number; //  문제당 제한 (기본 10)
  tokensUsed: number; //     누적 토큰
  tokensBaseline: number; // 적정선 (초과분부터 효율 감점)
}

export interface AttemptState {
  attemptId: string | null;
  phase: AttemptPhase;
  messages: ChatMessage[];
  usage: AttemptUsage;
  remainingSeconds: number;
  draft: string; // 우측 패널 결과물 텍스트
}

export const isInputLocked = (s: AttemptState) =>
  s.phase !== 'chatting' || s.usage.messagesUsed >= s.usage.messagesLimit;

export const isOverBaseline = (u: AttemptUsage) =>
  u.tokensUsed > u.tokensBaseline;
