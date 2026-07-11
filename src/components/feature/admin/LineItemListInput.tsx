import Button from '@/components/ui/Button';

interface LineItemListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export default function LineItemListInput({
  label,
  items,
  onChange,
  placeholder,
}: LineItemListInputProps) {
  function updateItem(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, '']);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12.4px] font-medium text-gallery">{label}</span>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-gallery-9 bg-ebony px-[13px] py-[10px] text-[13.5px] text-gallery outline-none focus:border-wedgewood"
            />
            <Button
              type="button"
              size="sm"
              variant="muted"
              className="shrink-0 whitespace-nowrap"
              onClick={() => removeItem(index)}
            >
              삭제
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={addItem}>
        줄 추가
      </Button>
    </div>
  );
}
