export interface LeaderboardEntry {
  rank: number;
  name: string;
  quality: number;
  efficiency: number;
  attempts: number;
  tokens: number;
  total: number;
  isCurrentUser?: boolean;
}

// TODO: 백엔드 API 연동 시 이 구조를 그대로 응답 스펙 제안안으로 C에게 공유
export const dummyTopStats = {
  avgTopAttempts: 1.4,
  avgTopTokens: 2180,
  myRank: 142,
  myPercentile: 9,
};

export const dummyOverallRanking: LeaderboardEntry[] = [
  {
    rank: 1,
    name: '박수현',
    quality: 96,
    efficiency: 92,
    attempts: 1.6,
    tokens: 1745,
    total: 95,
  },
  {
    rank: 2,
    name: '김정현',
    quality: 94,
    efficiency: 89,
    attempts: 2.1,
    tokens: 1581,
    total: 92,
  },
  {
    rank: 3,
    name: '차윤희',
    quality: 91,
    efficiency: 86,
    attempts: 1.8,
    tokens: 1789,
    total: 89,
  },
  {
    rank: 4,
    name: '김희주',
    quality: 89,
    efficiency: 85,
    attempts: 2.3,
    tokens: 1927,
    total: 87,
  },
  {
    rank: 5,
    name: '윤정연',
    quality: 86,
    efficiency: 80,
    attempts: 1.6,
    tokens: 2230,
    total: 84,
  },
  {
    rank: 6,
    name: '최윤아',
    quality: 83,
    efficiency: 78,
    attempts: 1.7,
    tokens: 2529,
    total: 81,
  },
  {
    rank: 7,
    name: '김지수',
    quality: 81,
    efficiency: 75,
    attempts: 1.9,
    tokens: 2513,
    total: 79,
    isCurrentUser: true,
  },
  {
    rank: 8,
    name: '김유진',
    quality: 78,
    efficiency: 72,
    attempts: 1.5,
    tokens: 3027,
    total: 76,
  },
  {
    rank: 9,
    name: '김근영',
    quality: 76,
    efficiency: 69,
    attempts: 2.8,
    tokens: 3037,
    total: 73,
  },
  {
    rank: 10,
    name: '최연주',
    quality: 73,
    efficiency: 66,
    attempts: 3.0,
    tokens: 3054,
    total: 70,
  },
  {
    rank: 11,
    name: '어민정',
    quality: 70,
    efficiency: 62,
    attempts: 1.3,
    tokens: 3518,
    total: 67,
  },
  {
    rank: 12,
    name: '김근해',
    quality: 68,
    efficiency: 61,
    attempts: 2.0,
    tokens: 3638,
    total: 65,
  },
  {
    rank: 13,
    name: '진지혜',
    quality: 65,
    efficiency: 56,
    attempts: 2.0,
    tokens: 3703,
    total: 61,
  },
  {
    rank: 14,
    name: '박진영',
    quality: 63,
    efficiency: 52,
    attempts: 2.7,
    tokens: 3774,
    total: 58,
  },
];

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function medalForRank(rank: number): string | null {
  return MEDALS[rank] ?? null;
}

// TODO: 백엔드 연동 시 실제 문제 목록/문제별 랭킹 데이터로 교체
export const dummyProblems = [
  { id: 'p1', name: '고객 문의 유형 자동 분류' },
  { id: 'p2', name: '월별 매출 추이 데이터 분석 기초' },
  { id: 'p3', name: '재고 임계치 알림 로직 구현' },
  { id: 'p4', name: '이력서 핵심 스킬 추출' },
];

export function getProblemRanking(problemId: string): LeaderboardEntry[] {
  const seed = problemId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...dummyOverallRanking];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const tmp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = tmp;
  }
  return shuffled.map((entry, i) => ({ ...entry, rank: i + 1 }));
}
