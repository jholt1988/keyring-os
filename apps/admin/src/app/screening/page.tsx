'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Users, CheckCircle, AlertTriangle, XCircle, Shield, ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialogue';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, PolicyBadge, ExplainableAction, SectionCard } from '@/components/copilot';
import { useScreeningWorkspace } from '@/app/hooks/useWorkspace';
import { fetchPolicyEvaluation, reviewApplication, createApplication } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import type { PolicyEvaluation } from '@keyring/types';
import Link from 'next/link';

export default function ScreeningPage() {
  const { data, isLoading, refetch } = useScreeningWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  // Deny modal state
  const [denyOpen, setDenyOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [denyReasonCode, setDenyReasonCode] = useState('');

  // Conditional modal state
  const [condOpen, setCondOpen] = useState(false);
  const [condDeposit, setCondDeposit] = useState('');
  const [condCosigner, setCondCosigner] = useState(false);
  const [condNote, setCondNote] = useState('');

  // New application modal
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [newApp, setNewApp] = useState({ applicantName: '', email: '', phone: '', income: '', creditScore: '' });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['workspace', 'screening'] });
    refetch();
  };

  const approveMutation = useMutation({
    mutationFn: () => reviewApplication(selectedApp.id, { action: 'APPROVE' }),
    onSuccess: () => {
      toast('Application approved');
      setSelectedApp(null);
      setEvaluation(null);
      invalidate();
    },
    onError: () => toast('Failed to approve application', 'error'),
  });

  const conditionalMutation = useMutation({
    mutationFn: () => reviewApplication(selectedApp.id, {
      action: 'CONDITIONAL_APPROVE',
      conditionalDeposit: condDeposit ? parseFloat(condDeposit) : undefined,
      requiresCosigner: condCosigner,
      note: condNote || undefined,
    }),
    onSuccess: () => {
      toast('Application conditionally approved');
      setCondOpen(false);
      setSelectedApp(null);
      setEvaluation(null);
      invalidate();
    },
    onError: () => toast('Failed to conditionally approve', 'error'),
  });

  const denyMutation = useMutation({
    mutationFn: () => reviewApplication(selectedApp.id, {
      action: 'DENY',
      reasonCode: denyReasonCode || undefined,
      reason: denyReason,
    }),
    onSuccess: () => {
      toast('Application denied');
      setDenyOpen(false);
      setSelectedApp(null);
      setEvaluation(null);
      invalidate();
    },
    onError: () => toast('Failed to deny application', 'error'),
  });

  const createAppMutation = useMutation({
    mutationFn: () => createApplication({
      applicantName: newApp.applicantName,
      email: newApp.email,
      phone: newApp.phone,
      income: newApp.income ? parseFloat(newApp.income) : undefined,
      creditScore: newApp.creditScore ? parseInt(newApp.creditScore) : undefined,
    }),
    onSuccess: () => {
      toast('Application created');
      setNewAppOpen(false);
      setNewApp({ applicantName: '', email: '', phone: '', income: '', creditScore: '' });
      invalidate();
    },
    onError: () => toast('Failed to create application', 'error'),
  });

  const applications = (data as any)?.applications ?? [];

  const selectApp = async (app: any) => {
    setSelectedApp(app);
    setEvalLoading(true);
    try {
      const ev = await fetchPolicyEvaluation(app.id);
      setEvaluation(ev);
    } catch {
      setEvaluation(null);
    } finally {
      setEvalLoading(false);
    }
  };

  const categorize = (apps: any[]) => {
    const approve: any[] = [], conditional: any[] = [], deny: any[] = [], pending: any[] = [];
    apps.forEach((app) => {
      const s = (app.qualificationStatus ?? app.status ?? '').toUpperCase();
      if (s === 'APPROVED' || s === 'QUALIFIED') approve.push(app);
      else if (s === 'CONDITIONAL' || s === 'CONDITIONALLY_APPROVED') conditional.push(app);
      else if (s === 'REJECTED' || s === 'DENIED' || s === 'DISQUALIFIED') deny.push(app);
      else pending.push(app);
    });
    return { approve, conditional, deny, pending };
  };

  const { approve, conditional, deny, pending } = categorize(applications);

  if (isLoading) {
    return (
      <WorkspaceShell title="Screening" subtitle="Policy Decision Engine" icon={Users}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-[#0F1B31]" />)}
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Screening" subtitle="Policy Decision Engine" icon={Users}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E3350] bg-[#0F1B31] px-3 py-1.5 text-xs text-[#CBD5E1]"><Shield size={12} className="text-[#F59E0B]" /> Credit ≥ 620</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E3350] bg-[#0F1B31] px-3 py-1.5 text-xs text-[#CBD5E1]"><Shield size={12} className="text-[#F59E0B]" /> No recent evictions</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1E3350] bg-[#0F1B31] px-3 py-1.5 text-xs text-[#CBD5E1]"><Shield size={12} className="text-[#F59E0B]" /> Income ≥ 4x rent</span>
        <Button size="sm" className="ml-auto" onClick={() => setNewAppOpen(true)}><Plus size={13} /> New Application</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          {pending.length > 0 && (
            <SectionCard title={`Pending Review (${pending.length})`} subtitle="Awaiting screening">
              <div className="space-y-2">{pending.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} />)}</div>
            </SectionCard>
          )}
          <SectionCard title={`Approved (${approve.length})`} subtitle="Passed all criteria">
            {approve.length === 0 ? <p className="text-sm text-[#94A3B8]">None yet</p> : (
              <div className="space-y-2">{approve.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} verdict="approve" />)}</div>
            )}
          </SectionCard>
        </div>
        <SectionCard title={`Conditional (${conditional.length})`} subtitle="1 criterion failed">
          {conditional.length === 0 ? <p className="text-sm text-[#94A3B8]">None</p> : (
            <div className="space-y-2">{conditional.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} verdict="conditional" />)}</div>
          )}
        </SectionCard>
        <SectionCard title={`Denied (${deny.length})`} subtitle="2+ criteria failed">
          {deny.length === 0 ? <p className="text-sm text-[#94A3B8]">None</p> : (
            <div className="space-y-2">{deny.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} verdict="deny" />)}</div>
          )}
        </SectionCard>
      </div>

      {/* Application detail dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open: boolean) => { if (!open) { setSelectedApp(null); setEvaluation(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedApp?.fullName ?? selectedApp?.applicantName ?? 'Applicant'}</DialogTitle>
          </DialogHeader>
          {evaluation && <PolicyBadge verdict={evaluation.verdict} className="mb-4" />}
          <div className="mb-4 space-y-1 text-xs text-[#94A3B8]">
            <p>Email: {selectedApp?.email ?? 'N/A'}</p>
            <p>Income: ${(selectedApp?.income ?? 0).toLocaleString()}/mo</p>
            <p>Credit Score: {selectedApp?.creditScore ?? 'Pending'}</p>
          </div>
          {evalLoading ? (
            <div className="animate-pulse space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-[10px] bg-[#0F1B31]" />)}</div>
          ) : evaluation ? (
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">POLICY EVALUATION</p>
              {evaluation.criteria.map((c) => (
                <div key={c.rule} className={`flex items-start gap-3 rounded-[14px] border p-3 ${c.passed ? 'border-[#10B981]/10 bg-[#10B981]/5' : 'border-[#F43F5E]/10 bg-[#F43F5E]/5'}`}>
                  {c.passed ? <CheckCircle size={16} className="mt-0.5 text-[#10B981]" /> : <XCircle size={16} className="mt-0.5 text-[#F43F5E]" />}
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{c.rule.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-[#94A3B8]">{c.explanation}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">Actual: {c.actual} | Required: {c.threshold}</p>
                  </div>
                </div>
              ))}
              {evaluation.conditionalTerms && (
                <ExplainableAction
                  trigger="Applicant failed 1 screening criterion"
                  reasoning={`${evaluation.conditionalTerms.requiresCosigner ? 'Income below 4x rent threshold. ' : ''}Policy allows conditional approval with mitigation.`}
                  recommendation={`Require ${evaluation.conditionalTerms.requiresCosigner ? 'co-signer and ' : ''}deposit of $${evaluation.conditionalTerms.requiredDeposit.toLocaleString()}`}
                />
              )}

              {/* Action buttons */}
              {!['APPROVED','CONDITIONALLY_APPROVED','REJECTED'].includes((selectedApp?.status ?? '').toUpperCase()) && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[#1E3350] pt-4">
                  <Button size="sm" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                    {approveMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
                  </Button>
                  {evaluation.verdict === 'conditional' && (
                    <Button size="sm" variant="outline" onClick={() => {
                      setCondDeposit(String(evaluation.conditionalTerms?.requiredDeposit ?? ''));
                      setCondCosigner(evaluation.conditionalTerms?.requiresCosigner ?? false);
                      setCondOpen(true);
                    }}>
                      <AlertTriangle size={13} /> Approve w/ Conditions
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => setDenyOpen(true)}>
                    <XCircle size={13} /> Deny
                  </Button>
                </div>
              )}

              {/* Create Lease CTA for approved apps */}
              {['APPROVED','CONDITIONALLY_APPROVED'].includes((selectedApp?.status ?? '').toUpperCase()) && (
                <div className="border-t border-[#1E3350] pt-4">
                  <Link href={`/leases/new?applicationId=${selectedApp?.id}`}>
                    <Button size="sm" className="w-full"><ArrowRight size={13} /> Create Lease</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Deny modal */}
      <Modal open={denyOpen} onClose={() => setDenyOpen(false)} title="Deny Application"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setDenyOpen(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={() => denyMutation.mutate()} disabled={!denyReason.trim() || denyMutation.isPending}>
            {denyMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />} Deny
          </Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Reason code</label>
            <select value={denyReasonCode} onChange={(e) => setDenyReasonCode(e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              <option value="">Select reason code</option>
              {['CREDIT_RISK','INCOME_INSUFFICIENT','IDENTITY_UNVERIFIED','BACKGROUND_CHECK_FAILED','INCOMPLETE_DOCUMENTATION','POLICY_MISMATCH','OTHER'].map(c => (
                <option key={c} value={c}>{c.replace(/_/g,' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Reason <span className="text-[#F43F5E]">*</span></label>
            <textarea value={denyReason} onChange={(e) => setDenyReason(e.target.value)} rows={3} placeholder="Explain the denial reason…"
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>

      {/* Conditional approval modal */}
      <Modal open={condOpen} onClose={() => setCondOpen(false)} title="Approve with Conditions"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setCondOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={() => conditionalMutation.mutate()} disabled={conditionalMutation.isPending}>
            {conditionalMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
          </Button>
        </>}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Required deposit ($)</label>
            <input type="number" value={condDeposit} onChange={(e) => setCondDeposit(e.target.value)} min={0}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={condCosigner} onChange={(e) => setCondCosigner(e.target.checked)} className="accent-[#3B82F6]" />
            <span className="text-sm text-[#94A3B8]">Cosigner required</span>
          </label>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Notes (optional)</label>
            <textarea value={condNote} onChange={(e) => setCondNote(e.target.value)} rows={2}
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>

      {/* New application modal */}
      <Modal open={newAppOpen} onClose={() => setNewAppOpen(false)} title="New Application"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setNewAppOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={() => createAppMutation.mutate()} disabled={!newApp.applicantName.trim() || !newApp.email.trim() || createAppMutation.isPending}>
            {createAppMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />} Create
          </Button>
        </>}
      >
        <div className="space-y-3">
          {[
            { label: 'Full name *', key: 'applicantName', type: 'text', placeholder: 'Jane Smith' },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'jane@example.com' },
            { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
            { label: 'Monthly income ($)', key: 'income', type: 'number', placeholder: '5000' },
            { label: 'Credit score', key: 'creditScore', type: 'number', placeholder: '720' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">{label}</label>
              <input type={type} value={(newApp as any)[key]} placeholder={placeholder}
                onChange={(e) => setNewApp((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
            </div>
          ))}
        </div>
      </Modal>
    </WorkspaceShell>
  );
}

function AppRow({ app, onClick, verdict }: { app: any; onClick: () => void; verdict?: 'approve' | 'conditional' | 'deny' }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-[14px] bg-[#0F1B31] p-3 text-left transition-all duration-[180ms] hover:bg-[#17304E]">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#F8FAFC]">{app.fullName ?? app.applicantName ?? 'Applicant'}</p>
        <p className="truncate text-xs text-[#94A3B8]">{app.propertyName ?? app.property?.name ?? ''} {app.unitName ?? ''}</p>
      </div>
      {verdict && <PolicyBadge verdict={verdict} />}
      <ArrowRight size={14} className="text-[#94A3B8]/30" />
    </button>
  );
}
