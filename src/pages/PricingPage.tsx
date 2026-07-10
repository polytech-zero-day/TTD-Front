import { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import PlanCard from '../components/feature/pricing/PlanCard';
import { plans } from '../data/dummyPricing';
import { getMySubscription } from '@/lib/api/subscription';
import type { PlanId } from '../types/pricing';

const dummyUser = { name: '김지수' };

export default function PricingPage() {
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(null);

  useEffect(() => {
    let cancelled = false;

    getMySubscription().then((subscription) => {
      if (cancelled) return;
      setCurrentPlanId(subscription?.status === 'ACTIVE' ? 'PAID' : 'FREE');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar
        active="pricing"
        userName={dummyUser.name}
        plan={currentPlanId ?? 'FREE'}
      />

      <main className="mx-auto flex w-full max-w-[820px] flex-col items-center gap-[26px] px-5 pt-[42px] pb-20">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold text-gallery">
            나에게 맞는 플랜을 선택하세요
          </h1>
          <p className="text-sm text-santas-gray">
            채점 방법론(정확도·루브릭)은 무료·유료 관계없이 동일하게 유지됩니다.
          </p>
        </div>

        <div className="flex w-full items-stretch gap-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={currentPlanId !== null && plan.id === currentPlanId}
              onSelect={() => {
                if (plan.id !== currentPlanId) {
                  window.location.href = '/payment';
                }
              }}
            />
          ))}
        </div>

        <div className="w-full rounded-[9px] border border-chathams-blue bg-mirage-glow px-[15px] py-[13px] text-[12.4px] text-jungle-mist">
          💡 결제 여부는 채점 정확도에 영향을 주지 않습니다. 과금 차이는 제출
          횟수·리포트 깊이·실행 모델 선택 등 운영 정책 영역에서만 발생합니다.
        </div>
      </main>
    </div>
  );
}
