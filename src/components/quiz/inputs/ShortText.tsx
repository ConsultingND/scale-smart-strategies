import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
};

export default function ShortText({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  required,
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
      <Input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
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
