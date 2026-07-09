import type { ScatterPoint } from '../components/ScatterPlot';

export interface SubmissionHistoryItem {
  id: string;
  problemName: string;
  submittedAt: string;
  qualityScore: number;
  efficiencyScore: number;
  status: '완료' | '진행중';
}

// TODO: 백엔드 API 연동 시 이 구조를 그대로 응답 스펙 제안안으로 C에게 공유
export const dummyUser = {
  name: '김지수',
  plan: 'FREE' as const,
  joinedAt: '2026-03-14',
  totalSubmissions: 27,
  lastAttemptAt: '2026-07-05',
};

export const dummyStats = {
  avgQualityScore: 78.4,
  avgEfficiencyScore: 64.2,
  totalAttempts: 61,
  totalTokens: '184.2K',
};

export const dummyHistory: SubmissionHistoryItem[] = [
  {
    id: '1',
    problemName: '고객 문의 유형 자동 분류',
    submittedAt: '2026-07-05',
    qualityScore: 82,
    efficiencyScore: 71,
    status: '완료',
  },
  {
    id: '2',
    problemName: '월별 매출 추이 데이터 분석 기초',
    submittedAt: '2026-07-03',
    qualityScore: 74,
    efficiencyScore: 58,
    status: '완료',
  },
  {
    id: '3',
    problemName: "'더 빠르게 해줘' 요구사항 구체화",
    submittedAt: '2026-06-29',
    qualityScore: 69,
    efficiencyScore: 80,
    status: '완료',
  },
  {
    id: '4',
    problemName: '재고 임계치 알림 로직 구현',
    submittedAt: '2026-06-24',
    qualityScore: 88,
    efficiencyScore: 55,
    status: '완료',
  },
  {
    id: '5',
    problemName: '이력서 핵심 스킬 추출',
    submittedAt: '2026-06-20',
    qualityScore: 91,
    efficiencyScore: 66,
    status: '완료',
  },
  {
    id: '6',
    problemName: '설문 응답 데이터 분석 기초',
    submittedAt: '2026-06-15',
    qualityScore: 63,
    efficiencyScore: 49,
    status: '완료',
  },
];

function generateOtherUserPoints(count: number): ScatterPoint[] {
  return Array.from({ length: count }, () => ({
    quality: Math.round(Math.random() * 85 + 8),
    efficiency: Math.round(Math.random() * 85 + 8),
  }));
}

export const dummyScatterPoints: ScatterPoint[] = [
  ...generateOtherUserPoints(56),
  {
    quality: dummyStats.avgQualityScore,
    efficiency: dummyStats.avgEfficiencyScore,
    isCurrentUser: true,
  },
];
