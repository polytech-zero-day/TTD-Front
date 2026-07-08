import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({
  label,
  id,
  className = '',
  ...rest
}: InputProps) {
  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={id}>
      <span className="text-[12.4px] font-medium text-gallery">{label}</span>
      <input
        id={id}
        className={`w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood ${className}`}
        {...rest}
      />
    </label>
  );
}
