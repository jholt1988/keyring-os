'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle,FileText,X } from 'lucide-react';
import { useState } from 'react';

export interface MaintenanceCompleteFormData {
  note?: string;
}

interface MaintenanceCompleteFormProps {
  onSave: (data: MaintenanceCompleteFormData) => void;
  onCancel: () => void;
}

export function MaintenanceCompleteForm({ onSave, onCancel }: MaintenanceCompleteFormProps) {
  const [form, setForm] = useState<MaintenanceCompleteFormData>({
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Confirm Maintenance Complete</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 p-4 mb-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-[#10B981] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">Complete this request</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Marking this maintenance request as complete will notify the tenant.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Completion Note</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
          <textarea
            value={form.note || ''}
            onChange={(e) => setForm({ note: e.target.value })}
            className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            placeholder="Optional completion notes..."
            maxLength={500}
          />
        </div>
        <p className="text-xs text-[#64748B]">{form.note?.length || 0}/500 characters</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <CheckCircle size={14} />
          Mark Complete
        </Button>
      </div>
    </form>
  );
}