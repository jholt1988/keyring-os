'use client';

import { useState } from 'react';
import { CheckCircle, FileText, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ResolveDelinquencyFormData {
  leaseId: string;
  resolutionMode: 'PAID' | 'PAYMENT_PLAN';
  reason?: string;
}

interface ResolveDelinquencyFormProps {
  onSave: (data: ResolveDelinquencyFormData) => void;
  onCancel: () => void;
}

export function ResolveDelinquencyForm({ onSave, onCancel }: ResolveDelinquencyFormProps) {
  const [form, setForm] = useState<ResolveDelinquencyFormData>({
    leaseId: '',
    resolutionMode: 'PAID',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Resolve Delinquency</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Resolution Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, resolutionMode: 'PAID' }))}
            className={`rounded-lg border p-3 text-sm transition-all ${
              form.resolutionMode === 'PAID'
                ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]'
                : 'border-white/10 bg-[#0F1B31] text-[#94A3B8]'
            }`}
          >
            Paid in Full
          </button>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, resolutionMode: 'PAYMENT_PLAN' }))}
            className={`rounded-lg border p-3 text-sm transition-all ${
              form.resolutionMode === 'PAYMENT_PLAN'
                ? 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]'
                : 'border-white/10 bg-[#0F1B31] text-[#94A3B8]'
            }`}
          >
            Payment Plan
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Reason</label>
        <textarea
          value={form.reason || ''}
          onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
          className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
          placeholder="Optional reason..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">
          <CheckCircle size={14} />
          Resolve
        </Button>
      </div>
    </form>
  );
}