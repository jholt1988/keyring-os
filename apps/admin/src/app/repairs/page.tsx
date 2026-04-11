'use client';

import { useState } from 'react';
import { Wrench, CheckCircle, Clock, User, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, RiskMeter, ExplainableAction, SectionCard, MetricCard } from '@/components/copilot';
import { useRepairsWorkspace } from '@/app/hooks/useWorkspace';
import { approveEstimate, rejectEstimate } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import type { Severity } from '@keyring/types';

const priorityToSeverity = (p: string): Severity => {
  switch (p?.toUpperCase()) {
    case 'EMERGENCY': return 'critical';
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    default: return 'low';
  }
};

export default function RepairsPage() {
  const { data, isLoading, refetch } = useRepairsWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const invalidate = () => { qc.invalidateQueries({ queryKey: ['workspace', 'repairs'] }); refetch(); };

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveEstimate(id),
    onSuccess: () => { toast('Estimate approved'); invalidate(); },
    onError: () => toast('Failed to approve estimate', 'error'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectEstimate(id, reason),
    onSuccess: () => { toast('Estimate rejected'); setRejectTarget(null); setRejectReason(''); invalidate(); },
    onError: () => toast('Failed to reject estimate', 'error'),
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="Repairs" subtitle="Predictive Action Layer" icon={Wrench}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const requests: any[] = (data?.requests as any)?.data ?? data?.requests ?? [];
  const estimates: any[] = (data?.estimates as any)?.data ?? data?.estimates ?? [];
  const aiMetrics = (data?.aiMetrics as any) ?? {};

  const emergencyCount = requests.filter((r) => r.priority === 'EMERGENCY').length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS').length;
  const pendingEstimates = (Array.isArray(estimates) ? estimates : []).filter((e) => e.status === 'PENDING_REVIEW');
  const totalCostExposure = pendingEstimates.reduce((s, e) => s + (e.totalProjectCost ?? 0), 0);

  return (
    <>
    <WorkspaceShell title="Repairs" subtitle="Predictive Action Layer" icon={Wrench}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={emergencyCount} label="Emergency" variant="danger" />
        <MetricCard value={pendingCount} label="Pending" variant="warning" />
        <MetricCard value={inProgressCount} label="In Progress" variant="info" />
        <MetricCard value={`$${totalCostExposure.toLocaleString()}`} label="Cost Exposure" variant="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Imminent Risks" subtitle="Emergency & high-priority items">
          {requests.filter((r) => ['EMERGENCY', 'HIGH'].includes(r.priority)).length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#10B981]"><CheckCircle size={14} /> No critical repairs</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {requests.filter((r) => ['EMERGENCY', 'HIGH'].includes(r.priority)).map((req) => (
                <div key={req.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-[#F8FAFC]">{req.title}</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${req.priority === 'EMERGENCY' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="mb-2 line-clamp-2 text-xs text-[#94A3B8]">{req.description}</p>
                  <RiskMeter level={priorityToSeverity(req.priority)} />
                  {req.assignee && <p className="mt-2 flex items-center gap-1 text-[10px] text-[#94A3B8]"><User size={10} /> {req.assignee.name ?? 'Assigned'}</p>}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Active Tickets" subtitle="In progress maintenance">
          <div className="max-h-[350px] space-y-2 overflow-y-auto">
            {requests.filter((r) => r.status === 'IN_PROGRESS').length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No active tickets</p>
            ) : (
              requests.filter((r) => r.status === 'IN_PROGRESS').slice(0, 8).map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-[10px] bg-[#0F1B31] p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#F8FAFC]">{req.title}</p>
                    <p className="text-[10px] text-[#94A3B8]">{req.property?.name ?? ''} {req.unit?.name ?? ''}</p>
                  </div>
                  {req.dueAt && <span className="flex items-center gap-1 font-mono text-[10px] text-[#94A3B8]"><Clock size={10} /> {new Date(req.dueAt).toLocaleDateString()}</span>}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Estimates Pending" subtitle="Awaiting cost approval">
          {pendingEstimates.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No estimates pending review</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {pendingEstimates.slice(0, 6).map((est) => (
                <div key={est.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-[#F8FAFC]">Estimate #{est.id?.slice(-6)}</span>
                    <span className="font-mono text-sm text-[#F43F5E]">${(est.totalProjectCost ?? 0).toLocaleString()}</span>
                  </div>
                  <p className="mb-2 text-xs text-[#94A3B8]">Labor: ${(est.totalLaborCost ?? 0).toLocaleString()} | Materials: ${(est.totalMaterialCost ?? 0).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button size="sm"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(est.id)}
                    >
                      {approveMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setRejectTarget(est)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="AI Maintenance Intelligence" subtitle="Predictive insights">
          {aiMetrics.slaBreachPredictions ? (
            <ExplainableAction
              trigger={`${aiMetrics.slaBreachPredictions?.atRisk ?? 0} tickets at risk of SLA breach`}
              reasoning="AI monitors response/resolution times against SLA policies and predicts breaches based on historical patterns"
              recommendation="Prioritize at-risk tickets or reassign to available technicians"
              actionLabel="View at-risk"
            />
          ) : (
            <p className="text-sm text-[#94A3B8]">AI metrics unavailable. System monitors SLA compliance and predicts maintenance risks automatically.</p>
          )}
        </SectionCard>
      </div>
    </WorkspaceShell>

      {/* Reject estimate modal */}

      <Modal open={!!rejectTarget} onClose={() => { setRejectTarget(null); setRejectReason(''); }} title="Reject Estimate"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>Cancel</Button>
          <Button variant="destructive" size="sm"
            onClick={() => rejectMutation.mutate({ id: rejectTarget?.id, reason: rejectReason || undefined })}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : null} Reject
          </Button>
        </>}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Reason (optional)</label>
          <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
            placeholder="Explain why this estimate is being rejected…"
            className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
        </div>
      </Modal>
    </>
  );
}
