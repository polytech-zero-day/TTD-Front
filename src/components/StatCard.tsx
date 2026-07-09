interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  valueSuffix?: string;
}

export default function StatCard({ label, value, sub, accent = false, valueSuffix }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 p-5 bg-mirage border border-gallery-9 rounded-xl">
      <div className="text-sm font-medium text-santas-gray text-center">{label}</div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-[32px] font-bold tracking-[-0.64px] ${
            accent ? 'text-neptune' : 'text-gallery'
          }`}
        >
          {value}
        </span>
        {valueSuffix && <span className="text-base font-bold text-santas-gray">{valueSuffix}</span>}
      </div>
      <div className="text-xs text-santas-gray text-center mt-1.5">{sub}</div>
    </div>
  );
}
