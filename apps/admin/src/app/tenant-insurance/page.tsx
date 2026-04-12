'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Shield, Plus } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { fetchTenantInsurance, recordTenantInsurance } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function TenantInsurancePage() {
  const { toast } = useToast();
  const [leaseId, setLeaseId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ provider: '', policyNumber: '', coverageAmount: '', expiry: '' });
  const { data, refetch } = useQuery({ queryKey: ['tenant-insurance', leaseId], queryFn: () => fetchTenantInsurance(leaseId), enabled: !!leaseId });
  const policies = Array.isArray(data) ? data : [];
  const mutation = useMutation({ mutationFn: () => recordTenantInsurance(leaseId, { ...form, coverageAmount: Number(form.coverageAmount) || 0 }), onSuccess: () => { toast('Policy recorded'); setOpen(false); refetch(); } });

  return (
    <>
      <WorkspaceShell title="Tenant Insurance" subtitle="Track insurance compliance by lease" icon={Shield} actions={<Button size="sm" onClick={() => setOpen(true)} disabled={!leaseId}><Plus size={12} /> Record Policy</Button>}>
        <SectionCard title="Lease Lookup" subtitle="Enter a lease ID to view policies">
          <input value={leaseId} onChange={(e) => setLeaseId(e.target.value)} placeholder="Lease ID" className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
          <div className="mt-4 space-y-3">{policies.map((policy: any) => <div key={policy.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{policy.provider}</p><p className="text-xs text-[#94A3B8]">{policy.policyNumber} · ${policy.coverageAmount ?? 0} · {policy.expiry ?? policy.expiryDate}</p><p className="mt-1 text-xs text-[#CBD5E1]">{String(policy.expiry ?? policy.expiryDate) < new Date().toISOString() ? 'Expired' : 'Insured'}</p></div>)}</div>
        </SectionCard>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Record Insurance Policy" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => mutation.mutate()}>Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Provider', 'provider'], ['Policy Number', 'policyNumber'], ['Coverage Amount', 'coverageAmount'], ['Expiry', 'expiry']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
