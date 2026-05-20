import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
};

export default function LongText({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  required,
  rows = 4,
  maxLength,
  autoFocus,
}: Props) {
  const helpId = helpText ? `${id}-help` : undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <Textarea
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        autoFocus={autoFocus}
        aria-describedby={helpId}
      />
      {helpText ? (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      ) : null}
    </div>
  );
}
