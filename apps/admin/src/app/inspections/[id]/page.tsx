'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, Play, AlertCircle, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { loadOperatorInspectionDetail, startOperatorInspection, completeOperatorInspection } from '@/lib/operator/read-only-data';
import { useOperatorData } from '@/features/operator';
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
  const { token } = useOperatorData();

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => loadOperatorInspectionDetail(Number(id), { token: token || undefined }),
  });

  const startMutation = useMutation({
    mutationFn: () => startOperatorInspection(Number(id), { token: token || undefined }),
    onSuccess: () => { toast('Inspection started'); qc.invalidateQueries({ queryKey: ['inspection', id] }); },
    onError: () => toast('Failed to start inspection', 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeOperatorInspection(Number(id), { token: token || undefined }),
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InspectionDetailView />
    </HydrationBoundary>
  );
}
