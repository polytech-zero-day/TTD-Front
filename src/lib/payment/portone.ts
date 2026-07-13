import * as PortOne from '@portone/browser-sdk/v2';

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

// Mock 결제 모드(설계서 S-13). true면 실제 PortOne 카드 팝업을 먼저 띄워 "결제하는 경험"은
// 주되, 나이스페이 가맹점이 빌링(정기결제) 미지원(F117)이라 발급이 실패하면 mock 빌링키로
// 폴백해 데모가 항상 성공하도록 한다. 백엔드도 app.payment.mock-enabled로 승인을 성공 처리한다.
export const PAYMENT_MOCK = import.meta.env.VITE_PAYMENT_MOCK === 'true';

/**
 * S3 정적 웹 사이트의 HTTP 접속 환경은 secure context가 아니어서
 * crypto.randomUUID()를 제공하지 않을 수 있다. 아래 식별자는 인증 토큰이 아니라
 * PortOne 요청·데모 빌링키의 중복 방지용이므로, 해당 환경에서는 시간·난수 조합으로 대체한다.
 */
const createRequestId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const mockBillingKey = () => `mock-billing-${createRequestId()}`;
const f117DemoBillingKey = () => `demo-f117-billing-${createRequestId()}`;

export class BillingKeyIssueError extends Error {}

// 나이스페이 정기결제 미가맹(F117)만 데모 결제 성공으로 수렴시킨다.
// 다른 오류·사용자 취소는 PAYMENT_MOCK 설정을 따르므로 실제 연동 문제를 숨기지 않는다.
//
// F117은 PG(나이스페이) 코드라 PortOne 응답의 pgCode/pgMessage에 담긴다(code/message는
// 'FAILURE_TYPE_PG' 등 PortOne 레벨 값). 코드가 안 오는 환경도 있어 한글 문구까지 함께 본다.
const F117_SIGNALS = [
  /\bF117\b/i,
  /미사용\s*가맹점/,
  /미가맹점/,
  /빌링[^가-힣]*미(사용|지원)/,
];
const looksLikeF117 = (...values: unknown[]) =>
  values.some(
    (v) => typeof v === 'string' && F117_SIGNALS.some((re) => re.test(v))
  );

// PortOne 카드 등록 위젯을 띄워 정기결제용 billingKey를 발급받는다.
// 카드 번호 자체는 PortOne 쪽 UI에서만 입력되고 우리 서버로는 전달되지 않는다.
export async function issueBillingKey(): Promise<string> {
  // 키가 없으면 팝업 자체가 불가 — mock 허용 시 바로 폴백, 아니면 오류.
  if (!STORE_ID || !CHANNEL_KEY) {
    if (PAYMENT_MOCK) return mockBillingKey();
    throw new BillingKeyIssueError(
      'PortOne 연동 정보(storeId/channelKey)가 설정되지 않았습니다.'
    );
  }

  try {
    const response = await PortOne.requestIssueBillingKey({
      storeId: STORE_ID,
      channelKey: CHANNEL_KEY,
      billingKeyMethod: 'CARD',
      issueName: 'TTD PAID 플랜 정기결제',
      // 나이스페이 V2는 빌링키 발급 시 주문 번호(issueId)가 필수라 매 요청마다 새로 생성한다.
      issueId: `ttd-billing-${createRequestId()}`,
    });

    if (response && !response.code && response.billingKey) {
      return response.billingKey; // 실제 발급 성공
    }
    // F117은 이 프로젝트의 데모 환경에서만 승인 완료로 간주한다.
    // 백엔드는 mock-enabled일 때만 이 billing key를 PAID로 기록한다.
    if (
      looksLikeF117(
        response?.code,
        response?.message,
        response?.pgCode,
        response?.pgMessage
      )
    ) {
      return f117DemoBillingKey();
    }
    // 그 외 발급 실패는 PAYMENT_MOCK일 때만 전체 데모 폴백을 적용한다.
    if (PAYMENT_MOCK) return mockBillingKey();
    throw new BillingKeyIssueError(
      response?.message ?? '카드 등록이 취소되었거나 실패했습니다.'
    );
  } catch (err) {
    if (looksLikeF117(err instanceof Error ? err.message : undefined)) {
      return f117DemoBillingKey();
    }
    // 팝업 내부 오류·예외까지 데모에선 mock으로 수렴(창을 닫은 취소도 포함).
    if (PAYMENT_MOCK) return mockBillingKey();
    throw err instanceof BillingKeyIssueError
      ? err
      : new BillingKeyIssueError('카드 등록이 취소되었거나 실패했습니다.');
  }
}
