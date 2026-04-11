'use client';

import { Wallet, CheckCircle, Bell, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceShell, RiskMeter, SectionCard, MetricCard } from '@/components/copilot';
import { usePaymentsWorkspace } from '@/app/hooks/useWorkspace';
import type { Severity } from '@keyring/types';

export default function PaymentsPage() {
  const { data, isLoading } = usePaymentsWorkspace();

  if (isLoading) {
    return (
      <WorkspaceShell title="Payments" subtitle="Collection & Risk Engine" icon={Wallet}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const delinquency = data?.delinquency as any;
  const summary = data?.opsSummary as any;
  const buckets = delinquency?.buckets ?? (Array.isArray(delinquency) ? delinquency : []);

  const totalAtRisk = buckets.reduce(
    (sum: number, b: any) => sum + (b.items ?? []).reduce((s: number, i: any) => s + (i.outstandingAmount ?? i.amount ?? 0), 0),
    0,
  );

  return (
    <WorkspaceShell title="Payments" subtitle="Collection & Risk Engine" icon={Wallet}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={`$${totalAtRisk.toLocaleString()}`} label="At Risk" variant="danger" />
        <MetricCard value={buckets.length} label="Overdue Buckets" variant="warning" />
        <MetricCard value={summary?.autopayActive ?? 0} label="On Autopay" variant="info" />
        <MetricCard value={summary?.paidThisMonth ?? 0} label="Paid This Month" variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Overdue Queue" subtitle="Prioritized by days & amount">
          {buckets.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle size={14} /> No overdue payments</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {buckets.map((bucket: any, bi: number) => (
                <div key={bi} className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {bucket.label ?? `${bucket.minDays ?? 0}-${bucket.maxDays ?? '+'} days overdue`}
                  </p>
                  {(bucket.items ?? []).map((item: any) => {
                    const days = item.daysOverdue ?? 0;
                    const severity: Severity = days > 30 ? 'critical' : days > 14 ? 'high' : days > 7 ? 'medium' : 'low';
                    return (
                      <div key={item.id ?? item.leaseId} className="rounded-lg border bg-muted/50 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium">{item.tenantName ?? 'Tenant'}</span>
                          <span className="font-mono text-sm text-destructive">${(item.outstandingAmount ?? item.amount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <RiskMeter level={severity} className="mr-4 flex-1" />
                          <Button size="sm" variant="outline"><Send size={12} /> Remind</Button>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">{days} days overdue | {item.noticeStatus ?? 'No notice'}</p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Autopilot Status" subtitle="Automated payment processing">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-green-500/10 bg-green-500/5 p-3">
              <CheckCircle size={18} className="text-green-500" />
              <div>
                <p className="text-sm font-medium">Auto-collection active</p>
                <p className="text-xs text-muted-foreground">Late fee cron runs daily at 3 AM ET</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">
              <Bell size={18} className="text-blue-500" />
              <div>
                <p className="text-sm font-medium">Payment reminders</p>
                <p className="text-xs text-muted-foreground">Scheduled for overdue invoices via notification service</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-violet-500/10 bg-violet-500/5 p-3">
              <AlertTriangle size={18} className="text-violet-500" />
              <div>
                <p className="text-sm font-medium">AI Risk Assessment</p>
                <p className="text-xs text-muted-foreground">HIGH/CRITICAL risk payments flagged before processing</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notice Pipeline" subtitle="Legal escalation status">
          <div className="space-y-2">
            {[
              { stage: 'Reminder Sent', action: 'Auto via cron', active: true },
              { stage: 'Late Fee Applied', action: 'Policy engine', active: true },
              { stage: 'Formal Notice', action: 'Requires approval', active: false },
              { stage: 'Legal Referral', action: 'Manual escalation', active: false },
              { stage: 'Court Filing', action: 'Attorney packet', active: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-muted/50 p-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${step.active ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <span className="text-xs">{step.stage}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{step.action}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Operations Summary" subtitle="Payment system health">
          {summary ? (
            <div className="space-y-2">
              {Object.entries(summary).slice(0, 8).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between border-b py-1 last:border-0">
                  <span className="text-xs text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-mono text-sm">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Summary data unavailable</p>
          )}
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
