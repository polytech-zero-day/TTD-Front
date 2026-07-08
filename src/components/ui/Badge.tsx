import type { ReactNode } from 'react';

interface BadgeProps {
  tone?: 'accent' | 'neutral';
  children: ReactNode;
}

export default function Badge({ tone = 'neutral', children }: BadgeProps) {
  const toneClass =
    tone === 'accent'
      ? 'bg-breaker-bay-18 text-gallery'
      : 'border border-gallery-9 text-santas-gray';

  return (
    <span
      className={`inline-flex h-5 items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}
