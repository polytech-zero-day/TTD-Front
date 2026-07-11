import { apiFetch } from '@/lib/api/client';
import type { AttemptStatus, AttemptUsage, ChatMessage } from '@/types/attempt';

// 백엔드 AttemptSnapshotResponse — 시작·새로고침 복원 공용
export interface AttemptSnapshot {
  attemptId: number;
  status: AttemptStatus;
  remainingSeconds: number;
  usage: AttemptUsage;
  messages: ChatMessage[];
  draft: string | null;
}

export interface AttemptMessageResult {
  message: ChatMessage;
  usage: AttemptUsage;
}

export interface RubricCriterion {
  name: string;
  score: number;
  maxScore: number;
  comment: string;
}

// 결과 리포트 응답 — 결과 화면(S-05)이 이 응답 하나로 그려진다
export interface AttemptResult {
  attemptId: number;
  status: AttemptStatus;
  problemTitle: string;
  difficulty: string;
  attemptOrdinal: number; // 이 문제 몇 번째 응시인지
  maxAttempts: number;
  submittedAt: string | null;
  rubricScore: number | null;
  efficiencyScore: number | null;
  finalScore: number | null; // 품질 60% + 효율 40% (서버 계산)
  feedback: string | null;
  criteria: RubricCriterion[];
  messages: ChatMessage[]; // tokensUsed·createdAt 포함
  totalTokens: number;
  tokenBudget: number;
  artifact: string | null; // 사용자의 최종 제출 답변 (draft 확정본)
}

// 시작 (진행 중 세션이 있으면 서버가 그 스냅샷을 그대로 반환 — 멱등)
export const startAttempt = (problemId: number) =>
  apiFetch<AttemptSnapshot>('/api/attempts', {
    method: 'POST',
    body: JSON.stringify({ problemId }),
  });

// 대화 — prevUsage 파라미터 삭제 (사용량은 서버가 계산해 내려줌)
export const sendAttemptMessage = (attemptId: number, content: string) =>
  apiFetch<AttemptMessageResult>(`/api/attempts/${attemptId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

// 결과물 자동 저장 (만료 시 자동 제출의 원본)
export const saveDraft = (attemptId: number, draft: string) =>
  apiFetch<void>(`/api/attempts/${attemptId}/draft`, {
    method: 'PUT',
    body: JSON.stringify({ draft }),
  });

// 제출 — artifact 파라미터 삭제 (서버가 저장된 draft로 확정)
export const submitAttempt = (attemptId: number) =>
  apiFetch<AttemptResult>(`/api/attempts/${attemptId}/submit`, {
    method: 'POST',
  });

// 채점 완료 폴링용
export const getAttemptResult = (attemptId: number) =>
  apiFetch<AttemptResult>(`/api/attempts/${attemptId}/result`);

// 재채점 요청 — 채점 실패(GRADING_FAILED) 상태에서만 허용
export const regradeAttempt = (attemptId: number) =>
  apiFetch<AttemptResult>(`/api/attempts/${attemptId}/regrade`, {
    method: 'POST',
  });
