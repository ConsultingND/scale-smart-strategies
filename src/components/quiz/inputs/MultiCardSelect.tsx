import { cn } from '@/lib/utils';
import type { Option } from '../types';

type Props = {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  helpText?: string;
  required?: boolean;
  maxSelections?: number;
};

export default function MultiCardSelect({
  id,
  label,
  value,
  onChange,
  options,
  helpText,
  required,
  maxSelections,
}: Props) {
  const groupHelpId = helpText ? `${id}-help` : undefined;
  const atCap = maxSelections != null && value.length >= maxSelections;

  const toggle = (v: string) => {
    if (value.includes(v)) {
      // Deselecting is always allowed
      onChange(value.filter((x) => x !== v));
    } else if (!atCap) {
      onChange([...value, v]);
    }
    // If atCap and v isn't selected, ignore the click silently.
  };

  return (
    <fieldset>
      <legend className="text-sm font-medium mb-3">
        {label}
        {required ? ' *' : ''}
        {maxSelections != null ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {value.length}/{maxSelections} selected
          </span>
        ) : null}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-describedby={groupHelpId}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          const orderIndex = selected ? value.indexOf(opt.value) : -1;
          const disabled = !selected && atCap;
          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-disabled={disabled}
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                'relative text-left rounded-lg border p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : disabled
                    ? 'border-input bg-background opacity-50 cursor-not-allowed'
                    : 'border-input bg-background hover:border-primary/40 hover:bg-accent/30',
              )}
            >
              {selected && orderIndex >= 0 ? (
                <span
                  aria-hidden
                  className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold"
                >
                  {orderIndex + 1}
                </span>
              ) : null}
              <div className="flex items-start gap-3">
                {opt.icon ? <span className="text-2xl leading-none">{opt.icon}</span> : null}
                <div>
                  <div className="font-semibold">{opt.label}</div>
                  {opt.description ? (
                    <div className={cn('text-sm mt-1', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      {opt.description}
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {helpText ? (
        <p id={groupHelpId} className="text-sm text-muted-foreground mt-3">
          {helpText}
        </p>
      ) : null}
    </fieldset>
  );
}
