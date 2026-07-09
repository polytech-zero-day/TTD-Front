import type { ScatterDot } from '../data/dummyResult';

interface ResultScatterChartProps {
  dots: ScatterDot[];
}

export default function ResultScatterChart({ dots }: ResultScatterChartProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {/* Y축 라벨 (세로) */}
        <div className="flex items-center justify-center w-4">
          <span className="text-sm font-semibold text-santas-gray [writing-mode:vertical-rl] rotate-180">
            품질점수
          </span>
        </div>

        <div className="relative flex-1 aspect-square bg-ebony border border-gallery-9 rounded-lg overflow-hidden">
          {dots.map((dot, index) => {
            let dotClass = 'w-3 h-3 rounded-full bg-wedgewood/30';
            if (dot.isTopTen) dotClass = 'w-3 h-3 rounded-full bg-success';
            if (dot.isCurrentPosition) dotClass = 'w-3 h-3 rounded-full border-2 border-wedgewood bg-transparent';

            return (
              <div
                key={index}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${dotClass}`}
                style={{ left: `${dot.efficiency}%`, top: `${100 - dot.quality}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="pl-6 text-center">
        <span className="text-sm font-semibold text-santas-gray">효율성점수</span>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-wedgewood/30" />
          <span className="text-xs text-gallery">다른 사용자</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-wedgewood" />
          <span className="text-xs text-gallery">현재 위치</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-success" />
          <span className="text-xs text-gallery">상위 10%</span>
        </div>
      </div>
    </div>
  );
}
