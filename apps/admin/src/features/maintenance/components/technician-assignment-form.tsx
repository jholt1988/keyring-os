'use client';

import { Button } from '@/components/ui/button';
import { User,Wrench,X } from 'lucide-react';
import { useState } from 'react';

export interface TechnicianAssignmentFormData {
  requestId: string;
  technicianId?: number;
}

interface TechnicianAssignmentFormProps {
  initialData?: TechnicianAssignmentFormData;
  technicianOptions?: { id: number; name: string }[];
  onSave: (data: TechnicianAssignmentFormData) => void;
  onCancel: () => void;
}

export function TechnicianAssignmentForm({ 
  initialData, 
  technicianOptions = [],
  onSave, 
  onCancel 
}: TechnicianAssignmentFormProps) {
  const [form, setForm] = useState<TechnicianAssignmentFormData>(initialData || {
    requestId: '',
    technicianId: undefined,
  });

  const handleChange = (field: keyof TechnicianAssignmentFormData, value: number | string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Assign Technician</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Technician</label>
        <div className="relative">
          <Wrench className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <select
            value={form.technicianId ?? ''}
            onChange={(e) => handleChange('technicianId', e.target.value ? Number(e.target.value) : undefined)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6]"
            required
          >
            <option value="">Select technician</option>
            {technicianOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <User size={14} />
          Assign Technician
        </Button>
      </div>
    </form>
  );
}