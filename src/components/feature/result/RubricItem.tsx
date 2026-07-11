import type { RubricCriterionData } from '@/types/result';

interface RubricItemProps {
  data: RubricCriterionData;
}

export default function RubricItem({ data }: RubricItemProps) {
  const { title, scoreDisplay, description, note } = data;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gallery-9 bg-wedgewood/[0.04] p-[18px]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gallery">{title}</h3>
        <span className="rounded bg-wedgewood/15 px-2.5 py-1 text-sm font-bold text-wedgewood">
          {scoreDisplay.type === 'score'
            ? `${scoreDisplay.earned} / ${scoreDisplay.max}`
            : scoreDisplay.label}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-gallery">{description}</p>

      {note && (
        <div
          className={`flex items-start gap-2 rounded px-3.5 py-2 ${
            note.tone === 'warning'
              ? 'border-l-[3px] border-amber-500 bg-amber-400/[0.08]'
              : 'border-l-[3px] border-wedgewood bg-wedgewood/[0.08]'
          }`}
        >
          <span className="shrink-0 text-xs">{note.icon}</span>
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
