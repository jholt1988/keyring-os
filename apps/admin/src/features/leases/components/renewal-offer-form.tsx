'use client';

import { useState } from 'react';
import { DollarSign, Calendar, FileText, X, Save, Percent, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface RenewalOfferFormData {
  id?: string;
  proposedRent: number;
  proposedStart: string;
  proposedEnd: string;
  escalationPercent?: number;
  message?: string;
  expiresAt?: string;
}

interface RenewalOfferFormProps {
  initialData?: RenewalOfferFormData;
  onSave: (data: RenewalOfferFormData) => void;
  onCancel: () => void;
}

export function RenewalOfferForm({ initialData, onSave, onCancel }: RenewalOfferFormProps) {
  const [form, setForm] = useState<RenewalOfferFormData>(initialData || {
    proposedRent: 0,
    proposedStart: '',
    proposedEnd: '',
    escalationPercent: undefined,
    message: '',
    expiresAt: '',
  });

  const handleChange = (field: keyof RenewalOfferFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Create Lease Renewal Offer</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Proposed Rent</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              step="0.01"
              value={form.proposedRent}
              onChange={(e) => handleChange('proposedRent', Number(e.target.value))}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Escalation %</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="number"
              step="0.1"
              value={form.escalationPercent ?? ''}
              onChange={(e) => handleChange('escalationPercent', e.target.value ? Number(e.target.value) : undefined)}
              className="pl-10"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease Start</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.proposedStart}
              onChange={(e) => handleChange('proposedStart', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Lease End</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.proposedEnd}
              onChange={(e) => handleChange('proposedEnd', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Expires At</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="date"
              value={form.expiresAt || ''}
              onChange={(e) => handleChange('expiresAt', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Message</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <textarea
              value={form.message || ''}
              onChange={(e) => handleChange('message', e.target.value)}
              className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              placeholder="Additional message to tenant..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Create Offer
        </Button>
      </div>
    </form>
  );
}