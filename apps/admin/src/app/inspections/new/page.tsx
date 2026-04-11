'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { createInspection } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

const TYPES = ['MOVE_IN', 'MOVE_OUT', 'ROUTINE', 'ANNUAL', 'DRIVE_BY'];

export default function NewInspectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({
    type: 'ROUTINE',
    propertyId: '',
    unitId: '',
    scheduledDate: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: () => createInspection({
      type: form.type,
      propertyId: form.propertyId || undefined,
      unitId: form.unitId || undefined,
      scheduledAt: form.scheduledDate || undefined,
      notes: form.notes || undefined,
    }),
    onSuccess: (insp: any) => {
      toast('Inspection created');
      router.push(`/inspections/${insp.id}`);
    },
    onError: () => toast('Failed to create inspection', 'error'),
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <WorkspaceShell title="New Inspection" subtitle="Schedule a property inspection" icon={ClipboardList}>
      <SectionCard title="Inspection Details">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Property ID</label>
            <input value={form.propertyId} onChange={e => set('propertyId', e.target.value)}
              placeholder="UUID of the property"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Unit ID <span className="text-[#475569]">(optional)</span></label>
            <input value={form.unitId} onChange={e => set('unitId', e.target.value)}
              placeholder="UUID of the unit"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Scheduled Date <span className="text-[#475569]">(optional)</span></label>
            <input type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6] [color-scheme:dark]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Notes <span className="text-[#475569]">(optional)</span></label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Any notes for the inspector…"
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>Cancel</Button>
            <Button size="sm" onClick={() => mutation.mutate()} disabled={!form.propertyId || mutation.isPending}>
              {mutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <ClipboardList size={13} />} Create Inspection
            </Button>
          </div>
        </div>
      </SectionCard>
    </WorkspaceShell>
  );
}
