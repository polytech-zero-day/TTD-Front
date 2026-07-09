import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'lg';
  variant?: 'primary' | 'muted' | 'outline';
}

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  lg: 'h-11 px-[23px]',
  sm: 'h-9 px-[14px]',
};

// variant 'outline' 은 D파트(마이페이지) 작업하면서 추가한 것.
// 기존 primary/muted는 B가 정의한 그대로 유지.
const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-wedgewood text-white',
  muted: 'bg-charade text-santas-gray',
  outline: 'border border-gallery-9 text-gallery',
};

export default function Button({
  size = 'lg',
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg text-[15px] font-medium ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
