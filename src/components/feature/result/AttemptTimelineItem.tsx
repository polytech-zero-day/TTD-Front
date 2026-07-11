import { useState } from 'react';
import type { AttemptRecord } from '@/types/result';

interface AttemptTimelineItemProps {
  attempt: AttemptRecord;
  isLast: boolean;
}

export default function AttemptTimelineItem({
  attempt,
  isLast,
}: AttemptTimelineItemProps) {
  const { label, time, prompt, totalTokens, isFinal, artifact } = attempt;
  const [expanded, setExpanded] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);

  return (
    <div className="flex gap-4">
      {/* 타임라인 레일 (점 + 세로선) */}
      <div className="flex w-4 flex-col items-center pt-1.5">
        <span
          className={
            isFinal
              ? 'h-4 w-4 shrink-0 rounded-full bg-success'
              : 'h-3 w-3 shrink-0 rounded-full bg-wedgewood'
          }
        />
        {!isLast && <span className="mt-1 w-0.5 flex-1 bg-gallery-9" />}
      </div>

      {/* 카드 */}
      <div className="mb-4 flex flex-1 flex-col gap-1.5 rounded-lg border border-gallery-9 bg-wedgewood/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.72px] text-santas-gray">
            {label}
          </span>
          <span className="text-xs font-semibold text-wedgewood">{time}</span>
        </div>

        <p
          className={`text-[13px] leading-relaxed text-gallery ${
            expanded ? 'whitespace-pre-wrap' : 'line-clamp-1'
          }`}
        >
          {prompt}
        </p>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-santas-gray">
            TOTAL:{' '}
            <span className="font-semibold text-gallery">
              {totalTokens.toLocaleString()}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex cursor-pointer items-center gap-1 text-xs text-wedgewood hover:text-wedgewood/80"
          >
            {expanded ? '프롬프트 접기' : '프롬프트 전체 보기'}
            <ChevronDown open={expanded} />
          </button>
          {isFinal && (
            <button
              type="button"
              onClick={() => setArtifactOpen((v) => !v)}
              className="flex cursor-pointer items-center gap-1 rounded border border-wedgewood/30 bg-wedgewood/10 px-2.5 py-1 text-xs font-semibold text-wedgewood hover:bg-wedgewood/15"
            >
              {artifactOpen ? '제출 답변 접기' : '제출한 답변 보기'}
              <ChevronDown open={artifactOpen} />
            </button>
          )}
        </div>

        {isFinal && artifactOpen && (
          <div className="mt-2 rounded border border-gallery-9 bg-ebony p-3 text-[13px] whitespace-pre-wrap text-gallery">
            {artifact ?? (
              <span className="text-santas-gray italic">
                곧 제공될 예정입니다.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
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
  );
}
