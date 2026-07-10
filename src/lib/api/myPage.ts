import { apiFetch } from '@/lib/api/client';
import type { AttemptStatus } from '@/types/attempt';
import type { Difficulty } from '@/types/problem';

// GET /api/attempts/my — 백엔드 MyAttemptSummaryResponse
// 서버는 IN_PROGRESS + GRADED만 반환하므로 status는 그 두 값만 실제로 등장한다.
export interface MyAttemptSummary {
  attemptId: number;
  problemId: number;
  problemTitle: string;
  difficulty: Difficulty;
  status: AttemptStatus;
  rubricScore: number | null;
  efficiencyScore: number | null;
  submittedAt: string | null;
}

// GET /api/attempts/my/stats — 백엔드 MyAttemptStatsResponse
// GRADED가 하나도 없을 때 avg/best는 null, 나머지는 0이 내려온다.
export interface MyAttemptStats {
  totalAttempts: number;
  avgQualityScore: number | null;
  avgEfficiencyScore: number | null;
  bestScore: number | null;
  totalTokens: number;
  completionRate: number;
}

// GET /api/attempts/scatter — 백엔드 ScatterPointResponse[]
// 익명 좌표만 (유저 식별 정보 없음). MyPage·ResultPage 산점도 공용.
export interface ScatterPoint {
  rubricScore: number;
  efficiencyScore: number;
}

// 내 제출 이력 — 최신순 (submittedAt 우선, null이면 startedAt)
export const fetchMyAttempts = () =>
  apiFetch<MyAttemptSummary[]>('/api/attempts/my');

// 내 통계 — 총 응시·평균 품질/효율·최고 종합점수·누적 토큰·완료율
export const fetchMyStats = () =>
  apiFetch<MyAttemptStats>('/api/attempts/my/stats');

// 전체 유저의 GRADED 응시 좌표 — 산점도 공용 (내 위치는 콜사이트에서 마킹)
export const fetchScatterData = () =>
  apiFetch<ScatterPoint[]>('/api/attempts/scatter');
