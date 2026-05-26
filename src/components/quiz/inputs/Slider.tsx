import { cn } from '@/lib/utils';
import { Slider as ShadcnSlider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type Props = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (n: number) => string;
  quickPicks?: { label: string; value: number }[];
  helpText?: string;
  required?: boolean;
};

export default function Slider({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
  quickPicks,
  helpText,
  required,
}: Props) {
  const helpId = helpText ? `${id}-help` : undefined;
  const display = formatValue ? formatValue(value) : String(value);
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>
          {label}
          {required ? ' *' : ''}
        </Label>
        <span className="font-semibold tabular-nums" aria-live="polite">
          {display}
        </span>
      </div>
      <ShadcnSlider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? min)}
        aria-describedby={helpId}
      />
      {quickPicks?.length ? (
        <div className="flex flex-wrap gap-2">
          {quickPicks.map((pick) => (
            <button
              key={pick.label}
              type="button"
              onClick={() => onChange(pick.value)}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                value === pick.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-input hover:border-primary/50',
              )}
            >
              {pick.label}
            </button>
          ))}
        </div>
      ) : null}
      {helpText ? (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
