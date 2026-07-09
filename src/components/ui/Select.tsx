import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'compact' | 'form';
}

const VARIANT_CLASS: Record<NonNullable<SelectProps['variant']>, string> = {
  compact:
    'h-9 rounded-lg border border-gallery-9 bg-mirage pl-3 pr-9 text-[13px] text-gallery',
  form: 'rounded-lg border border-gallery-9 bg-ebony py-[10px] pl-[13px] pr-9 text-[13.5px] text-gallery outline-none focus:border-wedgewood',
};

export default function Select({
  variant = 'compact',
  className = '',
  children,
  ...rest
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        className={`w-full cursor-pointer appearance-none disabled:cursor-default disabled:opacity-60 ${VARIANT_CLASS[variant]}`}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-santas-gray"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.5 4.5 6 8l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
