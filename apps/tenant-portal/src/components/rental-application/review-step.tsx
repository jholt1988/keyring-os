import { cn } from '@/lib/utils';

export interface ReviewValues {
  consentAccepted: boolean;
}

interface ReviewStepProps {
  sections: Array<{ label: string; value: string }>;
  value: ReviewValues;
  onConsentChange: (checked: boolean) => void;
}

export function ReviewStep({ sections, value, onConsentChange }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {sections.map((section) => (
          <div key={section.label} className="rounded-2xl border border-[#1E3350] bg-[#0F1B31] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#38BDF8]">{section.label}</p>
            <p className="mt-2 text-sm text-[#D7E4F5]">{section.value}</p>
          </div>
        ))}
      </div>

      <label className={cn('flex items-start gap-3 rounded-2xl border p-4', value.consentAccepted ? 'border-[#3B82F6] bg-[#3B82F6]/10' : 'border-[#1E3350] bg-[#0F1B31]')}>
        <input
          type="checkbox"
          checked={value.consentAccepted}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#1E3350] bg-[#13233C] text-[#3B82F6]"
        />
        <span className="text-sm text-[#D7E4F5]">
          I confirm that the information above is accurate and I consent to application review, verification, and applicable screening.
        </span>
      </label>
    </div>
  );
}
