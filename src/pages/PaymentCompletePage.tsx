import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import { plans } from '../data/dummyPricing';
import { getMySubscription } from '@/lib/api/subscription';
import type { SubscriptionResponse } from '@/types/subscription';

const dummyUser = { name: '김지수', plan: 'PAID' as const };

const paidPlan = plans.find((plan) => plan.id === 'PAID');

// "2026-08-10T18:00:00" → "2026-08-10"
const formatDate = (iso: string) => iso.slice(0, 10);

// S-14 결제 완료 화면. 결제 성공(PaymentPage) 직후 진입해 구독 전환 완료를 안내한다.
export default function PaymentCompletePage() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(
    null
  );

  useEffect(() => {
    getMySubscription().then(setSubscription);
  }, []);

  return (
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar
        active="pricing"
        userName={dummyUser.name}
        plan={dummyUser.plan}
      />

      <main className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-6 px-5 pt-[62px] pb-20">
        {/* 완료 아이콘 + 헤드라인 */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-wedgewood/20 text-2xl">
            ✓
          </span>
          <h1 className="text-[22px] font-bold text-gallery">
            결제가 완료되었습니다
          </h1>
          <p className="text-sm text-santas-gray">
            PAID 플랜으로 전환되어 지금부터 모든 기능을 이용할 수 있습니다.
          </p>
        </div>

        {/* 구독 요약 카드 */}
        <div className="flex w-full flex-col rounded-xl border border-gallery-9 bg-mirage p-6">
          <SummaryRow label="플랜" value="PAID (월간 구독)" />
          <SummaryRow
            label="결제 금액"
            value={`${paidPlan?.priceLabel ?? '₩9,900'} / 월`}
          />
          <SummaryRow label="청구 주기" value="매월 자동 갱신" />
          {subscription && (
            <SummaryRow
              label="다음 결제일"
              value={formatDate(subscription.nextBillingAt)}
            />
          )}
        </div>

        {/* 액션 */}
        <div className="flex w-full flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = '/mypage')}
          >
            마이페이지에서 구독 확인
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.href = '/problems')}
          >
            문제 풀러 가기
          </Button>
        </div>
      </main>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gallery-9 py-3.5 last:border-b-0">
      <span className="text-sm text-santas-gray">{label}</span>
      <span className="text-sm font-semibold text-gallery">{value}</span>
    </div>
  );
}
