'use client';

import { Home, TrendingDown } from 'lucide-react';
import { WorkspaceShell, RiskMeter, SectionCard, MetricCard } from '@/components/copilot';
import { useLeasingWorkspace } from '@/app/hooks/useWorkspace';

const PIPELINE_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'TOURING', 'APPLICATION_SUBMITTED', 'CONVERTED'];

export default function LeasingPage() {
  const { data, isLoading } = useLeasingWorkspace();

  if (isLoading) {
    return (
      <WorkspaceShell title="Leasing" subtitle="Revenue Pipeline Engine" icon={Home}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const stats = (data?.stats as any) ?? {};
  const leads = (data?.leads as any)?.leads ?? data?.leads ?? [];
  const opsSummary = (data?.opsSummary as any) ?? {};

  const vacantUnits = opsSummary.vacantUnits ?? stats.vacantUnits ?? 0;
  const avgRent = opsSummary.avgRent ?? 1500;
  const revenueLeak = vacantUnits * avgRent;

  const pipelineCounts: Record<string, any[]> = {};
  PIPELINE_STAGES.forEach((s) => { pipelineCounts[s] = []; });
  (Array.isArray(leads) ? leads : []).forEach((lead: any) => {
    const status = (lead.status ?? 'NEW').toUpperCase();
    (pipelineCounts[status] ?? pipelineCounts.NEW).push(lead);
  });

  return (
    <WorkspaceShell title="Leasing" subtitle="Revenue Pipeline Engine" icon={Home}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={vacantUnits} label="Vacant Units" variant="danger" />
        <MetricCard value={`$${revenueLeak.toLocaleString()}`} label="Monthly Revenue Leak" variant="danger" />
        <MetricCard value={(Array.isArray(leads) ? leads : []).length} label="Active Leads" variant="info" />
        <MetricCard value={stats.expiringLeases ?? opsSummary.expiringLeases ?? 0} label="Expiring Soon" variant="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Leasing Pipeline" subtitle="Lead to lease progression" className="lg:col-span-2">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage} className="min-w-[160px] shrink-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{stage.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-xs">{pipelineCounts[stage]?.length ?? 0}</span>
                </div>
                <div className="space-y-2">
                  {(pipelineCounts[stage] ?? []).slice(0, 5).map((lead: any) => (
                    <div key={lead.id} className="rounded-lg border bg-muted/50 p-2.5 transition-colors hover:bg-muted">
                      <p className="truncate text-xs font-medium">{lead.name ?? 'Lead'}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{lead.email ?? ''}</p>
                      {lead.budget && <p className="mt-1 font-mono text-[10px] text-primary">${lead.budget}/mo</p>}
                    </div>
                  ))}
                  {(pipelineCounts[stage]?.length ?? 0) === 0 && (
                    <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Revenue Leak" subtitle="Cost of vacant units">
          {vacantUnits === 0 ? (
            <p className="text-sm text-green-600 dark:text-green-400">No vacancies. Full occupancy.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <TrendingDown size={18} />
                <span className="text-lg font-light">${revenueLeak.toLocaleString()}/month lost</span>
              </div>
              <p className="text-xs text-muted-foreground">{vacantUnits} vacant unit{vacantUnits > 1 ? 's' : ''} at avg ${avgRent.toLocaleString()}/mo</p>
              <RiskMeter level={vacantUnits > 5 ? 'critical' : vacantUnits > 2 ? 'high' : 'medium'} />
              <div className="border-t pt-3">
                <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">NEXT BEST ACTION</p>
                <p className="text-sm font-medium">Activate listing syndication for vacant units</p>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Expiring Leases" subtitle="Within 90 days">
          {(opsSummary.expiringLeaseDetails ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No leases expiring within 90 days</p>
          ) : (
            <div className="space-y-2">
              {(opsSummary.expiringLeaseDetails ?? []).slice(0, 6).map((lease: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded bg-muted/50 p-2">
                  <div>
                    <p className="text-xs font-medium">{lease.tenantName ?? 'Tenant'}</p>
                    <p className="text-[10px] text-muted-foreground">{lease.propertyName ?? ''} - {lease.unitName ?? ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-amber-500">{lease.daysUntilExpiry ?? '?'} days</p>
                    <p className="text-[10px] text-muted-foreground">${(lease.rentAmount ?? 0).toLocaleString()}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
