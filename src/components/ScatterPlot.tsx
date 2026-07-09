export interface ScatterPoint {
  quality: number; // 0-100
  efficiency: number; // 0-100
  isCurrentUser?: boolean;
}

interface ScatterPlotProps {
  points: ScatterPoint[];
}

export default function ScatterPlot({ points }: ScatterPlotProps) {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-[10px] border border-gallery-9 bg-ebony">
      <span className="absolute top-[9px] left-[9px] text-[11px] text-santas-gray">
        품질 ↑
      </span>
      <span className="absolute bottom-[9px] left-[9px] text-[11px] text-santas-gray">
        품질 ↓
      </span>

      {points.map((point, index) => (
        <div
          key={index}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
            point.isCurrentUser
              ? 'h-2.5 w-2.5 bg-wedgewood shadow-[0_0_0_4px_var(--color-wedgewood-28)]'
              : 'h-2 w-2 bg-mid-gray'
          }`}
          style={{
            left: `${point.efficiency}%`,
            top: `${100 - point.quality}%`,
          }}
        />
      ))}
    </div>
  );
}
