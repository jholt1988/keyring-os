'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Scale,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { usePaymentsWorkspace } from '@/app/hooks/useWorkspace';
import { issueDelinquencyNotice } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

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
  const [remindTarget, setRemindTarget] = useState<DelinquentItem | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState('EMAIL');
  const [remindMessage, setRemindMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['workspace', 'payments'] });
    refetch();
  };

  const remindMutation = useMutation({
    mutationFn: () => issueDelinquencyNotice({
      leaseId: remindTarget?.leaseId ?? remindTarget?.id ?? '',
      deliveryMethod,
      approvalConfirmed: true,
      message: remindMessage || undefined,
    }),
    onSuccess: () => {
      toast('Reminder sent');
      setRemindTarget(null);
      setDeliveryMethod('EMAIL');
      setRemindMessage('');
      setConfirmed(false);
      invalidate();
    },
    onError: () => toast('Failed to send reminder', 'error'),
  });

  const buckets = useMemo(() => {
    const delinquency = data?.delinquency as { buckets?: DelinquencyBucket[] } | DelinquencyBucket[] | null | undefined;
    return delinquency && !Array.isArray(delinquency) ? delinquency.buckets ?? [] : Array.isArray(delinquency) ? delinquency : [];
  }, [data?.delinquency]);

  const delinquentItems = useMemo(
    () => buckets.flatMap((bucket) => bucket.items ?? []),
    [buckets],
  );

  const sortedItems = useMemo(() => [...delinquentItems].sort((a, b) => {
    const amountA = a.outstandingAmount ?? a.amount ?? 0;
    const amountB = b.outstandingAmount ?? b.amount ?? 0;
    const daysA = a.daysOverdue ?? 0;
    const daysB = b.daysOverdue ?? 0;
    return (daysB * 1000 + amountB) - (daysA * 1000 + amountA);
  }), [delinquentItems]);

  const topDecisions = sortedItems.slice(0, 3);
  const nextQueue = sortedItems.slice(3, 8);
  const invoices = ((data?.invoices as { data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>) ?? []);
  const invoiceItems = Array.isArray(invoices) ? invoices : invoices.data ?? [];
  const opsSummary = (data?.opsSummary as Record<string, number | string> | null) ?? null;

  const totalAtRisk = buckets.reduce(
    (sum, bucket) => sum + (bucket.items ?? []).reduce((inner, item) => inner + (item.outstandingAmount ?? item.amount ?? 0), 0),
    0,
  );
  const legalRiskCount = sortedItems.filter((item) => (item.daysOverdue ?? 0) > 30).length;

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
                {topDecisions.length ? topDecisions.map((item) => {
                  const severity = severityFromDays(item.daysOverdue ?? 0);
                  const amount = item.outstandingAmount ?? item.amount ?? 0;
                  return (
                    <div key={item.id ?? item.leaseId} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 transition-all duration-[180ms] hover:border-white/12 hover:bg-white/[0.04]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${severityClasses(severity)}`}>
                              {severity} priority
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#9AB1CF]">
                              {(item.daysOverdue ?? 0)} days overdue
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#F8FAFC]">{item.tenantName ?? 'Tenant'} needs intervention</h3>
                            <p className="mt-1 text-sm leading-relaxed text-[#9AB1CF]">
                              {item.propertyName ?? 'Property'}{item.unitName ? `, ${item.unitName}` : ''} has {currency(amount)} outstanding and current notice state is {item.noticeStatus ?? 'unsent'}.
                            </p>
                          </div>
                          <div className="rounded-[18px] border border-[#22D3EE]/12 bg-[#22D3EE]/6 p-3 text-sm text-[#D4F9FF]">
                            Recommended next move: send or refresh notice now, then use ledger context before any legal escalation.
                          </div>
                        </div>
                        <div className="min-w-[180px] rounded-[22px] border border-white/8 bg-black/10 p-4">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">Exposure</div>
                          <div className="mt-2 text-2xl font-semibold text-[#FCA5A5]">{currency(amount)}</div>
                          <div className="mt-3 text-xs text-[#8DA4C5]">Last payment: {formatDate(item.lastPaymentDate)}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => setRemindTarget(item)}>
                          <Send size={12} /> Send reminder
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bell size={12} /> Review notice trail
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink size={12} /> Open ledger context
                        </Button>
                      </div>
                    </div>
                  );
                }) : (
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
                  {nextQueue.length ? nextQueue.map((item) => {
                    const amount = item.outstandingAmount ?? item.amount ?? 0;
                    return (
                      <div key={item.id ?? item.leaseId} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-[#F8FAFC]">{item.tenantName ?? 'Tenant'}</div>
                            <div className="mt-1 text-xs text-[#8DA4C5]">
                              {(item.daysOverdue ?? 0)} days overdue, {item.noticeStatus ?? 'no notice'}, {item.propertyName ?? 'property'}
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
                    <div className="flex items-center justify-between gap-3"><span>Delinquent accounts</span><span className="font-medium text-[#F8FAFC]">{sortedItems.length}</span></div>
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

            <SectionCard title="Contract gap watch" subtitle="Frontend should flag backend mismatches">
              <div className="rounded-[18px] border border-[#F59E0B]/20 bg-[#F59E0B]/6 p-4 text-sm text-[#F9D38B]">
                The payments workspace is still driven by raw delinquency buckets and summary payloads, not a first-class decision contract. This surface compensates in the UI, but the better long-term move is a backend payment-decision payload.
              </div>
            </SectionCard>
          </aside>
        </div>
      </WorkspaceShell>

      <Modal
        open={!!remindTarget}
        onClose={() => { setRemindTarget(null); setConfirmed(false); }}
        title="Send Payment Reminder"
        footer={(
          <>
            <Button variant="outline" size="sm" onClick={() => { setRemindTarget(null); setConfirmed(false); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => remindMutation.mutate()} disabled={!confirmed || remindMutation.isPending}>
              {remindMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
              Send Reminder
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#94A3B8]">
            Tenant: <span className="text-[#F8FAFC]">{remindTarget?.tenantName ?? 'Tenant'}</span> ,{' '}
            <span className="text-[#F43F5E]">{currency(remindTarget?.outstandingAmount ?? remindTarget?.amount ?? 0)} overdue</span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Delivery method</label>
            <select
              value={deliveryMethod}
              onChange={(event) => setDeliveryMethod(event.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]"
            >
              {['EMAIL', 'SMS', 'PORTAL', 'PRINT', 'OTHER'].map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Message (optional)</label>
            <textarea
              value={remindMessage}
              onChange={(event) => setRemindMessage(event.target.value)}
              rows={2}
              placeholder="Your rent payment is overdue. Please remit payment immediately."
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 accent-[#3B82F6]" />
            <span className="text-sm text-[#94A3B8]">I confirm this notice should be sent to the tenant.</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
