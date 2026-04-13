export interface OccupantsValues {
  coApplicantCount: string;
  dependents: string;
  pets: string;
  vehicles: string;
}

interface OccupantsStepProps {
  value: OccupantsValues;
  onChange: (field: keyof OccupantsValues, value: string) => void;
}

export function OccupantsStep({ value, onChange }: OccupantsStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Co-applicant count</span>
        <input
          type="number"
          min="0"
          value={value.coApplicantCount}
          onChange={(event) => onChange('coApplicantCount', event.target.value)}
          placeholder="0"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Dependents</span>
        <input
          type="number"
          min="0"
          value={value.dependents}
          onChange={(event) => onChange('dependents', event.target.value)}
          placeholder="0"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Pets</span>
        <input
          value={value.pets}
          onChange={(event) => onChange('pets', event.target.value)}
          placeholder="1 dog, 1 cat"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#F8FAFC]">Vehicles</span>
        <input
          value={value.vehicles}
          onChange={(event) => onChange('vehicles', event.target.value)}
          placeholder="2020 Honda Civic"
          className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
    </div>
  );
}
