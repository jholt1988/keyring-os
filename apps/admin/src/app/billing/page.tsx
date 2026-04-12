'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createBillingSchedule, disableAutopay, enableAutopay, fetchAutopay, fetchBillingSchedules, fetchFeeScheduleVersions } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function BillingPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ leaseId: '', amount: '', dueDate: '' });
  const { data: schedulesData } = useQuery({ queryKey: ['billing-schedules'], queryFn: fetchBillingSchedules });
  const { data: autopayData } = useQuery({ queryKey: ['billing-autopay'], queryFn: fetchAutopay });
  const { data: feeVersions } = useQuery({ queryKey: ['billing-fee-versions'], queryFn: fetchFeeScheduleVersions });
  const schedules = Array.isArray(schedulesData) ? schedulesData : [];
  const autopay = Array.isArray(autopayData) ? autopayData : [];
  const createM = useMutation({ mutationFn: () => createBillingSchedule({ ...form, amount: Number(form.amount) || 0 }), onSuccess: () => { toast('Billing schedule created'); setOpen(false); qc.invalidateQueries({ queryKey: ['billing-schedules'] }); } });
  const enableM = useMutation({ mutationFn: (leaseId: string) => enableAutopay({ leaseId }), onSuccess: () => { toast('Autopay enabled'); qc.invalidateQueries({ queryKey: ['billing-autopay'] }); } });
  const disableM = useMutation({ mutationFn: (leaseId: string) => disableAutopay(leaseId), onSuccess: () => { toast('Autopay disabled'); qc.invalidateQueries({ queryKey: ['billing-autopay'] }); } });

  return (
    <>
      <WorkspaceShell title="Billing" subtitle="Schedules, autopay, and fee versions" icon={CreditCard} actions={<Button size="sm" onClick={() => setOpen(true)}><Plus size={12} /> Billing Schedule</Button>}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SectionCard title="Schedules" subtitle="Billing schedules per lease" className="lg:col-span-2">
            <div className="space-y-3">{schedules.map((row: any) => <div key={row.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{row.leaseId}</p><p className="text-xs text-[#94A3B8]">${row.amount ?? 0} due {row.dueDate ?? row.nextRunAt ?? 'n/a'}</p></div>)}</div>
          </SectionCard>
          <SectionCard title="Autopay" subtitle="Enable or disable autopay">
            <div className="space-y-3">{autopay.map((row: any) => <div key={row.leaseId ?? row.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{row.leaseId ?? row.id}</p><p className="text-xs text-[#94A3B8]">{row.enabled ? 'Enabled' : 'Disabled'}</p><div className="mt-3"><Button size="sm" variant="outline" onClick={() => row.enabled ? disableM.mutate(row.leaseId ?? row.id) : enableM.mutate(row.leaseId ?? row.id)}>{row.enabled ? 'Disable' : 'Enable'}</Button></div></div>)}</div>
          </SectionCard>
          <SectionCard title="Fee Schedule Versions" subtitle="Version history"><div className="space-y-2">{(Array.isArray(feeVersions) ? feeVersions : []).map((row: any, idx: number) => <div key={row.id ?? idx} className="rounded-[10px] bg-[#0F1B31] p-2"><p className="text-xs text-[#F8FAFC]">{row.version ?? row.id ?? `Version ${idx + 1}`}</p></div>)}</div></SectionCard>
        </div>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Billing Schedule" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => createM.mutate()}>Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Lease ID', 'leaseId'], ['Amount', 'amount'], ['Due Date', 'dueDate']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
