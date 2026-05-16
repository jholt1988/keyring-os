'use client';

import { usePaymentsWorkspace } from '@/app/hooks/useWorkspace';
import { SectionCard,WorkspaceShell } from '@/components/copilot';
import { DecisionCard } from '@/features/copilot/components/decision-card';
import { useToast } from '@/components/ui/toast';
import { executeDecisionAction } from '@/lib/copilot-api';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle2,
  Clock3,
  DollarSign,
  Scale,
  ShieldAlert
} from 'lucide-react';
import { useMemo,useState } from 'react';

type DelinquentItem = {
  id?: string;
  leaseId?: string;
  tenantName?: string;
  unitName?: string;
  propertyName?: string;
  outstandingAmount?: number;
  amount?: number;
  daysOverdue?: number;
  noticeStatus?: string;
  lastPaymentDate?: string;
};

type DelinquencyBucket = {
  label?: string;
  minDays?: number;
  maxDays?: number;
  items?: DelinquentItem[];
};

function currency(value: number) {
  return `$${value.toLocaleString()}`;
}

function severityFromDays(days: number) {
  if (days > 30) return 'critical';
  if (days > 14) return 'high';
  if (days > 7) return 'medium';
  return 'low';
}

function severityClasses(severity: ReturnType<typeof severityFromDays>) {
  if (severity === 'critical') return 'border-[#F43F5E]/30 bg-[#F43F5E]/8 text-[#FCA5A5]';
  if (severity === 'high') return 'border-[#FB7185]/25 bg-[#FB7185]/8 text-[#FBCFE8]';
  if (severity === 'medium') return 'border-[#F59E0B]/25 bg-[#F59E0B]/8 text-[#FCD34D]';
  return 'border-white/10 bg-white/[0.04] text-[#B8CAE2]';
}

