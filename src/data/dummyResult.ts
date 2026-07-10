export interface SubmissionMeta {
  problemName: string;
  difficulty: string;
  completedAt: string;
  finalAttemptRatio: string;
}

export interface ScoreBreakdown {
  quality: number;
  efficiency: number;
  final: number;
  percentile: number; // 23 => 상위 23%
}

export interface RubricCriterionData {
  id: string;
  title: string;
  scoreDisplay:
    | { type: 'score'; earned: number; max: number }
    | { type: 'status'; label: string };
  description: string;
  note?: { icon: string; text: string; tone: 'default' | 'warning' };
}

export interface AttemptRecord {
  id: string;
  label: string;
  time: string;
  prompt: string;
  inTokens?: number; // 백엔드는 교환당 총계만 집계 — in/out은 더미 전용
  outTokens?: number;
  totalTokens: number;
  isFinal?: boolean;
}

export interface ScatterDot {
  quality: number;
  efficiency: number;
  isCurrentPosition?: boolean;
  isTopTen?: boolean;
}

export const dummyMeta: SubmissionMeta = {
  problemName: '고객 문의 유형 자동 분류',
  difficulty: 'L1',
  completedAt: '2026-07-07 15:34:28',
  finalAttemptRatio: '3/3',
};

export const dummyScore: ScoreBreakdown = {
  quality: 87,
  efficiency: 72,
  final: 79.5,
  percentile: 23,
};

export const dummyRubric: RubricCriterionData[] = [
  {
    id: 'accuracy',
    title: '1. 분류 정확성',
    scoreDisplay: { type: 'score', earned: 18, max: 20 },
    description:
      '배송(4개), 환불(3개), 품질(3개), 기타(2개) 분류가 정확합니다. 다만 요청 #5 ("반품 가능한지?")는 환불이 아닌 기타로 분류했어야 합니다.',
    note: { icon: 'ℹ️', text: '근거: 실제 데이터셋 검증 기반', tone: 'default' },
  },
  {
    id: 'urgency',
    title: '2. 긴급도 판정',
    scoreDisplay: { type: 'score', earned: 17, max: 20 },
    description:
      '"당장", "오늘까지", "빨리" 등 시간 표현을 잘 캐치했습니다. 다만 요청 #8의 감정 표현 강도(분노 신호)를 과다 평가했습니다.',
    note: { icon: 'ℹ️', text: '근거: 감정 분석 가이드라인 비교', tone: 'default' },
  },
  {
    id: 'rationale',
    title: '3. 분류 근거 제시',
    scoreDisplay: { type: 'score', earned: 20, max: 20 },
    description:
      '모든 항목에서 구조화된 근거를 명확하게 제시했습니다. 판정 과정의 투명성이 우수합니다.',
    note: { icon: '✓', text: '근거: 결과물 직접 검증', tone: 'default' },
  },
  {
    id: 'requirements',
    title: '4. 요구사항 충족',
    scoreDisplay: { type: 'status', label: '검수 중' },
    description: '결과물 형식과 데이터 일관성을 최종 검증 중입니다.',
    note: {
      icon: '⚠️',
      text: '관리자 검수 필요 – 차수: 자동심사 예정일 2026-07-08',
      tone: 'warning',
    },
  },
];

export const dummyAttempts: AttemptRecord[] = [
  {
    id: '1',
    label: '1차 시도',
    time: '14:52:30',
    prompt:
      '고객 문의를 배송/환불/품질/기타로 분류하고 긴급도를 상/중/하로 판정해줄 수 있을까? 키워드 기반으로 분류하는 방법을 알려줘.',
    inTokens: 187,
    outTokens: 412,
    totalTokens: 599,
  },
  {
    id: '2',
    label: '2차 시도',
    time: '15:13:44',
    prompt:
      '실제 고객 문의 데이터셋을 바탕으로 분류 로직을 정제하고, 정확도를 높이기 위한 예외 케이스를 처리하는 방법을 알려줘. 감정 표현도 고려해야 할까?',
    inTokens: 243,
    outTokens: 318,
    totalTokens: 561,
  },
  {
    id: '3',
    label: '3차 시도 (최종 제출)',
    time: '15:34:12',
    prompt:
      '2차 피드백을 토대로 최종 분류 결과물을 완성했습니다. 구조화된 테이블 형식으로 제시하고 있습니다. 이대로 제출해도 되나요?',
    inTokens: 156,
    outTokens: 88,
    totalTokens: 244,
    isFinal: true,
  },
];

export const dummyTotalTokens = 1248;

export const dummyReferenceNotes = [
  '품질점수: 3회 제출 중 최고점 = 87점 (2차 시도)',
  '효율성점수: 시도횟수(3회) + 누적토큰(1,248개) 기반',
  '최종점수: (품질×60% + 효율성×40%)',
];

function generateOtherDots(count: number): ScatterDot[] {
  return Array.from({ length: count }, () => {
    const quality = Math.round(Math.random() * 85 + 8);
    const efficiency = Math.round(Math.random() * 85 + 8);
    return { quality, efficiency, isTopTen: quality >= 85 && efficiency >= 75 };
  });
}

export const dummyScatterDots: ScatterDot[] = [
  ...generateOtherDots(50),
  { quality: dummyScore.quality, efficiency: dummyScore.efficiency, isCurrentPosition: true },
];
