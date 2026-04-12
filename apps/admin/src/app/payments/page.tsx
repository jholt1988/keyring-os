'use client';

import { useState } from 'react';
import { Wallet, CheckCircle, Bell, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, RiskMeter, SectionCard, MetricCard } from '@/components/copilot';
import { usePaymentsWorkspace } from '@/app/hooks/useWorkspace';
import { issueDelinquencyNotice } from '@/lib/copilot-api';
import { PaymentOperationsSection } from '@/components/parity/shared';
import { useToast } from '@/components/ui/toast';
import type { Severity } from '@keyring/types';

export default function PaymentsPage() {
  const { data, isLoading, refetch } = usePaymentsWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [remindTarget, setRemindTarget] = useState<any>(null);
  const [deliveryMethod, setDeliveryMethod] = useState('EMAIL');
  const [remindMessage, setRemindMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const invalidate = () => { qc.invalidateQueries({ queryKey: ['workspace', 'payments'] }); refetch(); };

  const remindMutation = useMutation({
    mutationFn: () => issueDelinquencyNotice({
      leaseId: remindTarget.leaseId ?? remindTarget.id,
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

  if (isLoading) {
    return (
      <WorkspaceShell title="Payments" subtitle="Collection & Risk Engine" icon={Wallet}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const delinquency = data?.delinquency as any;
  const summary = data?.opsSummary as any;
  const buckets = delinquency?.buckets ?? (Array.isArray(delinquency) ? delinquency : []);
  const delinquentItems = buckets.flatMap((bucket: any) => bucket.items ?? []);
  const invoices = (data?.invoices as any)?.data ?? data?.invoices ?? [];

  const totalAtRisk = buckets.reduce(
    (sum: number, b: any) => sum + (b.items ?? []).reduce((s: number, i: any) => s + (i.outstandingAmount ?? i.amount ?? 0), 0),
    0,
  );

  return (
    <>
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
            <p className="flex items-center gap-2 text-sm text-[#10B981]"><CheckCircle size={14} /> No overdue payments</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {buckets.map((bucket: any, bi: number) => (
                <div key={bi} className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    {bucket.label ?? `${bucket.minDays ?? 0}-${bucket.maxDays ?? '+'} days overdue`}
                  </p>
                  {(bucket.items ?? []).map((item: any) => {
                    const days = item.daysOverdue ?? 0;
                    const severity: Severity = days > 30 ? 'critical' : days > 14 ? 'high' : days > 7 ? 'medium' : 'low';
                    return (
                      <div key={item.id ?? item.leaseId} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-[#F8FAFC]">{item.tenantName ?? 'Tenant'}</span>
                          <span className="font-mono text-sm text-[#F43F5E]">${(item.outstandingAmount ?? item.amount ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <RiskMeter level={severity} className="mr-4 flex-1" />
                          <Button size="sm" variant="outline" onClick={() => setRemindTarget(item)}>
                            <Send size={12} /> Remind
                          </Button>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">{days} days overdue | {item.noticeStatus ?? 'No notice'}</p>
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
            <div className="flex items-center gap-3 rounded-[14px] border border-[#10B981]/10 bg-[#10B981]/5 p-3">
              <CheckCircle size={18} className="text-[#10B981]" />
              <div>
                <p className="text-sm font-medium text-[#F8FAFC]">Auto-collection active</p>
                <p className="text-xs text-[#94A3B8]">Late fee cron runs daily at 3 AM ET</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[14px] border border-[#38BDF8]/10 bg-[#38BDF8]/5 p-3">
              <Bell size={18} className="text-[#38BDF8]" />
              <div>
                <p className="text-sm font-medium text-[#F8FAFC]">Payment reminders</p>
                <p className="text-xs text-[#94A3B8]">Scheduled for overdue invoices via notification service</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[14px] border border-[#22D3EE]/10 bg-[#22D3EE]/5 p-3">
              <AlertTriangle size={18} className="text-[#22D3EE]" />
              <div>
                <p className="text-sm font-medium text-[#F8FAFC]">AI Risk Assessment</p>
                <p className="text-xs text-[#94A3B8]">HIGH/CRITICAL risk payments flagged before processing</p>
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
              <div key={i} className="flex items-center justify-between rounded-[10px] bg-[#0F1B31] p-2.5">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${step.active ? 'bg-[#3B82F6]' : 'bg-[#94A3B8]/30'}`} />
                  <span className="text-xs text-[#CBD5E1]">{step.stage}</span>
                </div>
                <span className="font-mono text-[10px] text-[#94A3B8]">{step.action}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Operations Summary" subtitle="Payment system health">
          {summary ? (
            <div className="space-y-2">
              {Object.entries(summary).slice(0, 8).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between border-b border-[#1E3350] py-1.5 last:border-0">
                  <span className="text-xs text-[#94A3B8]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-mono text-sm text-[#F8FAFC]">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#94A3B8]">Summary data unavailable</p>
          )}
        </SectionCard>

        <div className="lg:col-span-2">
          <PaymentOperationsSection delinquentItems={delinquentItems} invoices={Array.isArray(invoices) ? invoices : []} />
        </div>
      </div>
    </WorkspaceShell>

      {/* Remind modal */}
      <Modal open={!!remindTarget} onClose={() => { setRemindTarget(null); setConfirmed(false); }} title="Send Payment Reminder"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => { setRemindTarget(null); setConfirmed(false); }}>Cancel</Button>
          <Button size="sm" onClick={() => remindMutation.mutate()} disabled={!confirmed || remindMutation.isPending}>
            {remindMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />} Send Reminder
          </Button>
        </>}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#94A3B8]">
            Tenant: <span className="text-[#F8FAFC]">{remindTarget?.tenantName ?? 'Tenant'}</span> —{' '}
            <span className="text-[#F43F5E]">${(remindTarget?.outstandingAmount ?? remindTarget?.amount ?? 0).toLocaleString()} overdue</span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Delivery method</label>
            <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {['EMAIL','SMS','PORTAL','PRINT','OTHER'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Message (optional)</label>
            <textarea value={remindMessage} onChange={(e) => setRemindMessage(e.target.value)} rows={2}
              placeholder="Your rent payment is overdue. Please remit payment immediately."
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-[#3B82F6]" />
            <span className="text-sm text-[#94A3B8]">I confirm this notice should be sent to the tenant.</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
