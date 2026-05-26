import { cn } from '@/lib/utils';
import type { Option } from '../types';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  helpText?: string;
  required?: boolean;
};

export default function Segmented({ id, label, value, onChange, options, helpText, required }: Props) {
  const helpId = helpText ? `${id}-help` : undefined;
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-3">
        {label}
        {required ? ' *' : ''}
      </legend>
      <div
        className="inline-flex flex-wrap rounded-full border bg-background p-1 gap-1"
        role="radiogroup"
        aria-describedby={helpId}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                selected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent/60',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {helpText ? (
        <p id={helpId} className="text-sm text-muted-foreground mt-2">
          {helpText}
        </p>
      ) : null}
    </fieldset>
  );
}
