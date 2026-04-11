'use client';

import { Wrench, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceShell, RiskMeter, ExplainableAction, SectionCard, MetricCard } from '@/components/copilot';
import { useRepairsWorkspace } from '@/app/hooks/useWorkspace';
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
  const { data, isLoading } = useRepairsWorkspace();

  if (isLoading) {
    return (
      <WorkspaceShell title="Repairs" subtitle="Predictive Action Layer" icon={Wrench}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
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
            <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle size={14} /> No critical repairs</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {requests.filter((r) => ['EMERGENCY', 'HIGH'].includes(r.priority)).map((req) => (
                <div key={req.id} className="rounded-lg border bg-muted/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="truncate text-sm font-medium">{req.title}</span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${req.priority === 'EMERGENCY' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{req.description}</p>
                  <RiskMeter level={priorityToSeverity(req.priority)} />
                  {req.assignee && <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground"><User size={10} /> {req.assignee.name ?? 'Assigned'}</p>}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Active Tickets" subtitle="In progress maintenance">
          <div className="max-h-[350px] space-y-2 overflow-y-auto">
            {requests.filter((r) => r.status === 'IN_PROGRESS').length === 0 ? (
              <p className="text-sm text-muted-foreground">No active tickets</p>
            ) : (
              requests.filter((r) => r.status === 'IN_PROGRESS').slice(0, 8).map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded bg-muted/50 p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{req.title}</p>
                    <p className="text-[10px] text-muted-foreground">{req.property?.name ?? ''} {req.unit?.name ?? ''}</p>
                  </div>
                  {req.dueAt && <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Clock size={10} /> {new Date(req.dueAt).toLocaleDateString()}</span>}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Estimates Pending" subtitle="Awaiting cost approval">
          {pendingEstimates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No estimates pending review</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {pendingEstimates.slice(0, 6).map((est) => (
                <div key={est.id} className="rounded-lg border bg-muted/50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">Estimate #{est.id?.slice(-6)}</span>
                    <span className="font-mono text-sm text-destructive">${(est.totalProjectCost ?? 0).toLocaleString()}</span>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">Labor: ${(est.totalLaborCost ?? 0).toLocaleString()} | Materials: ${(est.totalMaterialCost ?? 0).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="destructive">Reject</Button>
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
            <p className="text-sm text-muted-foreground">AI metrics unavailable. System monitors SLA compliance and predicts maintenance risks automatically.</p>
          )}
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
