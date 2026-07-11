import Button from '../../ui/Button';
import type { Plan } from '../../../types/pricing';

interface PlanCardProps {
  plan: Plan;
  isCurrent: boolean;
  isActionDisabled?: boolean;
  actionLabel?: string;
  onSelect: () => void;
}

export default function PlanCard({
  plan,
  isCurrent,
  isActionDisabled = false,
  actionLabel,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-1 flex-col gap-4 rounded-xl border bg-mirage p-[27px] shadow-[0_1px_2px_rgba(0,0,0,0.28)] ${
        plan.recommended
          ? 'border-wedgewood shadow-[0_4px_6px_-1px_rgba(0,0,0,0.35),0_2px_4px_-2px_rgba(0,0,0,0.3)]'
          : 'border-gallery-9'
      }`}
    >
      {plan.recommended && (
        <span className="absolute top-0 right-[18px] rounded-b-md bg-wedgewood px-2.5 py-1 text-[11px] font-bold text-white">
          추천
        </span>
      )}

      <span className="text-sm font-semibold text-santas-gray">
        {plan.name}
      </span>

      <div className="flex items-end gap-1.5">
        <span className="text-[34px] font-bold tracking-[-0.68px] text-gallery">
          {plan.priceLabel}
        </span>
        <span className="pb-1 text-sm text-santas-gray">
          {plan.priceSuffix}
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2">
            <span
              className={`text-[13.5px] ${feature.included ? 'text-success' : 'text-santas-gray'}`}
            >
              {feature.included ? '✓' : '✕'}
            </span>
            <span
              className={`text-[13px] ${feature.included ? 'text-gallery' : 'text-santas-gray'}`}
            >
              {feature.label}
              {feature.emphasis && (
                <span className="font-bold text-gallery">
                  {' '}
                  {feature.emphasis}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={isCurrent || isActionDisabled ? 'muted' : 'primary'}
        size="lg"
        disabled={isCurrent || isActionDisabled}
        className={`mt-auto w-full ${isCurrent || isActionDisabled ? 'opacity-45' : ''}`}
        onClick={onSelect}
      >
        {actionLabel ?? (isCurrent ? '현재 플랜' : '업그레이드하기')}
      </Button>
    </div>
  );
}
