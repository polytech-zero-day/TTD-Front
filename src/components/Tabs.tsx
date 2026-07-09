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
          className={`-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-0.5 py-3 font-sans text-base font-medium ${
            active === item.key
              ? 'border-wedgewood text-gallery'
              : 'border-transparent text-santas-gray'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
