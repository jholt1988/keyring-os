'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { fetchInspection, completeInspection, startInspection } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

const TYPE_LABELS: Record<string, string> = {
  MOVE_IN: 'Move-In', MOVE_OUT: 'Move-Out', ROUTINE: 'Routine', ANNUAL: 'Annual', DRIVE_BY: 'Drive-By',
};

function conditionColor(c?: string) {
  switch (c?.toUpperCase()) {
    case 'GOOD': return 'text-[#10B981]';
    case 'FAIR': return 'text-[#F59E0B]';
    case 'POOR': case 'DAMAGED': return 'text-[#F43F5E]';
    default: return 'text-[#94A3B8]';
  }
}

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => fetchInspection(Number(id)),
  });

  const startMutation = useMutation({
    mutationFn: () => startInspection(Number(id)),
    onSuccess: () => { toast('Inspection started'); qc.invalidateQueries({ queryKey: ['inspection', id] }); },
    onError: () => toast('Failed to start inspection', 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeInspection(Number(id)),
    onSuccess: () => { toast('Inspection completed'); qc.invalidateQueries({ queryKey: ['inspection', id] }); },
    onError: () => toast('Failed to complete inspection', 'error'),
  });

  if (isLoading) return (
    <WorkspaceShell title="Inspection" icon={ClipboardList}>
      <div className="h-48 animate-pulse rounded-[24px] bg-[#0F1B31]" />
    </WorkspaceShell>
  );

  if (!inspection) return (
    <WorkspaceShell title="Inspection" icon={ClipboardList}>
      <p className="text-center text-sm text-[#94A3B8]">Inspection not found.</p>
    </WorkspaceShell>
  );

  const status = (inspection as any).status?.toUpperCase();
  const typeLabel = TYPE_LABELS[(inspection as any).type?.toUpperCase()] ?? (inspection as any).type ?? 'Inspection';
  const rooms = (inspection as any).rooms ?? [];

  return (
    <WorkspaceShell title={`${typeLabel} Inspection`} subtitle={status} icon={ClipboardList}
      actions={
        <div className="flex gap-2">
          {status === 'SCHEDULED' && (
            <Button size="sm" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              {startMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />} Start
            </Button>
          )}
          {status === 'IN_PROGRESS' && (
            <Button size="sm" onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Complete
            </Button>
          )}
        </div>
      }
    >
      <SectionCard title="Summary">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ['Type', typeLabel],
            ['Status', status],
            ['Rooms', rooms.length],
            ['Date', new Date((inspection as any).createdAt).toLocaleDateString()],
          ].map(([l, v]) => (
            <div key={l}><p className="text-[#94A3B8]">{l}</p><p className="font-semibold text-[#F8FAFC]">{v}</p></div>
          ))}
        </div>
      </SectionCard>

      {rooms.length > 0 && (
        <SectionCard title="Room Checklist">
          <div className="space-y-3">
            {rooms.map((room: any) => {
              const items = room.checklistItems ?? [];
              const issues = items.filter((i: any) => ['POOR','DAMAGED'].includes(i.condition?.toUpperCase() ?? ''));
              return (
                <div key={room.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#F8FAFC]">{room.name}</p>
                    {issues.length > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-[#F43F5E]">
                        <AlertCircle size={12} /> {issues.length} issue{issues.length > 1 ? 's' : ''}
                      </span>
                    ) : items.length > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-[#10B981]">
                        <CheckCircle2 size={12} /> All good
                      </span>
                    ) : null}
                  </div>
                  {items.length > 0 ? (
                    <div className="space-y-1.5">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#94A3B8]">{item.label}</span>
                          {item.condition && (
                            <span className={`font-medium ${conditionColor(item.condition)}`}>{item.condition}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#475569]">No checklist items.</p>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {rooms.length === 0 && (
        <SectionCard title="Room Checklist">
          <p className="text-sm text-[#94A3B8]">No rooms recorded for this inspection.</p>
        </SectionCard>
      )}
    </WorkspaceShell>
  );
}
