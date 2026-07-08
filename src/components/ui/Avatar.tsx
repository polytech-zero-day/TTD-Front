interface AvatarProps {
  initial: string;
  size?: 'sm' | 'lg';
}

// Topbar, 프로필 패널, 리더보드 행에서 반복되는 아바타 패턴이라 공용 컴포넌트로 분리.
// B의 Badge/Button과 같은 파일 컨벤션(components/ui/)을 따름.
const SIZE_CLASS: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-[26px] h-[26px] text-[11px]',
  lg: 'w-16 h-16 text-[22px]',
};

export default function Avatar({ initial, size = 'sm' }: AvatarProps) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-chathams-blue text-white font-semibold shrink-0 ${SIZE_CLASS[size]}`}
    >
      {initial}
    </span>
  );
}
