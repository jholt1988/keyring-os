'use client';

import { RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceShell, RiskMeter, ExplainableAction, SectionCard, MetricCard } from '@/components/copilot';
import { useRenewalsWorkspace } from '@/app/hooks/useWorkspace';
import type { Severity } from '@keyring/types';

export default function RenewalsPage() {
  const { data, isLoading } = useRenewalsWorkspace();

  if (isLoading) {
    return (
      <WorkspaceShell title="Renewals" subtitle="Revenue Continuity Engine" icon={RefreshCw}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const leases: any[] = (data?.leases as any)?.data ?? data?.leases ?? [];
  const recommendations: any[] = (data?.recommendations as any)?.data ?? data?.recommendations ?? [];

  const now = new Date();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const activeLeases = (Array.isArray(leases) ? leases : []).filter((l) => l.status === 'ACTIVE');
  const expiringLeases = activeLeases
    .filter((l) => { if (!l.endDate) return false; const end = new Date(l.endDate); return end <= ninetyDays && end >= now; })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  const totalMonthlyAtRisk = expiringLeases.reduce((s, l) => s + (l.rentAmount ?? 0), 0);
  const renewalOffersSent = activeLeases.filter((l) => l.renewalOffers?.some((o: any) => o.status === 'OFFERED')).length;
  const renewalsAccepted = activeLeases.filter((l) => l.renewalOffers?.some((o: any) => o.status === 'ACCEPTED')).length;

  const daysUntilExpiry = (endDate: string) => Math.max(0, Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <WorkspaceShell title="Renewals" subtitle="Revenue Continuity Engine" icon={RefreshCw}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={expiringLeases.length} label="Expiring ≤90d" variant="warning" />
        <MetricCard value={`$${totalMonthlyAtRisk.toLocaleString()}`} label="Monthly at Risk" variant="danger" />
        <MetricCard value={renewalOffersSent} label="Offers Sent" variant="info" />
        <MetricCard value={renewalsAccepted} label="Accepted" variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Expiring Leases" subtitle="Sorted by urgency" className="lg:col-span-2">
          {expiringLeases.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle size={14} /> No leases expiring within 90 days</p>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {expiringLeases.map((lease) => {
                const days = daysUntilExpiry(lease.endDate);
                const severity: Severity = days <= 14 ? 'critical' : days <= 30 ? 'high' : days <= 60 ? 'medium' : 'low';
                const rec = (Array.isArray(recommendations) ? recommendations : []).find((r) => r.unitId === lease.unitId);
                const offerStatus = lease.renewalOffers?.find((o: any) => o.status === 'OFFERED' || o.status === 'ACCEPTED');

                return (
                  <div key={lease.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{lease.tenant?.username ?? 'Tenant'}</p>
                        <p className="text-xs text-muted-foreground">{lease.unit?.property?.name ?? ''} - {lease.unit?.name ?? ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm ${days <= 14 ? 'text-red-500' : days <= 30 ? 'text-amber-500' : ''}`}>{days} days</p>
                        <p className="text-[10px] text-muted-foreground">${(lease.rentAmount ?? 0).toLocaleString()}/mo</p>
                      </div>
                    </div>
                    <RiskMeter level={severity} className="mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rec && <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">AI: ${rec.recommendedRent?.toLocaleString()}/mo suggested</span>}
                        {offerStatus && <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${offerStatus.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>{offerStatus.status}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!offerStatus && <Button size="sm">Send Offer</Button>}
                        <Button size="sm" variant="outline"><Home size={12} /> Prep Listing</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Pricing Intelligence" subtitle="AI rent recommendations">
          {(Array.isArray(recommendations) ? recommendations : []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No rent recommendations available.</p>
          ) : (
            <div className="max-h-[300px] space-y-2 overflow-y-auto">
              {(Array.isArray(recommendations) ? recommendations : []).slice(0, 6).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between rounded bg-muted/50 p-3">
                  <div>
                    <p className="text-xs font-medium">Unit {rec.unitId?.slice(-6) ?? rec.unit?.name ?? ''}</p>
                    <p className="text-[10px] text-muted-foreground">Current: ${(rec.currentRent ?? 0).toLocaleString()} | Suggested: ${(rec.recommendedRent ?? 0).toLocaleString()}</p>
                  </div>
                  {(rec.recommendedRent ?? 0) > (rec.currentRent ?? 0) ? (
                    <span className="flex items-center gap-1 font-mono text-xs text-green-600 dark:text-green-400"><TrendingUp size={12} /> +${((rec.recommendedRent ?? 0) - (rec.currentRent ?? 0)).toLocaleString()}</span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">No change</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Renewal Strategy" subtitle="Automated workflow">
          <ExplainableAction
            trigger="Leases approaching 90-day expiration window"
            reasoning="System evaluates churn risk, market comparables, and tenant payment history to determine optimal renewal pricing"
            recommendation="AI generates offers nightly. Review and send before the 60-day mark for maximum retention."
          />
          <div className="mt-4 space-y-2 border-t pt-3">
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={12} className="text-green-500" /> Daily expiration monitoring (90/60/30/14/7 days)</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={12} className="text-green-500" /> AI pricing with churn risk analysis</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={12} className="text-green-500" /> Auto-renewal support with escalation %</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><AlertTriangle size={12} className="text-amber-500" /> Fallback to listing pipeline if declined</p>
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
