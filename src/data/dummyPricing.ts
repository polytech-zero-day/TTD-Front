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
      { label: '문제당 프롬프트 3회 제공', included: true },
      { label: '일일 제출 3회 · 채점 결과·루브릭 근거 공개', included: true },
      { label: '전체/문제별 리더보드 조회', included: true },
      { label: '심화 리포트(성장 추이·약점 분석)', included: false },
      { label: '상위 AI 모델(Sonnet, Opus) 선택', included: false },
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
      { label: '일일 제출', included: true, emphasis: '무제한' },
      { label: '심화 리포트 — 성장 추이 분석', included: true },
      { label: '심화 리포트 — 약점 분석 & 추천 학습 경로', included: true },
      {
        label: '상위 AI 모델(Claude 3.5 Sonnet, Opus) 실행 선택',
        included: true,
      },
    ],
  },
];
