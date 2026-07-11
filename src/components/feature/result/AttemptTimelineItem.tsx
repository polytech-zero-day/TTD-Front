import { useState } from 'react';
import type { AttemptRecord } from '@/types/result';

interface AttemptTimelineItemProps {
  attempt: AttemptRecord;
  isLast: boolean;
}

export default function AttemptTimelineItem({ attempt, isLast }: AttemptTimelineItemProps) {
  const { label, time, prompt, totalTokens, isFinal, artifact } = attempt;
  const [expanded, setExpanded] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);

  return (
    <div className="flex gap-4">
      {/* 타임라인 레일 (점 + 세로선) */}
      <div className="flex flex-col items-center w-4 pt-1.5">
        <span
          className={
            isFinal
              ? 'w-4 h-4 rounded-full bg-success shrink-0'
              : 'w-3 h-3 rounded-full bg-wedgewood shrink-0'
          }
        />
        {!isLast && <span className="w-0.5 flex-1 bg-gallery-9 mt-1" />}
      </div>

      {/* 카드 */}
      <div className="flex-1 flex flex-col gap-1.5 p-4 mb-4 bg-wedgewood/[0.04] border border-gallery-9 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.72px] text-santas-gray">{label}</span>
          <span className="text-xs font-semibold text-wedgewood">{time}</span>
        </div>

        <p
          className={`text-[13px] text-gallery leading-relaxed ${
            expanded ? 'whitespace-pre-wrap' : 'line-clamp-1'
          }`}
        >
          {prompt}
        </p>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-santas-gray">
            TOTAL: <span className="text-gallery font-semibold">{totalTokens.toLocaleString()}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer text-xs text-wedgewood"
          >
            {expanded ? '접기 ↑' : '상세 보기 →'}
          </button>
          {isFinal && (
            <button
              type="button"
              onClick={() => setArtifactOpen((v) => !v)}
              className="cursor-pointer text-xs text-wedgewood"
            >
              {artifactOpen ? '제출 답변 접기 ↑' : '제출한 답변 보기 →'}
            </button>
          )}
        </div>

        {isFinal && artifactOpen && (
          <div className="mt-2 p-3 rounded border border-gallery-9 bg-ebony text-[13px] text-gallery whitespace-pre-wrap">
            {artifact ?? (
              <span className="italic text-santas-gray">
                곧 제공될 예정입니다.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
