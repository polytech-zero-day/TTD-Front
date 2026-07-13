import { useState } from 'react';
import { useNavigate } from 'react-router';
import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import { plans } from '../data/pricingCatalog';
import { ApiError } from '@/lib/api/client';
import { subscribe } from '@/lib/api/subscription';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import {
  BillingKeyIssueError,
  issueBillingKey,
  PAYMENT_MOCK,
} from '@/lib/payment/portone';

const paidPlan = plans.find((plan) => plan.id === 'PAID');

export default function PaymentPage() {
  const navigate = useNavigate();
  const { refresh } = useCurrentUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setIsProcessing(true);
    try {
      const billingKey = await issueBillingKey();
      const subscription = await subscribe(billingKey);
      await refresh();
      // 구독 응답을 state로 넘겨 완료 화면이 재조회 없이 확정 데이터를 표시
      navigate('/payment/complete', { state: { subscription } });
    } catch (err) {
      setError(
        err instanceof BillingKeyIssueError || err instanceof ApiError
          ? err.message
          : '결제 처리 중 문제가 발생했습니다.'
      );
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-ebony font-sans">
      <Topbar active="pricing" />

      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-2 px-5 pt-[62px] pb-20">
        <h1 className="pb-2.5 text-[18.9px] font-bold text-gallery">
          결제 확인
        </h1>

        <div className="rounded-[9px] border border-dashed border-gallery-9 bg-gallery/5 px-[15px] py-[13px] text-[11.9px] leading-[18.75px] text-santas-gray">
          {PAYMENT_MOCK ? (
            <>
              🧪 테스트 결제입니다. 카드 등록창이 뜨면 테스트 카드로 진행하세요.
              실제 청구는 발생하지 않으며, 발급이 안 돼도 데모용으로 구독이
              활성화됩니다.
            </>
          ) : (
            <>
              🔒 카드 정보는 결제대행사(PortOne) 화면에서 직접 입력하며, TTD
              서버에는 저장되지 않습니다.
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gallery-9 bg-mirage p-5 shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between border-b border-gallery-9 pb-3">
            <span className="text-[13.5px] text-santas-gray">플랜</span>
            <span className="text-[13.5px] text-gallery">
              {paidPlan?.name} (월간 구독)
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gallery-9 pb-3">
            <span className="text-[13.5px] text-santas-gray">청구 주기</span>
            <span className="text-[13.3px] text-gallery">매월 자동 갱신</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15.8px] font-bold text-gallery">
              결제 금액
            </span>
            <span className="text-base font-bold text-gallery">
              {paidPlan?.priceLabel}
              <span className="ml-1 text-sm font-normal text-santas-gray">
                {paidPlan?.priceSuffix}
              </span>
            </span>
          </div>
        </div>

        {error && (
          <p className="text-[12.3px] font-medium text-gallery">⚠ {error}</p>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isProcessing}
          onClick={handleConfirm}
        >
          {isProcessing
            ? '처리 중...'
            : PAYMENT_MOCK
              ? '테스트 결제로 구독하기'
              : '카드 등록하고 결제하기'}
        </Button>

        <button
          type="button"
          className="h-11 w-full cursor-pointer text-[13.5px] font-medium text-santas-gray"
          onClick={() => navigate('/pricing')}
        >
          취소하고 돌아가기
        </button>
      </main>
    </div>
  );
}
