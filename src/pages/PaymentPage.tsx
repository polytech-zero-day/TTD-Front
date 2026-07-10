import { useState } from 'react';
import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import { plans } from '../data/dummyPricing';
import { ApiError } from '@/lib/api/client';
import { subscribe } from '@/lib/api/subscription';
import { BillingKeyIssueError, issueBillingKey } from '@/lib/payment/portone';

const dummyUser = { name: '김지수', plan: 'FREE' as const };

const paidPlan = plans.find((plan) => plan.id === 'PAID');

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setIsProcessing(true);
    try {
      const billingKey = await issueBillingKey();
      await subscribe(billingKey);
      window.location.href = '/payment/complete';
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
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar
        active="pricing"
        userName={dummyUser.name}
        plan={dummyUser.plan}
      />

      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-2 px-5 pt-[62px] pb-20">
        <h1 className="pb-2.5 text-[18.9px] font-bold text-gallery">
          결제 확인
        </h1>

        <div className="rounded-[9px] border border-dashed border-gallery-9 bg-gallery/5 px-[15px] py-[13px] text-[11.9px] leading-[18.75px] text-santas-gray">
          🔒 카드 정보는 결제대행사(PortOne) 화면에서 직접 입력하며, TTD
          서버에는 저장되지 않습니다.
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
          {isProcessing ? '처리 중...' : '카드 등록하고 결제하기'}
        </Button>

        <button
          type="button"
          className="h-11 w-full cursor-pointer text-[13.5px] font-medium text-santas-gray"
          onClick={() => (window.location.href = '/pricing')}
        >
          취소하고 돌아가기
        </button>
      </main>
    </div>
  );
}
