import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Topbar from '../components/Topbar';
import PlanCard from '../components/feature/pricing/PlanCard';
import { plans } from '../data/pricingCatalog';
import { getMySubscription } from '@/lib/api/subscription';
import { isPaidSubscription } from '@/lib/subscription/plan';
import { isAuthenticated } from '@/lib/auth/session';
import type { PlanId } from '../types/pricing';

export default function PricingPage() {
  const navigate = useNavigate();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(null);
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    getMySubscription().then((subscription) => {
      if (cancelled) return;
      setCurrentPlanId(
        isPaidSubscription(subscription?.status) ? 'PAID' : 'FREE'
      );
    });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return (
    <div className="mx-auto min-h-[1200px] w-full max-w-[1920px] bg-ebony font-sans">
      <Topbar active="pricing" />

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
              isCurrent={
                isLoggedIn &&
                currentPlanId !== null &&
                plan.id === currentPlanId
              }
              isActionDisabled={
                isLoggedIn && currentPlanId === 'PAID' && plan.id === 'FREE'
              }
              actionLabel={
                !isLoggedIn
                  ? plan.id === 'PAID'
                    ? '로그인 후 업그레이드'
                    : '무료로 시작하기'
                  : currentPlanId === 'PAID' && plan.id === 'FREE'
                    ? '유료 플랜 이용 중'
                    : undefined
              }
              onSelect={() => {
                if (!isLoggedIn) {
                  navigate(plan.id === 'PAID' ? '/login' : '/signup');
                  return;
                }
                if (plan.id === 'PAID' && plan.id !== currentPlanId) {
                  navigate('/payment');
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
