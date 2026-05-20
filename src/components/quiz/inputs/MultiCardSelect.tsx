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
};

export default function MultiCardSelect({ id, label, value, onChange, options, helpText, required }: Props) {
  const groupHelpId = helpText ? `${id}-help` : undefined;
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-3">
        {label}
        {required ? ' *' : ''}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-describedby={groupHelpId}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              type="button"
              role="checkbox"
              aria-checked={selected}
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                'text-left rounded-lg border p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : 'border-input bg-background hover:border-primary/40 hover:bg-accent/30',
              )}
            >
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
