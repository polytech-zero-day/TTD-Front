import type { AttemptUsage } from '@/types/attempt';

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Props {
  usage: AttemptUsage;
  remainingSeconds: number;
  onExit: () => void;
}

export default function AttemptTopbar({
  usage,
  remainingSeconds,
  onExit,
}: Props) {
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-gallery-9 bg-mirage px-5">
      <span className="h-[9px] w-[9px] rounded-sm bg-wedgewood" />
      <span className="text-[15px] font-bold text-gallery">TTD</span>
      <span className="text-sm text-santas-gray">문제 응시 중</span>

      <div className="ml-auto flex items-center gap-3">
        <span className="rounded-md bg-charade px-2.5 py-1 text-xs text-santas-gray">
          메시지 {usage.messagesUsed} / {usage.messagesLimit}
        </span>
        <span className="rounded-md bg-charade px-2.5 py-1 text-[13px] font-bold text-gallery tabular-nums">
          {formatTime(remainingSeconds)}
        </span>
        <button
          type="button"
          onClick={onExit}
          className="cursor-pointer text-sm text-santas-gray hover:text-gallery"
        >
          응시 종료
        </button>
      </div>
    </header>
  );
}
