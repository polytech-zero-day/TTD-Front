// 결과 리포트용 산점도. 세 가지 상태를 시각적으로 구분한다.
//   - 일반 응시자 점 (isTopTen/isCurrentPosition 없음): 회색 소형
//   - 상위 10% 점 (isTopTen): 브랜드 색상, 강조
//   - 내 위치 (isCurrentPosition): 흰 링을 두른 브랜드 색상, 최상단 z-order
// 축 라벨과 범례는 차트 박스 바깥에 배치해 가독성을 확보한다.

export interface ScatterDot {
  quality: number; // 0-100
  efficiency: number; // 0-100
  isCurrentPosition?: boolean;
  isTopTen?: boolean;
}

interface ResultScatterChartProps {
  dots: ScatterDot[];
}

const NORMAL_DOT = 'h-2 w-2 bg-mid-gray';
const TOP_TEN_DOT = 'h-2 w-2 bg-wedgewood/70';
const CURRENT_DOT = 'h-3.5 w-3.5 bg-wedgewood shadow-[0_0_0_3px_white]';

export default function ResultScatterChart({ dots }: ResultScatterChartProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11.5px] text-santas-gray">품질 ↑</span>

      <div className="relative h-[340px] w-full overflow-hidden rounded-[10px] border border-gallery-9 bg-ebony">
        {dots.map((dot, index) => {
          const dotClass = dot.isCurrentPosition
            ? CURRENT_DOT
            : dot.isTopTen
              ? TOP_TEN_DOT
              : NORMAL_DOT;
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

      <span className="text-[11.5px] text-santas-gray">품질 ↓</span>

      <div className="flex justify-between text-[11.5px] text-santas-gray">
        <span>← 효율성 낮음</span>
        <span>효율성 높음 →</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[11.5px] text-santas-gray">
        <span className="flex items-center gap-1.5">
          <span className={`rounded-full ${NORMAL_DOT}`} />
          다른 응시자
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`rounded-full ${TOP_TEN_DOT}`} />
          상위 10%
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`rounded-full ${CURRENT_DOT}`} />
          내 위치
        </span>
      </div>
    </div>
  );
}
