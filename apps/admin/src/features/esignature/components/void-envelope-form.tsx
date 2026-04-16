'use client';

import { useState } from 'react';
import { XCircle, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface VoidEnvelopeFormData {
  reason?: string;
}

interface VoidEnvelopeFormProps {
  onSave: (data: VoidEnvelopeFormData) => void;
  onCancel: () => void;
}

export function VoidEnvelopeForm({ onSave, onCancel }: VoidEnvelopeFormProps) {
  const [form, setForm] = useState<VoidEnvelopeFormData>({ reason: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Void Envelope</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="rounded-lg border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-4">
        <p className="text-sm text-[#F43F5E]">Warning: This will void the envelope. All pending signatures will be cancelled.</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Reason</label>
        <textarea value={form.reason || ''} onChange={(e) => setForm({ reason: e.target.value })} className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" placeholder="Optional reason for voiding..." />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="destructive"><XCircle size={14} /> Void Envelope</Button>
      </div>
    </form>
  );
}