import { cn } from '@/lib/utils';

export interface IdentityValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

interface IdentityStepProps {
  value: IdentityValues;
  onChange: (field: keyof IdentityValues, value: string) => void;
}

const FIELDS: Array<{ key: keyof IdentityValues; label: string; type?: string; placeholder: string }> = [
  { key: 'firstName', label: 'First name', placeholder: 'Ada' },
  { key: 'lastName', label: 'Last name', placeholder: 'Lovelace' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date', placeholder: '' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'ada@example.com' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '(555) 123-4567' },
];

export function IdentityStep({ value, onChange }: IdentityStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FIELDS.map((field) => (
        <label key={field.key} className={cn('flex flex-col gap-1.5', field.key === 'email' || field.key === 'phone' ? 'md:col-span-2' : '')}>
          <span className="text-sm font-medium text-[#F8FAFC]">{field.label}</span>
          <input
            type={field.type ?? 'text'}
            value={value[field.key]}
            onChange={(event) => onChange(field.key, event.target.value)}
            placeholder={field.placeholder}
            className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
          />
        </label>
      ))}
    </div>
  );
}
