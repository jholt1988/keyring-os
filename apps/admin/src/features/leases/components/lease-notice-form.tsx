'use client';

import { useState } from 'react';
import { FileText, Mail, Calendar, X, Save, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface LeaseNoticeFormData {
  id?: string;
  type: 'LEASE_START' | 'LEASE_END' | 'LEASE_RENEWAL' | 'NON_RENEWAL' | 'EARLY_TERMINATION' | 'IMMEDIATE';
  deliveryMethod: 'EMAIL' | 'MAIL' | 'SMS' | 'IN_PERSON';
  message?: string;
  acknowledgedAt?: string;
}

interface LeaseNoticeFormProps {
  initialData?: LeaseNoticeFormData;
  onSave: (data: LeaseNoticeFormData) => void;
  onCancel: () => void;
}

export function LeaseNoticeForm({ initialData, onSave, onCancel }: LeaseNoticeFormProps) {
  const [form, setForm] = useState<LeaseNoticeFormData>(initialData || {
    type: 'LEASE_END',
    deliveryMethod: 'EMAIL',
    message: '',
    acknowledgedAt: '',
  });

  const handleChange = (field: keyof LeaseNoticeFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Record Lease Notice</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Notice Type</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
              required
            >
              <option value="LEASE_START">Lease Start</option>
              <option value="LEASE_END">Lease End</option>
              <option value="LEASE_RENEWAL">Lease Renewal</option>
              <option value="NON_RENEWAL">Non-Renewal</option>
              <option value="EARLY_TERMINATION">Early Termination</option>
              <option value="IMMEDIATE">Immediate</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Delivery Method</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <select
              value={form.deliveryMethod}
              onChange={(e) => handleChange('deliveryMethod', e.target.value)}
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] pl-10 pr-3 py-2 text-sm text-[#F8FAFC]"
            >
              <option value="EMAIL">Email</option>
              <option value="MAIL">Mail</option>
              <option value="SMS">SMS</option>
              <option value="IN_PERSON">In Person</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Acknowledged At</label>
          <div className="relative">
            <CheckCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="datetime-local"
              value={form.acknowledgedAt || ''}
              onChange={(e) => handleChange('acknowledgedAt', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Message</label>
          <textarea
            value={form.message || ''}
            onChange={(e) => handleChange('message', e.target.value)}
            className="flex min-h-[100px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            placeholder="Notice details..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save size={14} />
          Record Notice
        </Button>
      </div>
    </form>
  );
}