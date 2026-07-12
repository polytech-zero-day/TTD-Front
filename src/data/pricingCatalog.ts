import type { Plan } from '../types/pricing';

// 요금제 카탈로그(가격·기능 목록)는 백엔드에 별도 API가 없어 프론트에서 고정 관리한다.
// 현재 구독 상태(FREE/PAID)는 GET /api/subscriptions/me 로 조회 — lib/api/subscription.ts 참고.
export const plans: Plan[] = [
  {
    id: 'FREE',
    name: 'FREE',
    priceLabel: '₩0',
    priceSuffix: '/ 월',
    features: [
      { label: '전체 문제 카탈로그 이용', included: true },
      { label: '기본 AI 모델(gpt-5.4-mini)로 응시', included: true },
      { label: '문제별 응시 3회 · 응시당 프롬프트 10회', included: true },
      { label: '채점 결과·루브릭 근거 공개 · 리더보드 조회', included: true },
      { label: '상위 AI 모델(gpt-5.4)로 응시', included: false },
      { label: '응시·프롬프트 횟수 무제한', included: false },
    ],
  },
  {
    id: 'PAID',
    name: 'PAID',
    priceLabel: '₩9,900',
    priceSuffix: '/ 월',
    recommended: true,
    features: [
      { label: 'FREE의 모든 기능 포함', included: true },
      {
        label: '상위 AI 모델(gpt-5.4)로 응시',
        included: true,
        emphasis: '상위 모델',
      },
      { label: '문제별 응시 횟수', included: true, emphasis: '무제한' },
      { label: '응시 내 프롬프트 횟수', included: true, emphasis: '무제한' },
    ],
  },
];
