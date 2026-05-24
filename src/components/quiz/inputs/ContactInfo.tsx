import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail } from 'lucide-react';
import type { ContactInfoValue } from '../types';

type Props = {
  id: string;
  value: ContactInfoValue;
  onChange: (value: ContactInfoValue) => void;
};

export default function ContactInfo({ id, value, onChange }: Props) {
  const update = <K extends keyof ContactInfoValue>(key: K, v: ContactInfoValue[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-primary/5 p-4 flex gap-3 items-start">
        <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-foreground mb-1">Get your scorecard by email</p>
          <p className="text-muted-foreground">
            Subscribe to receive your personalized scorecard and recommendations. We&apos;ll send it to your inbox and
            walk through it on a call if you want.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-first`}>First Name *</Label>
          <Input
            id={`${id}-first`}
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={value.firstName}
            onChange={(e) => update('firstName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-last`}>Last Name *</Label>
          <Input
            id={`${id}-last`}
            name="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={value.lastName}
            onChange={(e) => update('lastName', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-email`}>Email *</Label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={value.email}
          onChange={(e) => update('email', e.target.value)}
        />
      </div>

      {/* Honeypot — hidden from real users, visible to bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
        <label htmlFor={`${id}-website-confirm`}>Leave this field empty</label>
        <input
          id={`${id}-website-confirm`}
          name="website_confirm"
          tabIndex={-1}
          autoComplete="off"
          value={value.honeypot}
          onChange={(e) => update('honeypot', e.target.value)}
        />
      </div>

      <div className="flex items-start gap-3 text-sm">
        <Checkbox
          id={`${id}-consent`}
          checked={value.consent}
          onCheckedChange={(checked) => update('consent', checked === true)}
          required
          className="mt-0.5"
        />
        <Label htmlFor={`${id}-consent`} className="font-normal leading-relaxed">
          I agree to receive my results and follow-up emails from ND Scale Smart. Unsubscribe anytime.
        </Label>
      </div>
    </div>
  );
}
