export interface ActivityItem {
  id: string;
  type: 'user' | 'problem';
  title: string;
  detail: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  items: ActivityItem[];
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gallery-9 bg-mirage p-5 text-[13px] text-santas-gray">
        최근 활동이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gallery-9 bg-mirage">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 border-b border-gallery-9 px-5 py-3 last:border-b-0"
        >
          <span
            className={`size-[7px] shrink-0 rounded-full ${
              item.type === 'user' ? 'bg-wedgewood' : 'bg-neptune'
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-gallery">
              {item.title}
            </div>
            <div className="text-xs text-santas-gray">{item.detail}</div>
          </div>
          <span className="shrink-0 text-xs text-santas-gray">
            {formatDateTime(item.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
