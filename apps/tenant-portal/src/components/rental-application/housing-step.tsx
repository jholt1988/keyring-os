export interface HousingValues {
  currentAddress: string;
  landlordName: string;
  monthlyRent: string;
  reasonForLeaving: string;
}

interface HousingStepProps {
  value: HousingValues;
  onChange: (field: keyof HousingValues, value: string) => void;
}

export function HousingStep({ value, onChange }: HousingStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className="text-sm font-medium text-[#F8FAFC]">Current address</span>
        <input
          value={value.currentAddress}
          onChange={(event) => onChange('currentAddress', event.target.value)}
          placeholder="123 Example Street, Unit 4"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Landlord name</span>
        <input
          value={value.landlordName}
          onChange={(event) => onChange('landlordName', event.target.value)}
          placeholder="Jordan Smith"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Monthly rent</span>
        <input
          type="number"
          min="0"
          value={value.monthlyRent}
          onChange={(event) => onChange('monthlyRent', event.target.value)}
          placeholder="1850"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className="text-sm font-medium text-[#F8FAFC]">Reason for leaving</span>
        <textarea
          rows={4}
          value={value.reasonForLeaving}
          onChange={(event) => onChange('reasonForLeaving', event.target.value)}
          placeholder="Looking for more space and a shorter commute."
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
    </div>
  );
}
