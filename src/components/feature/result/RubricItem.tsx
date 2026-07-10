import type { RubricCriterionData } from '@/data/dummyResult';

interface RubricItemProps {
  data: RubricCriterionData;
}

export default function RubricItem({ data }: RubricItemProps) {
  const { title, scoreDisplay, description, note } = data;

  return (
    <div className="flex flex-col gap-2 p-[18px] bg-wedgewood/[0.04] border border-gallery-9 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gallery">{title}</h3>
        <span className="px-2.5 py-1 rounded bg-wedgewood/15 text-wedgewood text-sm font-bold">
          {scoreDisplay.type === 'score'
            ? `${scoreDisplay.earned} / ${scoreDisplay.max}`
            : scoreDisplay.label}
        </span>
      </div>

      <p className="text-sm text-gallery leading-relaxed">{description}</p>

      {note && (
        <div
          className={`flex items-start gap-2 px-3.5 py-2 rounded ${
            note.tone === 'warning'
              ? 'bg-amber-400/[0.08] border-l-[3px] border-amber-500'
              : 'bg-wedgewood/[0.08] border-l-[3px] border-wedgewood'
          }`}
        >
          <span className="text-xs shrink-0">{note.icon}</span>
          <span
            className={`text-xs ${note.tone === 'warning' ? 'text-amber-300' : 'text-santas-gray'}`}
          >
            {note.text}
          </span>
        </div>
      )}
    </div>
  );
}
