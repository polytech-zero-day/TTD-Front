interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

export default function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-[22px] border-b border-gallery-9">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`bg-transparent border-0 border-b-2 -mb-px px-0.5 py-3 font-sans font-medium text-base cursor-pointer ${
            active === item.key ? 'text-gallery border-wedgewood' : 'text-santas-gray border-transparent'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
