import * as PortOne from '@portone/browser-sdk/v2';

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

export class BillingKeyIssueError extends Error {}

// PortOne 카드 등록 위젯을 띄워 정기결제용 billingKey를 발급받는다.
// 카드 번호 자체는 PortOne 쪽 UI에서만 입력되고 우리 서버로는 전달되지 않는다.
export async function issueBillingKey(): Promise<string> {
  if (!STORE_ID || !CHANNEL_KEY) {
    throw new BillingKeyIssueError(
      'PortOne 연동 정보(storeId/channelKey)가 설정되지 않았습니다.'
    );
  }

  const response = await PortOne.requestIssueBillingKey({
    storeId: STORE_ID,
    channelKey: CHANNEL_KEY,
    billingKeyMethod: 'CARD',
    issueName: 'TTD PAID 플랜 정기결제',
    // 나이스페이 V2는 빌링키 발급 시 주문 번호(issueId)가 필수라 매 요청마다 새로 생성한다.
    issueId: `ttd-billing-${Date.now()}-${crypto.randomUUID()}`,
  });

  if (!response || response.code) {
    throw new BillingKeyIssueError(
      response?.message ?? '카드 등록이 취소되었거나 실패했습니다.'
    );
  }

  return response.billingKey;
}
