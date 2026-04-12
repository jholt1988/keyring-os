'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowRightLeft } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { startMoveIn, startMoveOut } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function MoveOrchestrationPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<'move-in' | 'move-out' | null>(null);
  const [form, setForm] = useState({ leaseId: '', tenantId: '' });
  const mutation = useMutation({
    mutationFn: () => mode === 'move-in' ? startMoveIn(form) : startMoveOut(form),
    onSuccess: () => { toast(mode === 'move-in' ? 'Move-in started' : 'Move-out started'); setMode(null); },
    onError: () => toast('Failed to start move workflow', 'error'),
  });
  return (
    <>
      <WorkspaceShell title="Move Orchestration" subtitle="Move-in and move-out workflows" icon={ArrowRightLeft}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SectionCard title="Move-In" subtitle="Launch move-in wizard"><Button size="sm" onClick={() => setMode('move-in')}>Start Move-In</Button></SectionCard>
          <SectionCard title="Move-Out" subtitle="Launch move-out wizard"><Button size="sm" variant="outline" onClick={() => setMode('move-out')}>Start Move-Out</Button></SectionCard>
        </div>
      </WorkspaceShell>
      <Modal open={!!mode} onClose={() => setMode(null)} title={mode === 'move-in' ? 'Start Move-In' : 'Start Move-Out'} footer={<><Button variant="outline" size="sm" onClick={() => setMode(null)}>Cancel</Button><Button size="sm" onClick={() => mutation.mutate()}>Start</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Lease ID', 'leaseId'], ['Tenant ID', 'tenantId']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
