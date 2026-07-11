// 결과 리포트용 산점도. 세 가지 상태를 시각적으로 구분한다.
//   - 일반 응시자 점 (isTopTen/isCurrentPosition 없음): 회색 소형
//   - 상위 10% 점 (isTopTen): 브랜드 색상, 강조
//   - 내 위치 (isCurrentPosition): 흰 링을 두른 브랜드 색상, 최상단 z-order

export interface ScatterDot {
  quality: number; // 0-100
  efficiency: number; // 0-100
  isCurrentPosition?: boolean;
  isTopTen?: boolean;
}

interface ResultScatterChartProps {
  dots: ScatterDot[];
}

export default function ResultScatterChart({ dots }: ResultScatterChartProps) {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-[10px] border border-gallery-9 bg-ebony">
      <span className="absolute top-[9px] left-[9px] text-[11px] text-santas-gray">
        품질 ↑
      </span>
      <span className="absolute bottom-[9px] left-[9px] text-[11px] text-santas-gray">
        품질 ↓
      </span>
      <span className="absolute bottom-[9px] right-[9px] text-[11px] text-santas-gray">
        효율성 →
      </span>

      {dots.map((dot, index) => {
        const dotClass = dot.isCurrentPosition
          ? 'h-3.5 w-3.5 bg-wedgewood shadow-[0_0_0_3px_white]'
          : dot.isTopTen
            ? 'h-2 w-2 bg-wedgewood/70'
            : 'h-2 w-2 bg-mid-gray';
        const zIndex = dot.isCurrentPosition ? 2 : dot.isTopTen ? 1 : 0;
        return (
          <div
            key={index}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClass}`}
            style={{
              left: `${dot.efficiency}%`,
              top: `${100 - dot.quality}%`,
              zIndex,
            }}
          />
        );
      })}
    </div>
  );
}
