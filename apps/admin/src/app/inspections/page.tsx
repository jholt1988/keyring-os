'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, ChevronRight, CheckCircle2, Play, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { fetchInspections, completeInspection, startInspection } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

const TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In', MOVE_OUT: 'Move-Out', ROUTINE: 'Routine', ANNUAL: 'Annual', DRIVE_BY: 'Drive-By',
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'text-[#3B82F6] bg-[#3B82F6]/10',
  IN_PROGRESS: 'text-[#F59E0B] bg-[#F59E0B]/10',
  COMPLETED: 'text-[#10B981] bg-[#10B981]/10',
  CANCELLED: 'text-[#94A3B8] bg-[#94A3B8]/10',
};

export default function InspectionsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => fetchInspections(),
  });

  const startMutation = useMutation({
    mutationFn: (id: number) => startInspection(id),
    onSuccess: () => { toast('Inspection started'); qc.invalidateQueries({ queryKey: ['inspections'] }); },
    onError: () => toast('Failed to start inspection', 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => completeInspection(id),
    onSuccess: () => { toast('Inspection completed'); qc.invalidateQueries({ queryKey: ['inspections'] }); },
    onError: () => toast('Failed to complete inspection', 'error'),
  });

  const upcoming = (inspections as any[]).filter(i => ['SCHEDULED','IN_PROGRESS'].includes(i.status?.toUpperCase()));
  const past = (inspections as any[]).filter(i => !['SCHEDULED','IN_PROGRESS'].includes(i.status?.toUpperCase()));

  return (
    <WorkspaceShell title="Inspections" subtitle="Property Condition Management" icon={ClipboardList}
      actions={<Link href="/inspections/new"><Button size="sm"><Plus size={13} /> New Inspection</Button></Link>}
    >
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}</div>
      ) : (
        <div className="space-y-6">
          <SectionCard title={`Upcoming (${upcoming.length})`} subtitle="Scheduled and in-progress">
            {upcoming.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No upcoming inspections</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((insp: any) => (
                  <div key={insp.id} className="flex items-center justify-between gap-4 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#F8FAFC]">{TYPE_LABELS[insp.type?.toUpperCase()] ?? insp.type ?? 'Inspection'}</p>
                      <p className="text-xs text-[#94A3B8]">{insp.unit?.property?.name ?? ''} {insp.unit?.unitNumber ? `· Unit ${insp.unit.unitNumber}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[insp.status?.toUpperCase()] ?? 'text-[#94A3B8] bg-[#94A3B8]/10'}`}>
                        {insp.status}
                      </span>
                      {insp.status?.toUpperCase() === 'SCHEDULED' && (
                        <Button size="sm" variant="outline" onClick={() => startMutation.mutate(insp.id)} disabled={startMutation.isPending}>
                          <Play size={11} /> Start
                        </Button>
                      )}
                      {insp.status?.toUpperCase() === 'IN_PROGRESS' && (
                        <Button size="sm" onClick={() => completeMutation.mutate(insp.id)} disabled={completeMutation.isPending}>
                          {completeMutation.isPending ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Complete
                        </Button>
                      )}
                      <Link href={`/inspections/${insp.id}`}>
                        <Button size="sm" variant="outline"><ChevronRight size={13} /></Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title={`Past Inspections (${past.length})`} subtitle="Completed and cancelled">
            {past.length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No past inspections</p>
            ) : (
              <div className="space-y-2">
                {past.map((insp: any) => (
                  <Link key={insp.id} href={`/inspections/${insp.id}`}
                    className="flex items-center justify-between gap-4 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] px-4 py-3 transition-colors hover:border-[#2B4A73]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#F8FAFC]">{TYPE_LABELS[insp.type?.toUpperCase()] ?? insp.type ?? 'Inspection'}</p>
                      <p className="text-xs text-[#94A3B8]">{new Date(insp.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[insp.status?.toUpperCase()] ?? 'text-[#94A3B8] bg-[#94A3B8]/10'}`}>
                        {insp.status}
                      </span>
                      <ChevronRight size={14} className="text-[#475569]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </WorkspaceShell>
  );
}
