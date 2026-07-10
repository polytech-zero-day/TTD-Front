// 문제 도메인 타입.
// 출처: docs/A파트_작업정리_최종.md 7절 TypeScript 타입.
// 단, 팀 백엔드 API 기준 id는 number (문서 예시의 UUID string 대신).

export type Difficulty = 'L1' | 'L2';

export type ProblemType =
  | 'CLASSIFY'
  | 'CONSTRAINT'
  | 'ANALYSIS_BASIC'
  | 'ANALYSIS_ADV'
  | 'AMBIGUOUS'
  | 'REPORT'
  | 'SKELETON_STAT'
  | 'SKELETON_HTTP'
  | 'SKELETON_LOG'
  | 'SKELETON_RESERVE';

export type SourceType = 'AUTO_GRADED' | 'RUBRIC_ONLY';
export type ProblemStatus = 'draft' | 'pending' | 'active';

// GET /api/problems 의 배열 요소. (문서 7절 ProblemSummary, id만 number)
export interface ProblemSummary {
  id: number;
  title: string;
  difficulty: Difficulty;
  type: ProblemType;
  maxAttempts: number;
}

// GET /api/problems/{id} 의 응답. (문서 7절 ProblemDetail, id만 number)
export interface ProblemDetail extends ProblemSummary {
  sourceType: SourceType;
  description: string;
  requirements: string[];
  constraints: string[];
  skeletonCode: string | null; // 스켈레톤형(SKELETON_*)만 값 존재
}

// ProblemType -> 배지/필터에 쓰는 한글 라벨.
export const PROBLEM_TYPE_LABEL: Record<ProblemType, string> = {
  CLASSIFY: '분류·추출',
  CONSTRAINT: '제약 구현',
  ANALYSIS_BASIC: '데이터 분석 기초',
  ANALYSIS_ADV: '데이터 분석 심화',
  AMBIGUOUS: '모호한 요구사항 정의',
  REPORT: '분석 보고서',
  SKELETON_STAT: '스켈레톤 개선',
  SKELETON_HTTP: '스켈레톤 개선',
  SKELETON_LOG: '스켈레톤 개선',
  SKELETON_RESERVE: '스켈레톤 개선',
};

// 유형 필터 칩. match 로 해당 칩이 어떤 ProblemType 을 포함하는지 판정.
export interface TypeFilter {
  label: string;
  match: (type: ProblemType) => boolean;
}

export const TYPE_FILTERS: TypeFilter[] = [
  { label: '분류·추출', match: (t) => t === 'CLASSIFY' },
  { label: '제약 구현', match: (t) => t === 'CONSTRAINT' },
  { label: '데이터 분석 기초', match: (t) => t === 'ANALYSIS_BASIC' },
  { label: '데이터 분석 심화', match: (t) => t === 'ANALYSIS_ADV' },
  { label: '모호한 요구사항 정의', match: (t) => t === 'AMBIGUOUS' },
  { label: '분석 보고서', match: (t) => t === 'REPORT' },
  { label: '스켈레톤 개선', match: (t) => t.startsWith('SKELETON_') },
];

// SourceType -> 한글 라벨.
export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  AUTO_GRADED: '자동 채점',
  RUBRIC_ONLY: '루브릭 채점',
};

// ProblemStatus -> 한글 라벨.
export const PROBLEM_STATUS_LABEL: Record<ProblemStatus, string> = {
  draft: '초안',
  pending: '검토 대기',
  active: '게시됨',
};

// GET/POST/PUT /api/admin/problems 응답. (docs/openapi.yaml AdminProblemResponse)
export interface AdminProblem {
  id: number;
  title: string;
  difficulty: Difficulty;
  type: ProblemType;
  maxAttempts: number;
  sourceType: SourceType;
  description: string;
  requirements: string[];
  constraints: string[];
  skeletonCode: string | null;
  status: ProblemStatus;
  createdAt: string;
  updatedAt: string;
}

// POST /api/admin/problems 요청 바디. maxAttempts는 생성 시 선택.
export interface CreateProblemInput {
  title: string;
  difficulty: Difficulty;
  type: ProblemType;
  sourceType: SourceType;
  description: string;
  requirements: string[];
  constraints: string[];
  skeletonCode?: string;
  maxAttempts?: number;
}

// PUT /api/admin/problems/{id} 요청 바디. maxAttempts는 수정 시 필수.
export interface UpdateProblemInput {
  title: string;
  difficulty: Difficulty;
  type: ProblemType;
  sourceType: SourceType;
  description: string;
  requirements: string[];
  constraints: string[];
  skeletonCode?: string;
  maxAttempts: number;
}

// PATCH /api/admin/problems/{id}/status 요청 바디.
export interface UpdateProblemStatusInput {
  status: ProblemStatus;
}
