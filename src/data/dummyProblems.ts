import type { ProblemListItem, ProblemDetailView } from '../types/problem';

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

// S-03 문제 상세 목업 데이터 (id로 조회). 출처: docs/PromptRank_통합본_v3.md.
// sourceType: 규칙기반/스켈레톤(1~4,7~10)=AUTO_GRADED, 서술형(5~6)=RUBRIC_ONLY.
// skeletonCode: 스켈레톤 개선형(7~10)만 값, 그 외 null.
// TODO: 백엔드 GET /api/problems/{id} 연동 시 이 레코드를 API 응답으로 교체.
export const dummyProblemDetails: Record<number, ProblemDetailView> = {
  1: {
    id: 1,
    title: '고객 문의 라우팅 판정',
    difficulty: 'L1',
    type: 'CLASSIFY',
    maxAttempts: 3,
    attemptCount: 1284,
    sourceType: 'AUTO_GRADED',
    description:
      '고객센터에 접수된 문의를 사전에 정의된 키워드 규칙에 따라 담당 부서로 배정합니다. 문의 텍스트를 분석해 카테고리를 판별하고 주문번호를 추출하는 방법을 AI와의 대화로 설계하세요.',
    requirements: [
      '각 문의를 환불 / 배송 / 제품 / 기타 4개 유형으로 분류 (대소문자 무시)',
      '키워드가 겹치면 우선순위 환불 > 배송 > 제품 > 기타 로 하나만 선택',
      '주문번호 패턴(ORD- + 숫자 6자리)을 추출, 없으면 null',
    ],
    constraints: [
      '문의는 최대 30건, 각 텍스트 500자 이내',
      '출력은 입력 순서를 유지하며 지정된 필드 외 추가 금지',
      '명시된 키워드 규칙 외의 판단으로 카테고리를 바꾸지 않을 것',
    ],
    skeletonCode: null,
  },
  2: {
    id: 2,
    title: '표준 라이브러리 CSV 파서 구현',
    difficulty: 'L1',
    type: 'CONSTRAINT',
    maxAttempts: 3,
    attemptCount: 869,
    sourceType: 'AUTO_GRADED',
    description:
      '값 내부에 쉼표가 포함될 수 있는 CSV 한 줄(예: "서울, 강남구",100)을 올바르게 분리하는 함수를 파싱 라이브러리 없이 구현합니다.',
    requirements: [
      '큰따옴표로 감싸인 필드 내부의 쉼표는 구분자로 취급하지 않는다',
      '큰따옴표 두 개("")는 이스케이프된 하나의 큰따옴표로 처리한다',
      '필드 앞뒤 공백은 제거하지 않는다',
    ],
    constraints: [
      'csv 등 파싱 라이브러리 사용 금지 — 문자열 처리만으로 구현',
      'Python 3.x, PEP 8 준수 (4칸 들여쓰기, snake_case)',
      '함수 시그니처: parse_csv_line(line: str) -> list[str]',
    ],
    skeletonCode: null,
  },
  3: {
    id: 3,
    title: '브랜드 사이즈 매칭 통계',
    difficulty: 'L1',
    type: 'ANALYSIS_BASIC',
    maxAttempts: 3,
    attemptCount: 1102,
    sourceType: 'AUTO_GRADED',
    description:
      '브랜드별 사이즈 데이터와 고객 요청이 주어질 때, 각 요청의 사이즈 판정 결과와 그 분포를 집계합니다.',
    requirements: [
      '키·가슴·허리가 모두 사이즈 범위(최소 이상 최대 이하)에 드는 사이즈를 찾는다',
      '여럿이면 가장 작은 사이즈(입력 순서상 먼저)를 채택한다',
      '없으면 UP / DOWN / MISMATCH, 브랜드가 없으면 UNKNOWN 으로 판정',
      '전체 요청에 대해 판정 결과별 건수를 집계한다',
    ],
    constraints: [
      '판정 로직은 규칙을 정확히 구현',
      '집계는 판정 유형·건수만 (추가 통계 금지)',
    ],
    skeletonCode: null,
  },
  4: {
    id: 4,
    title: '매장 픽업 예약 순차 처리',
    difficulty: 'L2',
    type: 'ANALYSIS_ADV',
    maxAttempts: 3,
    attemptCount: 412,
    sourceType: 'AUTO_GRADED',
    description:
      '여러 매장의 재고·시간대별 한도를 고려해 예약 요청을 순서대로 처리하고, 실패 시 우선순위가 가장 높은 사유 하나만 판정합니다.',
    requirements: [
      '스토어 ID 존재 → 시간(오픈~마감) → 시간대 한도 → 재고 순으로 검증',
      '성공 시 (id, OK), 실패 시 (id, FAIL, 사유) 를 입력 순서대로 출력',
      '결과와 총 성공 건수 출력, 실패 사유별 분포와 최대 병목을 1문장으로 판단',
    ],
    constraints: [
      '입력 순서대로 순차 처리 (동시성 불필요)',
      '우선순위가 겹치면 가장 높은 사유 하나만 출력',
      '성공 시 재고 차감·예약 수 누적이 이후 요청에 반영되어야 함',
    ],
    skeletonCode: null,
  },
  5: {
    id: 5,
    title: '스터디룸 예약 정책 설계',
    difficulty: 'L2',
    type: 'AMBIGUOUS',
    maxAttempts: 3,
    attemptCount: 956,
    sourceType: 'RUBRIC_ONLY',
    description:
      '"인기 있는 방은 클릭 경쟁이라 불공정하다"는 학생 불만을 해결할 공정한 예약 정책을 설계합니다. 구체적 규칙은 명시되지 않았으니 합리적으로 판단해 정책과 근거를 문서로 정리하세요.',
    requirements: [
      '"공정성" 정의를 스스로 가정하고 근거 제시',
      '예약 정책 규칙 최소 3가지 구체적 설계',
      '각 규칙의 선택 근거 1~2문장',
      '놓칠 수 있는 예외 상황 1가지 이상 발견 및 대응',
    ],
    constraints: [
      '코드 구현 불필요 — 정책 설계 문서가 결과물',
      '공정성 정의 없이 규칙만 나열하면 감점',
      '통계적 근거를 지어내지 말 것',
    ],
    skeletonCode: null,
  },
  6: {
    id: 6,
    title: '매장 운영 우선순위 보고서',
    difficulty: 'L2',
    type: 'REPORT',
    maxAttempts: 3,
    attemptCount: 588,
    sourceType: 'RUBRIC_ONLY',
    description:
      '5개 매장의 실패 사유 통계(총 요청 수, 성공 수, STORE/TIME/FULL/STOCK 실패 건수, 평균 대기시간)를 바탕으로 어느 매장을 먼저 개선할지 보고서를 작성합니다.',
    requirements: [
      '매장별 실패율·실패 사유 분포 비교',
      '개선 우선순위 기준을 스스로 설계',
      '우선순위 1~2개 매장 선정 및 데이터 기반 논증',
      '보고서 형식(요약 → 방법 → 결과 → 제안)',
    ],
    constraints: [
      '단일 지표만으로 결론 내리면 감점 — 다축 판단',
      '존재하지 않는 지표 임의 생성 금지',
    ],
    skeletonCode: null,
  },
  7: {
    id: 7,
    title: 'CSV 로드 후 기초 통계 출력',
    difficulty: 'L1',
    type: 'SKELETON_STAT',
    maxAttempts: 3,
    attemptCount: 734,
    sourceType: 'AUTO_GRADED',
    description:
      'sensor_log.csv(sensor_id, timestamp, sensor_type, value, status, location)를 읽어 기초 통계를 내는 기능을 개발합니다. 제공된 스켈레톤은 파일을 읽어 출력만 할 뿐 통계 기능이 없으니, 프롬프트로 이를 발전시키세요.',
    requirements: [
      'sensor_type별 value의 평균·최댓값·최솟값 출력',
      'status가 error인 행의 개수 출력',
      'location별 행 수를 많은 순으로 정렬해 출력',
    ],
    constraints: [
      '제공된 스켈레톤을 출발점으로 사용 (pandas 유지)',
      '컬럼명·스키마 임의 변경 금지',
      '요구된 3가지 출력을 모두 포함',
    ],
    skeletonCode: `import pandas as pd

csv_file_path = 'sensor_log.csv'
df = pd.read_csv(csv_file_path)
print(df)`,
  },
  8: {
    id: 8,
    title: '최소 HTTP 서버에 라우팅 추가',
    difficulty: 'L1',
    type: 'SKELETON_HTTP',
    maxAttempts: 3,
    attemptCount: 651,
    sourceType: 'AUTO_GRADED',
    description:
      '제공된 스켈레톤은 요청이 오면 항상 "Hello World"만 반환합니다. 표준 라이브러리만으로 경로별 응답을 하도록 프롬프트로 발전시키세요.',
    requirements: [
      'GET /health → 상태코드 200, 본문 OK',
      'GET /time → 현재 시각을 HH:MM:SS 문자열로 반환',
      '그 외 경로 → 상태코드 404, 본문 Not Found',
    ],
    constraints: [
      '표준 라이브러리만 사용 (외부 웹 프레임워크 금지)',
      '제공된 http.server 구조를 출발점으로 유지',
      '포트 8080 유지',
    ],
    skeletonCode: `from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Hello World")

HTTPServer(('', 8080), Handler).serve_forever()`,
  },
  9: {
    id: 9,
    title: '로그 파서에 이상 감지 추가',
    difficulty: 'L2',
    type: 'SKELETON_LOG',
    maxAttempts: 3,
    attemptCount: 349,
    sourceType: 'AUTO_GRADED',
    description:
      '제공된 스켈레톤은 로그 파일을 줄 단위로 읽어 개수만 셉니다. 로그 한 줄 형식은 "timestamp ip path status_code"(공백 구분)이며, 이상 트래픽 감지 기능을 프롬프트로 추가하세요.',
    requirements: [
      '동일 IP가 60초 이내 30회 이상 요청한 경우를 이상 IP로 판정',
      '이상 IP 목록과 각 IP의 총 요청 수 출력',
      'status_code가 5xx인 요청 수를 별도로 집계해 출력',
    ],
    constraints: [
      '표준 라이브러리(datetime 등)만 사용, 머신러닝 라이브러리 금지',
      '이상 판정 기준(60초/30회)을 코드에 명시적으로 반영',
      '제공된 파일 읽기 구조를 출발점으로 유지',
    ],
    skeletonCode: `count = 0
with open('access_log.txt') as f:
    for line in f:
        count += 1
print(count)`,
  },
  10: {
    id: 10,
    title: '집계 함수를 예약 판정으로 확장',
    difficulty: 'L2',
    type: 'SKELETON_RESERVE',
    maxAttempts: 3,
    attemptCount: 297,
    sourceType: 'AUTO_GRADED',
    description:
      '제공된 스켈레톤은 예약 요청 리스트를 받아 개수만 반환합니다. 문제 4와 동일한 픽업 예약 규칙을 처리하도록 프롬프트로 발전시키세요. 스토어 정보(오픈/마감/시간당 한도/재고)는 별도 딕셔너리로 주어진다고 가정합니다.',
    requirements: [
      '각 요청을 STORE > TIME > FULL > STOCK 우선순위로 검증',
      '성공 시 (id, OK), 실패 시 (id, FAIL, 사유) 반환',
      '성공 시 재고 차감·시간대 예약 수 누적, 입력 순서대로 처리',
      '총 성공 건수도 함께 반환',
    ],
    constraints: [
      '우선순위가 겹치면 가장 높은 사유 하나만',
      '제공된 process(requests) 시그니처를 출발점으로 확장 (반환 구조는 확장 가능)',
      '상태(재고·예약 수)는 요청 간 누적되어야 함',
    ],
    skeletonCode: `def process(requests):
    return len(requests)

# requests: [{"id":1,"store":1,"item":"A001","qty":2,"time":"10:30"}, ...]`,
  },
};
