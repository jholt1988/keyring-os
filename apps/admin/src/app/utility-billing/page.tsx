'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Gauge, Plus } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { allocateMasterBill, recordMasterBill } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function UtilityBillingPage() {
  const { toast } = useToast();
  const [bills, setBills] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ propertyId: '', period: '', amount: '', utilityType: '' });
  const recordM = useMutation({ mutationFn: () => recordMasterBill({ ...form, amount: Number(form.amount) || 0 }), onSuccess: (result) => { toast('Master bill recorded'); setBills((current) => [result, ...current]); setOpen(false); } });
  const allocM = useMutation({ mutationFn: (id: string) => allocateMasterBill(id), onSuccess: () => toast('Master bill allocated') });

  return (
    <>
      <WorkspaceShell title="Utility Billing" subtitle="Record and allocate master utility bills" icon={Gauge} actions={<Button size="sm" onClick={() => setOpen(true)}><Plus size={12} /> Record Bill</Button>}>
        <SectionCard title="Master Bills" subtitle="Property-period utility bills">
          <div className="space-y-3">
            {bills.map((bill: any) => <div key={bill.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{bill.propertyId} · {bill.utilityType}</p><p className="text-xs text-[#94A3B8]">{bill.period} · ${bill.amount ?? 0}</p><div className="mt-3"><Button size="sm" variant="outline" onClick={() => allocM.mutate(bill.id)}>Allocate Bill</Button></div></div>)}
            {bills.length === 0 && <p className="text-sm text-[#94A3B8]">No master bills recorded in this session yet.</p>}
          </div>
        </SectionCard>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Record Master Utility Bill" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => recordM.mutate()}>Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Property ID', 'propertyId'], ['Period', 'period'], ['Amount', 'amount'], ['Utility Type', 'utilityType']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
