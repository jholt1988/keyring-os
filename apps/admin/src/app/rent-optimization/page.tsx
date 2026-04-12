'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, CheckCircle, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { WorkspaceShell, MetricCard, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { acceptRecommendation, applyRecommendation, bulkGenerateRecommendations, fetchPendingRecommendations, fetchRentRecommendations, generateRecommendations, rejectRecommendation } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function RentOptimizationPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery({ queryKey: ['rent-recommendations'], queryFn: () => fetchRentRecommendations() });
  const { data: pending } = useQuery({ queryKey: ['rent-recommendations', 'pending'], queryFn: fetchPendingRecommendations });
  const recommendations = Array.isArray(data) ? data : [];
  const pendingRows = Array.isArray(pending) ? pending : [];
  const refresh = () => qc.invalidateQueries({ queryKey: ['rent-recommendations'] });
  const acceptM = useMutation({ mutationFn: (id: string) => acceptRecommendation(id), onSuccess: () => { toast('Recommendation accepted'); refresh(); } });
  const rejectM = useMutation({ mutationFn: (id: string) => rejectRecommendation(id), onSuccess: () => { toast('Recommendation rejected'); refresh(); } });
  const applyM = useMutation({ mutationFn: (id: string) => applyRecommendation(id), onSuccess: () => { toast('Recommendation applied'); refresh(); } });
  const genM = useMutation({ mutationFn: () => generateRecommendations(), onSuccess: () => { toast('Recommendations generated'); refresh(); } });
  const bulkM = useMutation({ mutationFn: () => bulkGenerateRecommendations(), onSuccess: () => { toast('Bulk generation started'); refresh(); } });
  const accepted = recommendations.filter((r: any) => String(r.status).toUpperCase().includes('ACCEPT')).length;
  const rejected = recommendations.filter((r: any) => String(r.status).toUpperCase().includes('REJECT')).length;

  return (
    <WorkspaceShell title="Rent Optimization" subtitle="Rent recommendation review and generation" icon={BarChart3} actions={<><Button size="sm" variant="outline" onClick={() => bulkM.mutate()}><Sparkles size={12} /> Bulk Generate</Button><Button size="sm" onClick={() => genM.mutate()}>{genM.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate</Button></>}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={pendingRows.length} label="Pending" variant="warning" />
        <MetricCard value={accepted} label="Accepted" variant="success" />
        <MetricCard value={rejected} label="Rejected" variant="danger" />
        <MetricCard value={recommendations.length} label="Total" variant="info" />
      </div>
      <SectionCard title="Pending Recommendations" subtitle="Current vs suggested rent and confidence">
        <div className="space-y-3">
          {pendingRows.map((row: any) => (
            <div key={row.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
              <p className="text-sm font-medium text-[#F8FAFC]">{row.propertyName ?? row.unitName ?? row.id}</p>
              <p className="text-xs text-[#94A3B8]">Current ${row.currentRent ?? 0} · Suggested ${row.suggestedRent ?? 0} · Confidence {row.confidenceScore ?? row.confidence ?? 'n/a'}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => acceptM.mutate(row.id)}><CheckCircle size={12} /> Accept</Button>
                <Button size="sm" variant="outline" onClick={() => rejectM.mutate(row.id)}><XCircle size={12} /> Reject</Button>
                <Button size="sm" onClick={() => applyM.mutate(row.id)}>Apply</Button>
              </div>
            </div>
          ))}
          {pendingRows.length === 0 && <p className="text-sm text-[#94A3B8]">No pending recommendations.</p>}
        </div>
      </SectionCard>
    </WorkspaceShell>
  );
}
