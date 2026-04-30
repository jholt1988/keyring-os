'use client';

import { useState } from 'react';
import { RotateCcw, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ReversePaymentFormData {
  reason: string;
}

interface ReversePaymentFormProps {
  onSave: (data: ReversePaymentFormData) => void;
  onCancel: () => void;
}

export function ReversePaymentForm({ onSave, onCancel }: ReversePaymentFormProps) {
  const [form, setForm] = useState<ReversePaymentFormData>({ reason: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Reverse Manual Payment</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-4">
        <p className="text-sm text-[#F59E0B]">This will reverse the payment. The amount will be re-added to the tenant&apos;s balance.</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Reason</label>
        <textarea
          value={form.reason}
          onChange={(e) => setForm({ reason: e.target.value })}
          className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
          placeholder="Enter reason for reversal (min 2 characters)..."
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={form.reason.length < 2}>
          <RotateCcw size={14} /> Reverse Payment
        </Button>
      </div>
    </form>
  );
}