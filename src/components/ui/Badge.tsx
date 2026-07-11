import type { ReactNode } from 'react';

interface BadgeProps {
  tone?: 'accent' | 'neutral' | 'pill' | 'success' | 'paid';
  children: ReactNode;
}

// tone 'pill'/'success' 는 D파트(마이페이지·리더보드) 작업하면서 추가한 것.
// 기존 accent/neutral은 B가 정의한 그대로 유지.
export default function Badge({ tone = 'neutral', children }: BadgeProps) {
  const toneClass = {
    accent: 'rounded-md bg-breaker-bay-18 text-gallery',
    neutral: 'rounded-md border border-gallery-9 text-santas-gray',
    pill: 'rounded-full bg-biscay text-jungle-mist',
    success: 'rounded-md bg-success-bg text-success',
    paid: 'rounded-full border border-neptune/60 bg-neptune/15 text-neptune',
  }[tone];

  return (
    <span
      className={`inline-flex h-5 items-center px-2.5 py-0.5 text-[11px] font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}
