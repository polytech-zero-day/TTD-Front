import { apiFetch } from '@/lib/api/client';

// GET /api/leaderboard 의 rows[i] — 백엔드 LeaderboardEntryResponse
export interface LeaderboardEntry {
  rank: number;
  name: string;
  quality: number;
  efficiency: number;
  attempts: number; // 전체 랭킹: 소수 평균, problemId 필터: 정수
  tokens: number;
  total: number; // 종합점수 = rubric×0.6 + efficiency×0.4 (반올림 정수)
  isCurrentUser: boolean;
}

// GET /api/leaderboard 의 stats — 백엔드 LeaderboardStatsResponse
// 리스트가 비었거나 내가 그 스코프에 없을 때 필드가 null로 내려온다.
export interface LeaderboardStats {
  avgTopAttempts: number | null;
  avgTopTokens: number | null;
  myRank: number | null;
  myPercentile: number | null;
}

// GET /api/leaderboard — 백엔드 LeaderboardResponse
export interface Leaderboard {
  rows: LeaderboardEntry[];
  stats: LeaderboardStats;
}

// 전체 랭킹 (problemId 생략) 또는 문제별 랭킹.
// limit을 넘기면 rows만 상위 N건으로 잘리며, stats는 전체 기준으로 유지된다.
export const fetchLeaderboard = (params?: {
  problemId?: number;
  limit?: number;
}) => {
  const qs = new URLSearchParams();
  if (params?.problemId !== undefined) {
    qs.set('problemId', String(params.problemId));
  }
  if (params?.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  const suffix = qs.toString();
  return apiFetch<Leaderboard>(
    `/api/leaderboard${suffix ? `?${suffix}` : ''}`,
  );
};
