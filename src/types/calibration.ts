// 백엔드 CalibrationRunResponse 대응 (관리자 캘리브레이션 일치율 측정 결과, S-09)

export interface CalibrationConfig {
  highMin: number; // 상(HIGH) 등급 최소 점수
  midMin: number; // 중(MID) 등급 최소 점수
  tolerance: number; // 점수 오차 허용치
}

export interface CalibrationSummary {
  total: number;
  placeholderCount: number; // "[임시]" 답안 — 일치율 신뢰 불가
  errorCount: number;
  tierMatches: number;
  tierAgreementRate: number | null; // 전체(에러 제외) 기준 일치율(%)
  validTierAgreementRate: number | null; // placeholder·에러 제외 유효 일치율(%)
  avgAbsScoreDiff: number | null; // |채점 - 기준| 평균
  withinToleranceRate: number | null; // 점수 오차가 tolerance 이내인 비율(%)
}

export interface CalibrationRow {
  sampleId: number;
  problemTitle: string;
  expectedTier: string; // 상/중/하
  referenceScore: number;
  gradedScore: number | null; // 채점 실패 시 null
  gradedTier: string | null;
  tierMatch: boolean | null;
  scoreDiff: number | null;
  placeholder: boolean; // "[임시]" 답안 표시
  error: string | null;
}

export interface CalibrationRunResult {
  config: CalibrationConfig;
  summary: CalibrationSummary;
  rows: CalibrationRow[];
}
