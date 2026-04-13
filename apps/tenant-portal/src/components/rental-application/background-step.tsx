export interface BackgroundValues {
  evictionHistory: string;
  bankruptcyDisclosure: string;
  criminalDisclosureAcknowledgment: string;
}

interface BackgroundStepProps {
  value: BackgroundValues;
  onChange: (field: keyof BackgroundValues, value: string) => void;
}

export function BackgroundStep({ value, onChange }: BackgroundStepProps) {
  return (
    <div className="grid gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Eviction history</span>
        <select
          value={value.evictionHistory}
          onChange={(event) => onChange('evictionHistory', event.target.value)}
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors focus:border-[#3B82F6]"
        >
          <option value="">Select one</option>
          <option value="none">No prior evictions</option>
          <option value="disclosed">Yes, disclosed</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Bankruptcy disclosure</span>
        <select
          value={value.bankruptcyDisclosure}
          onChange={(event) => onChange('bankruptcyDisclosure', event.target.value)}
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors focus:border-[#3B82F6]"
        >
          <option value="">Select one</option>
          <option value="none">None</option>
          <option value="disclosed">Yes, disclosed</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Criminal disclosure acknowledgment</span>
        <textarea
          rows={4}
          value={value.criminalDisclosureAcknowledgment}
          onChange={(event) => onChange('criminalDisclosureAcknowledgment', event.target.value)}
          placeholder="Provide any legally required disclosures for this jurisdiction."
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
    </div>
  );
}
