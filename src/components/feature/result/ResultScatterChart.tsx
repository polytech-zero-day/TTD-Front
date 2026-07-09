import type { ScatterDot } from '@/data/dummyResult';

interface ResultScatterChartProps {
  dots: ScatterDot[];
}

export default function ResultScatterChart({ dots }: ResultScatterChartProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {/* Y축 라벨 (세로) */}
        <div className="flex w-6 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-sm font-semibold text-santas-gray">
            품질점수
          </span>
        </div>

        <div className="relative flex-1 aspect-square bg-ebony border border-gallery-9 rounded-lg overflow-hidden">
          {dots.map((dot, index) => {
            let dotClass = 'w-2 h-2 rounded-full bg-wedgewood/25';
            if (dot.isTopTen) dotClass = 'w-2.5 h-2.5 rounded-full bg-success/60';
            if (dot.isCurrentPosition)
              dotClass =
                'w-5 h-5 rounded-full bg-wedgewood border-2 border-white z-10 shadow-[0_0_0_5px_rgba(80,140,155,0.35)]';

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

      {/* X축 라벨 (스캐터 폭과 정렬) */}
      <div className="flex gap-2">
        <div className="w-6 flex-none" />
        <div className="flex-1 text-center">
          <span className="text-sm font-semibold text-santas-gray">효율성점수</span>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-wedgewood/25" />
          <span className="text-xs text-gallery">다른 사용자</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          <span className="text-xs text-gallery">상위 10%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-wedgewood border-2 border-white shadow-[0_0_0_3px_rgba(80,140,155,0.35)]" />
          <span className="text-xs text-gallery">내 위치</span>
        </div>
      </div>
    </div>
  );
}
