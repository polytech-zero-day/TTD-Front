// 결과 리포트 표시 컴포넌트가 공유하는 뷰 타입. (구 data/dummyResult.ts의 인터페이스를 이전)

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
  inTokens?: number; // 백엔드는 교환당 총계만 집계 — in/out은 표시 선택
  outTokens?: number;
  totalTokens: number;
  isFinal?: boolean;
}
