import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Topbar from '../components/Topbar';
import Button from '../components/ui/Button';
import { plans } from '../data/pricingCatalog';
import { getMySubscription } from '@/lib/api/subscription';
import { formatDate } from '@/lib/format';
import type { SubscriptionResponse } from '@/types/subscription';

const paidPlan = plans.find((plan) => plan.id === 'PAID');

// S-14 결제 완료 화면. 결제 성공(PaymentPage) 직후 진입해 구독 전환 완료를 안내한다.
// 결제 직후에는 라우터 state의 구독 응답을 그대로 쓰고, 새로고침 등 state가 없으면 재조회한다.
export default function PaymentCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateSubscription = (
    location.state as { subscription?: SubscriptionResponse } | null
  )?.subscription;

  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(
    stateSubscription ?? null
  );

  useEffect(() => {
    if (stateSubscription) return;
    let cancelled = false;
    getMySubscription().then((sub) => {
      if (cancelled) return;
      if (sub) {
        setSubscription(sub);
        return;
      }
      // 결제 없이 직접 진입 — "결제 완료" 안내가 거짓이 되므로 요금제로 돌려보낸다
      toast.error('구독 내역이 없습니다. 요금제에서 결제를 진행해주세요.');
      navigate('/pricing', { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [stateSubscription, navigate]);

  return (
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar active="pricing" />

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
            onClick={() => navigate('/mypage')}
          >
            마이페이지에서 구독 확인
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/problems')}
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
