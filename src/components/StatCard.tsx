interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  valueSuffix?: string;
}

export default function StatCard({
  label,
  value,
  sub,
  accent = false,
  valueSuffix,
}: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-gallery-9 bg-mirage p-5">
      <div className="text-center text-sm font-medium text-santas-gray">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-[32px] font-bold tracking-[-0.64px] ${
            accent ? 'text-neptune' : 'text-gallery'
          }`}
        >
          {value}
        </span>
        {valueSuffix && (
          <span className="text-base font-bold text-santas-gray">
            {valueSuffix}
          </span>
        )}
      </div>
      <div className="mt-1.5 text-center text-xs text-santas-gray">{sub}</div>
    </div>
  );
}