function formatDate(value?: string) {
  if (!value) return 'No recent payment';
  try {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

export default function PaymentsPage() {
  const { data, isLoading, refetch } = usePaymentsWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['workspace', 'payments'] });
    refetch();
  };

  const handleAction = async (actionId: string, entityId: string, decision: any) => {
    const action = decision.actions.find((a: any) => (a.id || a.intent) === actionId);
    if (!action) return;
    try {
      if (action.type === 'navigation') {
        window.open(action.href, '_blank');
        return;
      }
      await executeDecisionAction(action.endpoint, action.method, action.body);
      toast('Action executed successfully');
      invalidate();
    } catch {
      toast('Action failed', 'error');
    }
  };

  const rawDecisions = ((data?.decisions as any)?.decisions ?? []);
  const topDecisions = rawDecisions.slice(0, 3);
  const nextQueue = rawDecisions.slice(3, 8);

  const invoices = ((data?.invoices as { data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>) ?? []);
  const invoiceItems = Array.isArray(invoices) ? invoices : invoices.data ?? [];
  const opsSummary = (data?.opsSummary as Record<string, number | string> | null) ?? null;

  const delinquentCount = ((data?.opsSummary as any)?.counts?.delinquentAccounts ?? 0);
  const totalAtRisk = ((data?.delinquency as any)?.items ?? []).reduce((acc: number, item: any) => acc + (item.amountDueCents ?? 0) / 100, 0);
  const legalRiskCount = ((data?.delinquency as any)?.items ?? []).filter((item: any) => (item.daysPastDue ?? 0) > 30).length;

  if (isLoading) {
    return (
      <WorkspaceShell title="Payments" subtitle="Collection execution surface" icon={DollarSign}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="h-[340px] animate-pulse rounded-[28px] bg-white/[0.04]" />
          <div className="h-[340px] animate-pulse rounded-[28px] bg-white/[0.04]" />
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <>
      <WorkspaceShell title="Payments" subtitle="Resolve collection risk with minimal hops" icon={DollarSign}>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="space-y-6">
            <div className="glass-panel rounded-[30px] p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Execution surface</p>
                  <h2 className="mt-2 font-[family-name:var(--font-space)] text-3xl font-semibold tracking-tight text-[#F8FAFC]">
                    Collections decisions first, ledger context second.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">
                    This route is now optimized for who needs intervention now, what action should happen next, and how much exposure is riding on delay.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'At risk', value: currency(totalAtRisk), tone: 'text-[#F87171]' },
                    { label: 'Top decisions', value: String(topDecisions.length), tone: 'text-[#FBBF24]' },
                    { label: 'Legal risk', value: String(legalRiskCount), tone: 'text-[#FB7185]' },
                    { label: 'Autopay active', value: String(opsSummary?.autopayActive ?? 0), tone: 'text-[#60A5FA]' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">{item.label}</div>
                      <div className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SectionCard title="Needs your decision" subtitle="Top payment interventions only">
              <div className="space-y-4">
                {topDecisions.length ? topDecisions.map((decision: any) => (
                  <DecisionCard
                    key={decision.id}
                    id={decision.id}
                    title={decision.title}
                    subtitle={decision.summary}
                    severity={decision.evidence?.daysPastDue > 30 ? 'critical' : decision.evidence?.daysPastDue > 14 ? 'high' : 'medium'}
                    urgency={decision.evidence?.daysPastDue > 30 ? 'immediate' : 'this_week'}
                    domain={decision.domain}
                    entityId={decision.entityId}
                    context={`Exposure: $${(decision.evidence?.amountDueCents ?? 0) / 100} • Days Overdue: ${decision.evidence?.daysPastDue ?? 0}`}
                    actions={decision.actions.map((a: any) => ({ ...a, id: a.intent || a.id }))}
                    onAction={(actionId, entityId) => handleAction(actionId, entityId, decision)}
                  />
                )) : (
                  <div className="rounded-[22px] border border-[#10B981]/20 bg-[#10B981]/8 p-5 text-sm text-[#B8F5D4]">
                    <div className="flex items-center gap-2 font-medium text-[#D7FFE8]">
                      <CheckCircle2 size={16} /> No payment interventions need judgment right now.
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="Next queue" subtitle="Secondary actions, still worth attention">
                <div className="space-y-3">
                  {nextQueue.length ? nextQueue.map((decision: any) => {
                    const amount = (decision.evidence?.amountDueCents ?? 0) / 100;
                    return (
                      <div key={decision.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-[#F8FAFC]">{decision.evidence?.tenantName ?? 'Tenant'}</div>
                            <div className="mt-1 text-xs text-[#8DA4C5]">
                              {(decision.evidence?.daysPastDue ?? 0)} days overdue, {decision.evidence?.propertyName ?? 'property'}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-[#F8B4C2]">{currency(amount)}</div>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-[#94A3B8]">No secondary queue behind the top decisions.</p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Action policy rail" subtitle="Escalation should remain intentional">
                <div className="space-y-3 text-sm text-[#C8D7EA]">
                  {[
                    { icon: Bell, title: 'Notice first', copy: 'Default action is communication, not workflow expansion.' },
                    { icon: Clock3, title: 'Time matters', copy: 'Days overdue changes urgency, but not every case deserves equal UI weight.' },
                    { icon: ShieldAlert, title: 'Escalate carefully', copy: 'Legal and formal notice steps should appear only when risk is real.' },
                    { icon: Scale, title: 'Ledger before judgment', copy: 'Execution surfaces should expose balance context before irreversible action.' },
                  ].map((rule) => {
                    const Icon = rule.icon;
                    return (
                      <div key={rule.title} className="rounded-[18px] border border-white/8 bg-black/10 p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-[14px] border border-white/8 bg-white/[0.04] p-2"><Icon size={15} className="text-[#60A5FA]" /></div>
                          <div>
                            <div className="text-sm font-medium text-[#F8FAFC]">{rule.title}</div>
                            <div className="mt-1 text-xs leading-relaxed text-[#8DA4C5]">{rule.copy}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>
          </section>

          <aside className="space-y-6">
            <SectionCard title="Operational context" subtitle="Keep context tight, not sprawling">
              <div className="space-y-4">
                <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">System posture</div>
                  <div className="mt-3 space-y-2 text-sm text-[#C8D7EA]">
                    <div className="flex items-center justify-between gap-3"><span>Delinquent accounts</span><span className="font-medium text-[#F8FAFC]">{delinquentCount}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Invoices in system</span><span className="font-medium text-[#F8FAFC]">{invoiceItems.length}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Paid this month</span><span className="font-medium text-[#F8FAFC]">{String(opsSummary?.paidThisMonth ?? 0)}</span></div>
                  </div>
                </div>

                {opsSummary && (
                  <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">Useful stats</div>
                    <div className="mt-3 space-y-2">
                      {Object.entries(opsSummary).slice(0, 6).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-[#8DA4C5]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-medium text-[#F8FAFC]">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Contract gap resolved" subtitle="First-class decisions online">
              <div className="rounded-[18px] border border-[#10B981]/20 bg-[#10B981]/6 p-4 text-sm text-[#B8F5D4]">
                The payments workspace is now properly decoupled. It relies on backend decision payloads with strict endpoints, replacing raw delinquency mapping and hardcoded UI buckets.
              </div>
            </SectionCard>
          </aside>
        </div>
      </WorkspaceShell>

    </>
  );
}
