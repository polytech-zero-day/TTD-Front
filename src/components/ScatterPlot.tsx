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
    <div className="relative w-full h-[340px] bg-ebony border border-gallery-9 rounded-[10px] overflow-hidden">
      <span className="absolute left-[9px] top-[9px] text-[11px] text-santas-gray">품질 ↑</span>
      <span className="absolute left-[9px] bottom-[9px] text-[11px] text-santas-gray">품질 ↓</span>

      {points.map((point, index) => (
        <div
          key={index}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
            point.isCurrentUser
              ? 'w-2.5 h-2.5 bg-wedgewood shadow-[0_0_0_4px_var(--color-wedgewood-28)]'
              : 'w-2 h-2 bg-mid-gray'
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
