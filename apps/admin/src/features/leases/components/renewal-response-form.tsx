'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, FileText, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RenewalResponseFormData {
  decision: 'ACCEPTED' | 'DECLINED';
  message?: string;
}

interface RenewalResponseFormProps {
  onSave: (data: RenewalResponseFormData) => void;
  onCancel: () => void;
}

export function RenewalResponseForm({ onSave, onCancel }: RenewalResponseFormProps) {
  const [form, setForm] = useState<RenewalResponseFormData>({
    decision: 'ACCEPTED',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const isAccepted = form.decision === 'ACCEPTED';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Renewal Decision</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-3">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Decision</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, decision: 'ACCEPTED' }))}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
              isAccepted
                ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]'
                : 'border-white/10 bg-[#0F1B31] text-[#94A3B8] hover:border-white/20'
            }`}
          >
            <CheckCircle className="h-8 w-8" />
            <span className="text-sm font-medium">Accept</span>
          </button>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, decision: 'DECLINED' }))}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
              !isAccepted
                ? 'border-[#F43F5E]/30 bg-[#F43F5E]/10 text-[#F43F5E]'
                : 'border-white/10 bg-[#0F1B31] text-[#94A3B8] hover:border-white/20'
            }`}
          >
            <XCircle className="h-8 w-8" />
            <span className="text-sm font-medium">Decline</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Response Message</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
          <textarea
            value={form.message || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
            className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            placeholder="Optional message..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={isAccepted ? 'default' : 'destructive'}>
          <Save size={14} />
          Submit Decision
        </Button>
      </div>
    </form>
  );
}