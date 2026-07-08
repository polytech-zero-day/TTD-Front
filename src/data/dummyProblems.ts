import type { ProblemListItem } from '../types/problem';

// Topbar 표시용 뷰어(로그인 사용자) 더미.
// 원래 D파트 data/dummyMyPage.ts 의 dummyUser 를 쓰려 했으나 해당 파일이 없어
// S-02 자체 더미로 분리해 의존을 끊음. 인증 연동 시 실제 세션 사용자로 교체.
export const dummyViewer = {
  name: '김지수',
  plan: 'FREE' as const,
};

// S-02 문제 목록 목업 데이터 (실제 문제 10개).
// 출처: docs/PromptRank_통합본_v3.md (문제 1~10).
// TODO: 백엔드 GET /api/problems 연동 시 이 배열을 API 응답으로 교체.
//   description·attemptCount 는 목록 API 제안 필드라 아직 실제 응답에 없을 수 있음
//   (types/problem.ts ProblemListItem 주석 참고).
export const dummyProblems: ProblemListItem[] = [
  {
    id: 1,
    title: '고객 문의 라우팅 판정',
    difficulty: 'L1',
    type: 'CLASSIFY',
    maxAttempts: 3,
    description:
      '고객센터 문의를 키워드 규칙으로 환불·배송·제품·기타로 분류하고 주문번호를 추출합니다.',
    attemptCount: 1284,
  },
  {
    id: 2,
    title: '표준 라이브러리 CSV 파서 구현',
    difficulty: 'L1',
    type: 'CONSTRAINT',
    maxAttempts: 3,
    description:
      '파싱 라이브러리 없이 따옴표 안 쉼표와 이스케이프를 처리하는 CSV 한 줄 파서를 구현합니다.',
    attemptCount: 869,
  },
  {
    id: 3,
    title: '브랜드 사이즈 매칭 통계',
    difficulty: 'L1',
    type: 'ANALYSIS_BASIC',
    maxAttempts: 3,
    description:
      '브랜드별 사이즈 범위와 고객 치수를 비교해 사이즈 판정 결과의 분포를 집계합니다.',
    attemptCount: 1102,
  },
  {
    id: 4,
    title: '매장 픽업 예약 순차 처리',
    difficulty: 'L2',
    type: 'ANALYSIS_ADV',
    maxAttempts: 3,
    description:
      '재고·시간대 한도를 고려해 예약을 순서대로 처리하고 실패 사유를 우선순위로 판정합니다.',
    attemptCount: 412,
  },
  {
    id: 5,
    title: '스터디룸 예약 정책 설계',
    difficulty: 'L2',
    type: 'AMBIGUOUS',
    maxAttempts: 3,
    description:
      "모호한 기획 메모에서 '공정성'을 스스로 정의하고 예약 정책과 그 근거를 설계합니다.",
    attemptCount: 956,
  },
  {
    id: 6,
    title: '매장 운영 우선순위 보고서',
    difficulty: 'L2',
    type: 'REPORT',
    maxAttempts: 3,
    description:
      '실패 사유 통계를 바탕으로 어느 매장을 먼저 개선할지 다축으로 판단하는 보고서를 작성합니다.',
    attemptCount: 588,
  },
  {
    id: 7,
    title: 'CSV 로드 후 기초 통계 출력',
    difficulty: 'L1',
    type: 'SKELETON_STAT',
    maxAttempts: 3,
    description:
      '제공된 pandas 스켈레톤을 프롬프트로 발전시켜 센서 로그의 기초 통계를 출력합니다.',
    attemptCount: 734,
  },
  {
    id: 8,
    title: '최소 HTTP 서버에 라우팅 추가',
    difficulty: 'L1',
    type: 'SKELETON_HTTP',
    maxAttempts: 3,
    description:
      'Hello World만 반환하는 스켈레톤에 표준 라이브러리만으로 경로별 응답을 추가합니다.',
    attemptCount: 651,
  },
  {
    id: 9,
    title: '로그 파서에 이상 감지 추가',
    difficulty: 'L2',
    type: 'SKELETON_LOG',
    maxAttempts: 3,
    description:
      '줄 수만 세는 스켈레톤에 60초 30회 기준의 이상 IP 감지와 5xx 집계를 추가합니다.',
    attemptCount: 349,
  },
  {
    id: 10,
    title: '집계 함수를 예약 판정으로 확장',
    difficulty: 'L2',
    type: 'SKELETON_RESERVE',
    maxAttempts: 3,
    description:
      '개수만 반환하는 스켈레톤을 우선순위·상태 누적이 있는 예약 판정 로직으로 확장합니다.',
    attemptCount: 297,
  },
];
