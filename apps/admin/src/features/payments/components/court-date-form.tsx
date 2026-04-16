'use client';

import { useState } from 'react';
import { Calendar, MapPin, FileText, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface CourtDateFormData {
  leaseId: string;
  courtDate: string;
  docketNumber?: string;
  courtroom?: string;
  notes?: string;
}

interface CourtDateFormProps {
  onSave: (data: CourtDateFormData) => void;
  onCancel: () => void;
}

export function CourtDateForm({ onSave, onCancel }: CourtDateFormProps) {
  const [form, setForm] = useState<CourtDateFormData>({
    leaseId: '',
    courtDate: '',
    docketNumber: '',
    courtroom: '',
    notes: '',
  });

  const handleChange = (field: keyof CourtDateFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Record Court Date</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Court Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="datetime-local" value={form.courtDate} onChange={(e) => handleChange('courtDate', e.target.value)} className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Docket Number</label>
          <Input value={form.docketNumber || ''} onChange={(e) => handleChange('docketNumber', e.target.value)} placeholder="e.g., 2024-CV-12345" />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Courtroom</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input value={form.courtroom || ''} onChange={(e) => handleChange('courtroom', e.target.value)} placeholder="e.g., Courtroom 3A" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Notes</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea value={form.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" placeholder="Additional notes..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Save size={14} /> Record Court Date</Button>
      </div>
    </form>
  );
}