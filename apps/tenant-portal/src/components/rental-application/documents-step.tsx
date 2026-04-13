export interface DocumentsValues {
  idUpload: string;
  incomeProofUpload: string;
}

interface DocumentsStepProps {
  value: DocumentsValues;
  onChange: (field: keyof DocumentsValues, value: string) => void;
}

export function DocumentsStep({ value, onChange }: DocumentsStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-[#1E3350] bg-[#0F1B31] p-4">
        <span className="text-sm font-medium text-[#F8FAFC]">Government ID upload</span>
        <span className="text-xs text-[#94A3B8]">Placeholder for secure document upload.</span>
        <input
          value={value.idUpload}
          onChange={(event) => onChange('idUpload', event.target.value)}
          placeholder="drivers-license.pdf"
          className="mt-2 rounded-lg border border-[#1E3350] bg-[#13233C] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
      <label className="flex flex-col gap-1.5 rounded-2xl border border-dashed border-[#1E3350] bg-[#0F1B31] p-4">
        <span className="text-sm font-medium text-[#F8FAFC]">Income proof upload</span>
        <span className="text-xs text-[#94A3B8]">Placeholder for pay stubs or bank statement upload.</span>
        <input
          value={value.incomeProofUpload}
          onChange={(event) => onChange('incomeProofUpload', event.target.value)}
          placeholder="paystubs-march.pdf"
          className="mt-2 rounded-lg border border-[#1E3350] bg-[#13233C] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#3B82F6]"
        />
      </label>
    </div>
  );
}
