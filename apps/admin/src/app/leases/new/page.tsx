'use client';

import { SectionCard } from '@/components/copilot/section-card';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createLease } from '@/lib/copilot-api';
import { useMutation } from '@tanstack/react-query';
import { FileText,RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewLeasePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    tenantId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
    noticePeriodDays: '30',
    moveInAt: '',
    autoRenew: false,
  });

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => createLease({
      tenantId: form.tenantId,
      unitId: form.unitId,
      startDate: form.startDate,
      endDate: form.endDate,
      rentAmount: parseFloat(form.rentAmount),
      depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
      noticePeriodDays: form.noticePeriodDays ? parseInt(form.noticePeriodDays) : undefined,
      moveInAt: form.moveInAt || undefined,
      autoRenew: form.autoRenew,
    }),
    onSuccess: () => {
      toast('Lease created');
      router.push(`/tenants/${form.tenantId}`);
    },
    onError: () => toast('Failed to create lease', 'error'),
  });

  const isValid = form.tenantId && form.unitId && form.startDate && form.endDate && form.rentAmount;

  return (
    <WorkspaceShell title="New Lease" subtitle="Create a lease agreement" icon={FileText}>
      <div className="mx-auto max-w-2xl space-y-6">
        <SectionCard title="Parties">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Tenant ID</label>
              <input value={form.tenantId} onChange={e => set('tenantId', e.target.value)}
                placeholder="UUID of the tenant"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Unit ID</label>
              <input value={form.unitId} onChange={e => set('unitId', e.target.value)}
                placeholder="UUID of the unit"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Term">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Move-In Date <span className="text-[#475569]">(optional)</span></label>
              <input type="date" value={form.moveInAt} onChange={e => set('moveInAt', e.target.value)}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Notice Period (days)</label>
              <input type="number" min="0" value={form.noticePeriodDays} onChange={e => set('noticePeriodDays', e.target.value)}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Financials">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Monthly Rent ($)</label>
              <input type="number" min="0" step="0.01" value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Security Deposit ($) <span className="text-[#475569]">(optional)</span></label>
              <input type="number" min="0" step="0.01" value={form.depositAmount} onChange={e => set('depositAmount', e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('autoRenew', !form.autoRenew)}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.autoRenew ? 'bg-[#3B82F6]' : 'bg-[#1E3350]'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.autoRenew ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <label className="text-sm text-[#94A3B8]">Auto-renew lease</label>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>Cancel</Button>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <FileText size={13} />} Create Lease
          </Button>
        </div>
      </div>
    </WorkspaceShell>
  );
}
