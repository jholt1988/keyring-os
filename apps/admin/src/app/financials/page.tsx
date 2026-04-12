'use client';

import { useState } from 'react';
import {
  BookOpen, AlertTriangle, CheckCircle, Clock, FileText,
  Lock, Unlock, Send, ArrowRightLeft, XCircle, RefreshCw,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, RiskMeter, SectionCard, MetricCard } from '@/components/copilot';
import { useFinancialsWorkspace } from '@/app/hooks/useWorkspace';
import {
  allocateTransaction,
  categorizeTransaction,
  approveOwnerStatement,
  confirmReconciliationItem,
  flagTransactionException,
  lockMonthlyClose,
  reopenMonthlyClose,
  sendOwnerStatement,
} from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import type { Severity } from '@keyring/types';

const closeStepLabel: Record<string, string> = {
  open: 'Open',
  reconciling: 'Reconciling',
  review: 'Ready for Review',
  locked: 'Locked',
  reported: 'Reported',
};

const closeStepSeverity = (step: string): Severity => {
  if (step === 'locked' || step === 'reported') return 'low';
  if (step === 'review') return 'medium';
  if (step === 'reconciling') return 'high';
  return 'critical';
};

export default function FinancialsPage() {
  const { data, isLoading, refetch } = useFinancialsWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();

  // Re-categorize modal
  const [recatTarget, setRecatTarget] = useState<any>(null);
  const [newCategory, setNewCategory] = useState('');

  // Statement send state
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [allocateTarget, setAllocateTarget] = useState<any>(null);
  const [allocation, setAllocation] = useState({ propertyId: '', unitId: '', leaseId: '', vendorId: '', ownerId: '' });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ['workspace', 'financials'] }); refetch(); };

  const acceptMutation = useMutation({
    mutationFn: (tx: any) => categorizeTransaction(tx.id, tx.category ?? tx.aiCategory),
    onSuccess: () => { toast('Category accepted'); invalidate(); },
    onError: () => toast('Failed to accept category', 'error'),
  });

  const recatMutation = useMutation({
    mutationFn: () => categorizeTransaction(recatTarget.id, newCategory),
    onSuccess: () => { toast('Transaction re-categorized'); setRecatTarget(null); setNewCategory(''); invalidate(); },
    onError: () => toast('Failed to re-categorize', 'error'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveOwnerStatement(id),
    onSuccess: () => { toast('Statement approved'); invalidate(); },
    onError: () => toast('Failed to approve statement', 'error'),
  });

  const approveAndSendMutation = useMutation({
    mutationFn: async (id: string) => {
      setSendingId(id);
      await approveOwnerStatement(id);
      await sendOwnerStatement(id);
    },
    onSuccess: () => { toast('Statement approved and sent'); setSendingId(null); invalidate(); },
    onError: () => { toast('Approved but delivery failed — retry send', 'error'); setSendingId(null); invalidate(); },
  });

  const allocateMutation = useMutation({
    mutationFn: () => allocateTransaction(allocateTarget.id, allocation),
    onSuccess: () => {
      toast('Transaction allocated');
      setAllocateTarget(null);
      setAllocation({ propertyId: '', unitId: '', leaseId: '', vendorId: '', ownerId: '' });
      invalidate();
    },
    onError: () => toast('Failed to allocate transaction', 'error'),
  });

  const reconcileMutation = useMutation({
    mutationFn: (id: string) => confirmReconciliationItem(id),
    onSuccess: () => { toast('Reconciliation confirmed'); invalidate(); },
    onError: () => toast('Failed to confirm reconciliation', 'error'),
  });

  const exceptionMutation = useMutation({
    mutationFn: (id: string) => flagTransactionException(id, { reviewed: true }),
    onSuccess: () => { toast('Exception flagged for review'); invalidate(); },
    onError: () => toast('Failed to flag exception', 'error'),
  });

  const monthlyCloseMutation = useMutation({
    mutationFn: ({ propertyId, action }: { propertyId: string; action: 'lock' | 'reopen' }) => (
      action === 'lock' ? lockMonthlyClose(propertyId) : reopenMonthlyClose(propertyId)
    ),
    onSuccess: (_, vars) => { toast(vars.action === 'lock' ? 'Period closed' : 'Period reopened'); invalidate(); },
    onError: () => toast('Failed to update monthly close', 'error'),
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="Financials" subtitle="Bookkeeping & Reconciliation" icon={BookOpen}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </WorkspaceShell>
    );
  }

  const metrics = (data as any)?.metrics ?? {};
  const pending = (data as any)?.pendingTransactions ?? [];
  const exceptions = (data as any)?.exceptions ?? [];
  const recon = (data as any)?.reconciliation ?? { unmatchedCount: 0, matchedCount: 0, exceptionCount: 0, items: [] };
  const monthlyClose = (data as any)?.monthlyClose ?? [];
  const ownerStatements = (data as any)?.ownerStatements ?? [];

  return (
    <>
    <WorkspaceShell title="Financials" subtitle="Bookkeeping & Reconciliation" icon={BookOpen}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <MetricCard value={metrics.pendingCategorization ?? 0} label="Pending Review" variant="warning" />
        <MetricCard value={metrics.exceptionsCount ?? 0} label="Exceptions" variant="danger" />
        <MetricCard value={`$${((metrics.unreconciledAmount ?? 0) / 100).toLocaleString()}`} label="Unreconciled" variant="info" />
        <MetricCard value={metrics.monthsOpen ?? 0} label="Months Open" variant="warning" />
        <MetricCard value={metrics.ownerDistributionsDue ?? 0} label="Distributions Due" variant="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Transaction Review" subtitle="Pending categorization & allocation">
          {pending.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#10B981]">
              <CheckCircle size={14} /> All transactions categorized
            </p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {pending.map((tx: any) => (
                <div key={tx.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="mr-2 truncate text-sm font-medium text-[#F8FAFC]">{tx.description}</span>
                    <span className={`font-mono text-sm ${tx.amountCents > 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      ${(Math.abs(tx.amountCents) / 100).toLocaleString()}
                    </span>
                  </div>
                  <p className="mb-2 font-mono text-[10px] text-[#94A3B8]">
                    {new Date(tx.date).toLocaleDateString()} | {tx.sourceType}
                    {tx.category && ` | AI: ${tx.category} (${Math.round((tx.categoryConfidence ?? 0) * 100)}%)`}
                  </p>
                  <div className="flex items-center gap-2">
                    {tx.category && (
                      <Button size="sm" variant="outline"
                        onClick={() => acceptMutation.mutate(tx)}
                        disabled={acceptMutation.isPending}
                      >
                        {acceptMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />} Accept
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setRecatTarget(tx); setNewCategory(tx.category ?? ''); }}>
                      <FileText size={12} /> Re-categorize
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAllocateTarget(tx)}>
                      <ArrowRightLeft size={12} /> Allocate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Exception Queue" subtitle="Anomalies & unresolved items">
          {exceptions.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-[#10B981]">
              <CheckCircle size={14} /> No exceptions
            </p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {exceptions.map((tx: any) => {
                const severity: Severity = Math.abs(tx.amountCents) > 100000 ? 'critical' : Math.abs(tx.amountCents) > 10000 ? 'high' : 'medium';
                return (
                  <div key={tx.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle size={14} className="text-[#F43F5E]" />
                        <span className="text-sm text-[#F8FAFC]">{tx.description}</span>
                      </div>
                      <span className="font-mono text-sm text-[#F43F5E]">${(Math.abs(tx.amountCents) / 100).toLocaleString()}</span>
                    </div>
                    <p className="font-mono text-[10px] text-[#94A3B8]">{tx.exceptionReason ?? 'Requires manual review'}</p>
                    <RiskMeter level={severity} className="mt-2" />
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => exceptionMutation.mutate(tx.id)}>
                        <AlertTriangle size={12} /> Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Reconciliation" subtitle="Bank-to-ledger matching">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[14px] border border-[#F59E0B]/10 bg-[#F59E0B]/5 p-2 text-center">
                <p className="font-[family-name:var(--font-space)] text-lg font-bold text-[#F59E0B]">{recon.unmatchedCount}</p>
                <p className="font-mono text-[10px] uppercase text-[#94A3B8]">Unmatched</p>
              </div>
              <div className="rounded-[14px] border border-[#10B981]/10 bg-[#10B981]/5 p-2 text-center">
                <p className="font-[family-name:var(--font-space)] text-lg font-bold text-[#10B981]">{recon.matchedCount}</p>
                <p className="font-mono text-[10px] uppercase text-[#94A3B8]">Matched</p>
              </div>
              <div className="rounded-[14px] border border-[#F43F5E]/10 bg-[#F43F5E]/5 p-2 text-center">
                <p className="font-[family-name:var(--font-space)] text-lg font-bold text-[#F43F5E]">{recon.exceptionCount}</p>
                <p className="font-mono text-[10px] uppercase text-[#94A3B8]">Exceptions</p>
              </div>
            </div>
            <div className="space-y-2">
              {(recon.items ?? []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-[10px] bg-[#0F1B31] p-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft size={12} className={item.status === 'EXCEPTION' ? 'text-[#F43F5E]' : 'text-[#F59E0B]'} />
                    <span className="text-xs text-[#CBD5E1]">${(Math.abs(item.bankAmountCents ?? item.bankAmount) / 100).toLocaleString()}</span>
                  </div>
                  <span className={`font-mono text-[10px] uppercase ${item.status === 'EXCEPTION' ? 'text-[#F43F5E]' : 'text-[#F59E0B]'}`}>
                    {item.status}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => reconcileMutation.mutate(item.id)}>
                    <CheckCircle size={12} /> Reconcile
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Monthly Close" subtitle="Period-end workflow by property">
          {monthlyClose.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No properties configured</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {monthlyClose.map((mc: any) => (
                <div key={mc.propertyId} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#F8FAFC]">{mc.propertyName}</span>
                    <div className="flex items-center gap-1.5">
                      {mc.step === 'locked' || mc.step === 'reported' ? (
                        <Lock size={12} className="text-[#10B981]" />
                      ) : (
                        <Unlock size={12} className="text-[#F59E0B]" />
                      )}
                      <span className={`font-mono text-[10px] uppercase ${
                        closeStepSeverity(mc.step) === 'low' ? 'text-[#10B981]' :
                        closeStepSeverity(mc.step) === 'medium' ? 'text-[#F59E0B]' : 'text-[#F43F5E]'
                      }`}>
                        {closeStepLabel[mc.step] ?? mc.step}
                      </span>
                    </div>
                  </div>
                  <RiskMeter level={closeStepSeverity(mc.step)} className="mb-1" />
                  <div className="flex items-center gap-4 font-mono text-[10px] text-[#94A3B8]">
                    <span>{mc.unreconciledCount} unreconciled</span>
                    <span>{mc.exceptionCount} exceptions</span>
                    <span>{mc.pendingJournalEntries} draft JEs</span>
                  </div>
                  <div className="mt-3">
                    {mc.step === 'locked' || mc.step === 'reported' ? (
                      <Button size="sm" variant="outline" onClick={() => monthlyCloseMutation.mutate({ propertyId: mc.propertyId, action: 'reopen' })}>
                        <Unlock size={12} /> Reopen
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => monthlyCloseMutation.mutate({ propertyId: mc.propertyId, action: 'lock' })}>
                        <Lock size={12} /> Close
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Owner Reporting" subtitle="Monthly distribution statements">
          {ownerStatements.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">No statements for this period</p>
          ) : (
            <div className="max-h-[350px] space-y-3 overflow-y-auto">
              {ownerStatements.map((stmt: any) => {
                const ownerName = stmt.owner?.firstName
                  ? `${stmt.owner.firstName} ${stmt.owner.lastName ?? ''}`
                  : stmt.owner?.username ?? 'Owner';
                return (
                  <div key={stmt.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#F8FAFC]">{ownerName}</span>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase ${
                        stmt.status === 'SENT' ? 'bg-[#10B981]/10 text-[#10B981]' :
                        stmt.status === 'APPROVED' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                        'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}>
                        {stmt.status}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[10px]">
                      <div>
                        <span className="text-[#94A3B8]">Income:</span>
                        <span className="ml-1 text-[#10B981]">${((stmt.grossIncomeCents ?? 0) / 100).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">Expenses:</span>
                        <span className="ml-1 text-[#F43F5E]">${((stmt.totalExpensesCents ?? 0) / 100).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">Mgmt Fee:</span>
                        <span className="ml-1 text-[#F59E0B]">${((stmt.managementFeeCents ?? 0) / 100).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#94A3B8]">Net:</span>
                        <span className="ml-1 font-medium text-[#3B82F6]">${((stmt.netDistributionCents ?? 0) / 100).toLocaleString()}</span>
                      </div>
                    </div>
                    {stmt.status === 'DRAFT' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => approveMutation.mutate(stmt.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                        </Button>
                        <Button size="sm" variant="outline"
                          onClick={() => approveAndSendMutation.mutate(stmt.id)}
                          disabled={approveAndSendMutation.isPending || sendingId === stmt.id}
                        >
                          {sendingId === stmt.id ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                          {sendingId === stmt.id ? 'Sending…' : 'Approve & Send'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Workflow Pipeline" subtitle="Transaction lifecycle">
          <div className="space-y-3">
            {[
              { label: 'Capture', detail: 'Bank imports, Stripe, manual entry', done: true },
              { label: 'Categorize', detail: `${pending.length} pending`, done: pending.length === 0 },
              { label: 'Allocate', detail: 'Property/unit/lease/vendor/owner', done: false },
              { label: 'Reconcile', detail: `${recon.unmatchedCount} unmatched`, done: false },
              { label: 'Review', detail: `${exceptions.length} exceptions`, done: false },
              { label: 'Close', detail: `${metrics.monthsOpen ?? 0} months open`, done: false },
              { label: 'Report', detail: `${metrics.ownerDistributionsDue ?? 0} owner statements`, done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${step.done ? 'bg-[#10B981]' : i === 1 && pending.length > 0 ? 'animate-pulse bg-[#3B82F6]' : 'bg-[#94A3B8]/30'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#F8FAFC]">{step.label}</p>
                  <p className="truncate font-mono text-[10px] text-[#94A3B8]">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>

      {/* Re-categorize modal */}
      <Modal open={!!recatTarget} onClose={() => { setRecatTarget(null); setNewCategory(''); }} title="Re-categorize Transaction"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => { setRecatTarget(null); setNewCategory(''); }}>Cancel</Button>
          <Button size="sm" onClick={() => recatMutation.mutate()} disabled={!newCategory.trim() || recatMutation.isPending}>
            {recatMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : null} Save
          </Button>
        </>}
      >
        <div className="space-y-3">
          <p className="text-sm text-[#94A3B8]">
            Transaction: <span className="text-[#F8FAFC]">{recatTarget?.description ?? recatTarget?.id}</span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Category <span className="text-[#F43F5E]">*</span></label>
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Maintenance, Utilities, Insurance…"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!allocateTarget}
        onClose={() => setAllocateTarget(null)}
        title="Allocate Transaction"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAllocateTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={() => allocateMutation.mutate()} disabled={allocateMutation.isPending}>
              {allocateMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <ArrowRightLeft size={12} />} Allocate
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ['Property ID', 'propertyId'],
            ['Unit ID', 'unitId'],
            ['Lease ID', 'leaseId'],
            ['Vendor ID', 'vendorId'],
            ['Owner ID', 'ownerId'],
          ].map(([label, key]) => (
            <label key={key} className="block text-sm text-[#94A3B8]">
              <span className="mb-1 block">{label}</span>
              <input
                value={(allocation as any)[key]}
                onChange={(e) => setAllocation((current) => ({ ...current, [key]: e.target.value }))}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
              />
            </label>
          ))}
        </div>
      </Modal>
    </>
  );
}
