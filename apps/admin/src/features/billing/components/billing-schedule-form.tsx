'use client';

import { useState } from 'react';
import { DollarSign, Calendar, FileText, Activity, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface BillingScheduleFormData {
  leaseId: string;
  amount: number;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  dayOfMonth?: number;
  dayOfWeek?: number;
  nextRun?: string;
  lateFeeAmount?: number;
  lateFeeAfterDays?: number;
  active?: boolean;
}

interface BillingScheduleFormProps {
  onSave: (data: BillingScheduleFormData) => void;
  onCancel: () => void;
}

export function BillingScheduleForm({ onSave, onCancel }: BillingScheduleFormProps) {
  const [form, setForm] = useState<BillingScheduleFormData>({
    leaseId: '',
    amount: 0,
    description: '',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    active: true,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Billing Schedule</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))} className="pl-10" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Frequency</label>
          <select value={form.frequency} onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value as BillingScheduleFormData['frequency'] }))} className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY">Bi-weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        {form.frequency === 'MONTHLY' && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Day of Month (1-28)</label>
            <Input type="number" min={1} max={28} value={form.dayOfMonth || 1} onChange={(e) => setForm((prev) => ({ ...prev, dayOfMonth: Number(e.target.value) }))} />
          </div>
        )}

        {(form.frequency === 'WEEKLY' || form.frequency === 'BIWEEKLY') && (
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Day of Week (0=Sun)</label>
            <Input type="number" min={0} max={6} value={form.dayOfWeek || 0} onChange={(e) => setForm((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))} />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Next Run</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="date" value={form.nextRun || ''} onChange={(e) => setForm((prev) => ({ ...prev, nextRun: e.target.value }))} className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Late Fee Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input type="number" value={form.lateFeeAmount || ''} onChange={(e) => setForm((prev) => ({ ...prev, lateFeeAmount: Number(e.target.value) }))} placeholder="Optional" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Late Fee After Days</label>
          <Input type="number" value={form.lateFeeAfterDays || ''} onChange={(e) => setForm((prev) => ({ ...prev, lateFeeAfterDays: Number(e.target.value) }))} placeholder="e.g., 5" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
            <Input value={form.description || ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Optional description" className="pl-10" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]" />
            <span className="text-sm text-[#F8FAFC]">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit"><Activity size={14} /> Save Schedule</Button>
      </div>
    </form>
  );
}