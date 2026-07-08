import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'lg';
  variant?: 'primary' | 'muted';
}

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  lg: 'h-11 px-[23px]',
  sm: 'h-9 px-[14px]',
};

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-wedgewood text-white',
  muted: 'bg-charade text-santas-gray',
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
      className={`inline-flex items-center justify-center rounded-lg text-[15px] font-medium ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
