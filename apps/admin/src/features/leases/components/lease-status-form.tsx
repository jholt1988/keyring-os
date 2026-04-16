'use client';

import { useState } from 'react';
import { Calendar, FileText, RefreshCw, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface LeaseStatusFormData {
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'MONTH_TO_MONTH' | 'EXPIRED' | 'TERMINATED';
  moveInAt?: string;
  moveOutAt?: string;
  noticePeriodDays?: number;
  renewalDueAt?: string;
  renewalAcceptedAt?: string;
  terminationEffectiveAt?: string;
  terminationRequestedBy?: 'TENANT' | 'LANDLORD' | 'MUTUAL';
  terminationReason?: string;
  rentEscalationPercent?: number;
  rentEscalationEffectiveAt?: string;
  currentBalance?: number;
  autoRenew?: boolean;
}

interface LeaseStatusFormProps {
  initialData?: LeaseStatusFormData;
  onSave: (data: LeaseStatusFormData) => void;
  onCancel: () => void;
}

export function LeaseStatusForm({ initialData, onSave, onCancel }: LeaseStatusFormProps) {
  const [form, setForm] = useState<LeaseStatusFormData>(initialData || {
    status: 'PENDING',
    autoRenew: false,
  });

  const handleChange = (field: keyof LeaseStatusFormData, value: string | number | boolean | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isTermination = form.status === 'TERMINATED';

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Update Lease Status</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Status</label>
          <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="MONTH_TO_MONTH">Month-to-Month</option>
            <option value="EXPIRED">Expired</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Auto Renew</label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <input type="checkbox" checked={form.autoRenew ?? false} onChange={(e) => handleChange('autoRenew', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]" />
            <span className="text-sm text-[#F8FAFC]">Enable auto-renewal</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Move In Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="date" value={form.moveInAt || ''} onChange={(e) => handleChange('moveInAt', e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Move Out Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="date" value={form.moveOutAt || ''} onChange={(e) => handleChange('moveOutAt', e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Notice Period (days)</label>
          <Input type="number" value={form.noticePeriodDays || ''} onChange={(e) => handleChange('noticePeriodDays', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 30" />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Current Balance</label>
          <Input type="number" value={form.currentBalance || ''} onChange={(e) => handleChange('currentBalance', e.target.value ? Number(e.target.value) : 0)} placeholder="0.00" />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Renewal Due Date</label>
          <Input type="date" value={form.renewalDueAt || ''} onChange={(e) => handleChange('renewalDueAt', e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Rent Escalation %</label>
          <Input type="number" step="0.01" value={form.rentEscalationPercent || ''} onChange={(e) => handleChange('rentEscalationPercent', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 3.5%" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Rent Escalation Effective</label>
          <Input type="date" value={form.rentEscalationEffectiveAt || ''} onChange={(e) => handleChange('rentEscalationEffectiveAt', e.target.value)} />
        </div>

        {isTermination && (
          <>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Termination Requested By</label>
              <select value={form.terminationRequestedBy || ''} onChange={(e) => handleChange('terminationRequestedBy', e.target.value)} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
                <option value="">Select party</option>
                <option value="TENANT">Tenant</option>
                <option value="LANDLORD">Landlord</option>
                <option value="MUTUAL">Mutual</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Effective Date</label>
              <Input type="date" value={form.terminationEffectiveAt || ''} onChange={(e) => handleChange('terminationEffectiveAt', e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Termination Reason</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
                <textarea value={form.terminationReason || ''} onChange={(e) => handleChange('terminationReason', e.target.value)} className="flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 pl-10 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" placeholder="Reason for termination..." maxLength={500} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><RefreshCw size={14} /> Update Status</Button>
      </div>
    </form>
  );
}