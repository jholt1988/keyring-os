export interface EmploymentValues {
  employer: string;
  position: string;
  monthlyIncome: string;
  employmentStartDate: string;
}

interface EmploymentStepProps {
  value: EmploymentValues;
  onChange: (field: keyof EmploymentValues, value: string) => void;
}

export function EmploymentStep({ value, onChange }: EmploymentStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Employer</span>
        <input
          value={value.employer}
          onChange={(event) => onChange('employer', event.target.value)}
          placeholder="Analytical Engines LLC"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Position</span>
        <input
          value={value.position}
          onChange={(event) => onChange('position', event.target.value)}
          placeholder="Product engineer"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Monthly income</span>
        <input
          type="number"
          min="0"
          value={value.monthlyIncome}
          onChange={(event) => onChange('monthlyIncome', event.target.value)}
          placeholder="7200"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Employment start date</span>
        <input
          type="date"
          value={value.employmentStartDate}
          onChange={(event) => onChange('employmentStartDate', event.target.value)}
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
    </div>
  );
}
