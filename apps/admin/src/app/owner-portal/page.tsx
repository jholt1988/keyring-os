'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createOwnerDraw, fetchOwnerDraws } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function OwnerPortalPage() {
  const { toast } = useToast();
  const [statementId, setStatementId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', bankAccount: '' });
  const { data, refetch } = useQuery({ queryKey: ['owner-draws', statementId], queryFn: () => fetchOwnerDraws(statementId), enabled: !!statementId });
  const draws = Array.isArray(data) ? data : [];
  const mutation = useMutation({ mutationFn: () => createOwnerDraw(statementId, { ...form, amount: Number(form.amount) || 0 }), onSuccess: () => { toast('Owner draw initiated'); setOpen(false); refetch(); } });
  return (
    <>
      <WorkspaceShell title="Owner Portal" subtitle="Owner draws by statement" icon={Building2} actions={<Button size="sm" onClick={() => setOpen(true)} disabled={!statementId}><Plus size={12} /> Initiate Draw</Button>}>
        <SectionCard title="Statement Lookup" subtitle="Load draws for an owner statement">
          <input value={statementId} onChange={(e) => setStatementId(e.target.value)} placeholder="Statement ID" className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
          <div className="mt-4 space-y-3">{draws.map((draw: any) => <div key={draw.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">${draw.amount ?? 0}</p><p className="text-xs text-[#94A3B8]">{draw.status ?? 'Pending'} · {draw.bankAccount ?? 'Bank account'}</p></div>)}</div>
        </SectionCard>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Initiate Owner Draw" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => mutation.mutate()}>Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Amount', 'amount'], ['Bank Account', 'bankAccount']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
