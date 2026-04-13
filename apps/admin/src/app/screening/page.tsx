'use client';

import { useMemo, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FilePlus2,
  RefreshCw,
  Shield,
  ShieldAlert,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialogue';
import { Modal } from '@/components/ui/modal';
import { WorkspaceShell, PolicyBadge, ExplainableAction, SectionCard } from '@/components/copilot';
import { useScreeningWorkspace } from '@/app/hooks/useWorkspace';
import { fetchPolicyEvaluation, reviewApplication, createApplication } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';
import type { PolicyEvaluation } from '@keyring/types';
import Link from 'next/link';

type ScreeningApp = {
  id: number;
  fullName?: string;
  applicantName?: string;
  email?: string;
  phone?: string;
  income?: number;
  creditScore?: number;
  qualificationStatus?: string;
  status?: string;
  propertyName?: string;
  unitName?: string;
  property?: { name?: string };
  submittedAt?: string;
};

function normalizeStatus(app: ScreeningApp) {
  return (app.qualificationStatus ?? app.status ?? '').toUpperCase();
}

function displayName(app: ScreeningApp) {
  return app.fullName ?? app.applicantName ?? 'Applicant';
}

function submittedLabel(value?: string) {
  if (!value) return 'Submission time unavailable';
  try {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return value;
  }
}

export default function ScreeningPage() {
  const { data, isLoading, refetch } = useScreeningWorkspace();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [selectedApp, setSelectedApp] = useState<ScreeningApp | null>(null);
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const [denyOpen, setDenyOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [denyReasonCode, setDenyReasonCode] = useState('');

  const [condOpen, setCondOpen] = useState(false);
  const [condDeposit, setCondDeposit] = useState('');
  const [condCosigner, setCondCosigner] = useState(false);
  const [condNote, setCondNote] = useState('');

  const [newAppOpen, setNewAppOpen] = useState(false);
  const [newApp, setNewApp] = useState({ applicantName: '', email: '', phone: '', income: '', creditScore: '' });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['workspace', 'screening'] });
    refetch();
  };

  const approveMutation = useMutation({
    mutationFn: () => reviewApplication(selectedApp?.id ?? 0, { action: 'APPROVE' }),
    onSuccess: () => {
      toast('Application approved');
      setSelectedApp(null);
      setEvaluation(null);
      invalidate();
    },
    onError: () => toast('Failed to approve application', 'error'),
  });

  const conditionalMutation = useMutation({
    mutationFn: () => reviewApplication(selectedApp?.id ?? 0, {
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
    mutationFn: () => reviewApplication(selectedApp?.id ?? 0, {
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
      creditScore: newApp.creditScore ? parseInt(newApp.creditScore, 10) : undefined,
    }),
    onSuccess: () => {
      toast('Application created');
      setNewAppOpen(false);
      setNewApp({ applicantName: '', email: '', phone: '', income: '', creditScore: '' });
      invalidate();
    },
    onError: () => toast('Failed to create application', 'error'),
  });

  const applications = ((data as { applications?: ScreeningApp[] } | undefined)?.applications ?? []) as ScreeningApp[];

  const categorized = useMemo(() => {
    const approved: ScreeningApp[] = [];
    const conditional: ScreeningApp[] = [];
    const denied: ScreeningApp[] = [];
    const pending: ScreeningApp[] = [];

    applications.forEach((app) => {
      const status = normalizeStatus(app);
      if (status === 'APPROVED' || status === 'QUALIFIED') approved.push(app);
      else if (status === 'CONDITIONAL' || status === 'CONDITIONALLY_APPROVED') conditional.push(app);
      else if (status === 'REJECTED' || status === 'DENIED' || status === 'DISQUALIFIED') denied.push(app);
      else pending.push(app);
    });

    return { approved, conditional, denied, pending };
  }, [applications]);

  const topPending = categorized.pending.slice(0, 3);
  const nextPending = categorized.pending.slice(3, 8);

  const selectApp = async (app: ScreeningApp) => {
    setSelectedApp(app);
    setEvalLoading(true);
    try {
      const result = await fetchPolicyEvaluation(String(app.id));
      setEvaluation(result);
    } catch {
      setEvaluation(null);
    } finally {
      setEvalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <WorkspaceShell title="Screening" subtitle="Policy decision execution surface" icon={Users}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[320px] animate-pulse rounded-[28px] bg-white/[0.04]" />
          <div className="h-[320px] animate-pulse rounded-[28px] bg-white/[0.04]" />
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Screening" subtitle="Resolve applicant judgment with policy evidence, not browsing" icon={Users}>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Execution surface</p>
                <h2 className="mt-2 font-[family-name:var(--font-space)] text-3xl font-semibold tracking-tight text-[#F8FAFC]">
                  Surface the judgment calls, then act with evidence.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">
                  Screening should move from policy awareness to decision to lease creation without forcing the operator through dashboard-style review queues.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Needs review', value: String(categorized.pending.length), tone: 'text-[#FBBF24]' },
                  { label: 'Approved', value: String(categorized.approved.length), tone: 'text-[#86EFAC]' },
                  { label: 'Conditional', value: String(categorized.conditional.length), tone: 'text-[#FCD34D]' },
                  { label: 'Denied', value: String(categorized.denied.length), tone: 'text-[#FDA4AF]' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">{item.label}</div>
                    <div className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SectionCard
            title="Needs your decision"
            subtitle="Top screening reviews only"
            actions={<Button size="sm" onClick={() => setNewAppOpen(true)}><FilePlus2 size={12} /> New application</Button>}
          >
            <div className="space-y-4">
              {topPending.length ? topPending.map((app) => (
                <button
                  key={app.id}
                  onClick={() => selectApp(app)}
                  className="w-full rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-left transition-all duration-[180ms] hover:border-white/12 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#FCD34D]">
                          Policy review
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#9AB1CF]">
                          Submitted {submittedLabel(app.submittedAt)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#F8FAFC]">{displayName(app)}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#9AB1CF]">
                          {app.propertyName ?? app.property?.name ?? 'Property'}{app.unitName ? `, ${app.unitName}` : ''} , income {app.income ? `$${Number(app.income).toLocaleString()}/mo` : 'unknown'} , credit {app.creditScore ?? 'pending'}.
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-[#22D3EE]/12 bg-[#22D3EE]/6 p-3 text-sm text-[#D4F9FF]">
                        Recommended next move: inspect policy evidence now, then approve, condition, or deny without leaving the screening surface.
                      </div>
                    </div>
                    <div className="min-w-[190px] rounded-[22px] border border-white/8 bg-black/10 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">Operator context</div>
                      <div className="mt-3 space-y-2 text-sm text-[#C8D7EA]">
                        <div className="flex items-center justify-between gap-3"><span>Income</span><span className="font-medium text-[#F8FAFC]">{app.income ? `$${Number(app.income).toLocaleString()}` : 'N/A'}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Credit</span><span className="font-medium text-[#F8FAFC]">{app.creditScore ?? 'Pending'}</span></div>
                        <div className="flex items-center justify-between gap-3"><span>Status</span><span className="font-medium text-[#F8FAFC]">{normalizeStatus(app) || 'PENDING'}</span></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#9AB1CF]">
                    Open policy evidence <ArrowRight size={14} />
                  </div>
                </button>
              )) : (
                <div className="rounded-[22px] border border-[#10B981]/20 bg-[#10B981]/8 p-5 text-sm text-[#B8F5D4]">
                  <div className="flex items-center gap-2 font-medium text-[#D7FFE8]">
                    <CheckCircle size={16} /> No screening decisions are waiting on judgment right now.
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Next queue" subtitle="Secondary reviews behind the top decisions">
              <div className="space-y-3">
                {nextPending.length ? nextPending.map((app) => (
                  <button key={app.id} onClick={() => selectApp(app)} className="w-full rounded-[18px] border border-white/8 bg-white/[0.03] p-4 text-left transition-all duration-[180ms] hover:border-white/12 hover:bg-white/[0.04]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[#F8FAFC]">{displayName(app)}</div>
                        <div className="mt-1 text-xs text-[#8DA4C5]">
                          {app.propertyName ?? app.property?.name ?? 'Property'}{app.unitName ? `, ${app.unitName}` : ''}
                        </div>
                      </div>
                      <div className="text-xs text-[#9AB1CF]">{submittedLabel(app.submittedAt)}</div>
                    </div>
                  </button>
                )) : (
                  <p className="text-sm text-[#94A3B8]">No queue behind the top review set.</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Completed outcomes" subtitle="Keep decisions visible but secondary">
              <div className="space-y-3">
                {[
                  { label: 'Approved', count: categorized.approved.length, verdict: 'approve' as const },
                  { label: 'Conditional', count: categorized.conditional.length, verdict: 'conditional' as const },
                  { label: 'Denied', count: categorized.denied.length, verdict: 'deny' as const },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-white/8 bg-black/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[#F8FAFC]">{item.label}</div>
                        <div className="mt-1 text-xs text-[#8DA4C5]">Outcome state is still visible, but not allowed to crowd out active decisions.</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PolicyBadge verdict={item.verdict} />
                        <span className="text-sm font-semibold text-[#F8FAFC]">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <aside className="space-y-6">
          <SectionCard title="Policy rail" subtitle="Keep screening rules explicit and close to action">
            <div className="space-y-3 text-sm text-[#C8D7EA]">
              {[
                { icon: Shield, title: 'Credit threshold', copy: 'Baseline expectation remains credit score at or above 620.' },
                { icon: ShieldAlert, title: 'Eviction history', copy: 'Recent evictions should stay front-and-center in evidence review.' },
                { icon: UserCheck, title: 'Income coverage', copy: 'Income should support rent at 4x or better before clean approval.' },
                { icon: AlertTriangle, title: 'Conditional path', copy: 'If only one criterion fails, mitigate with deposit or cosigner instead of forcing a binary outcome.' },
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

          <SectionCard title="Contract gap watch" subtitle="The frontend should say when backend shape is too thin">
            <div className="rounded-[18px] border border-[#F59E0B]/20 bg-[#F59E0B]/6 p-4 text-sm text-[#F9D38B]">
              Screening still depends on a separate policy-evaluation fetch after selecting an application. The stronger backend contract is a review queue that already carries summary reasoning, recommended verdict, and executable actions.
            </div>
          </SectionCard>
        </aside>
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(open: boolean) => { if (!open) { setSelectedApp(null); setEvaluation(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{displayName(selectedApp ?? { id: 0 })}</DialogTitle>
          </DialogHeader>
          {evaluation && <PolicyBadge verdict={evaluation.verdict} className="mb-4" />}
          <div className="mb-4 space-y-1 text-xs text-[#94A3B8]">
            <p>Email: {selectedApp?.email ?? 'N/A'}</p>
            <p>Income: ${Number(selectedApp?.income ?? 0).toLocaleString()}/mo</p>
            <p>Credit Score: {selectedApp?.creditScore ?? 'Pending'}</p>
          </div>
          {evalLoading ? (
            <div className="animate-pulse space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-[10px] bg-[#0F1B31]" />)}</div>
          ) : evaluation ? (
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">POLICY EVIDENCE</p>
              {evaluation.criteria.map((criterion) => (
                <div key={criterion.rule} className={`flex items-start gap-3 rounded-[14px] border p-3 ${criterion.passed ? 'border-[#10B981]/10 bg-[#10B981]/5' : 'border-[#F43F5E]/10 bg-[#F43F5E]/5'}`}>
                  {criterion.passed ? <CheckCircle size={16} className="mt-0.5 text-[#10B981]" /> : <XCircle size={16} className="mt-0.5 text-[#F43F5E]" />}
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{criterion.rule.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-[#94A3B8]">{criterion.explanation}</p>
                    <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">Actual: {criterion.actual} | Required: {criterion.threshold}</p>
                  </div>
                </div>
              ))}

              {evaluation.conditionalTerms && (
                <ExplainableAction
                  trigger="Exactly one screening criterion failed"
                  reasoning={`${evaluation.conditionalTerms.requiresCosigner ? 'Income below policy threshold. ' : ''}Mitigation path is available without forcing immediate denial.`}
                  recommendation={`Require ${evaluation.conditionalTerms.requiresCosigner ? 'co-signer and ' : ''}deposit of $${evaluation.conditionalTerms.requiredDeposit.toLocaleString()}`}
                />
              )}

              {!['APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED'].includes(normalizeStatus(selectedApp ?? { id: 0 })) && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[#1E3350] pt-4">
                  <Button size="sm" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
                    {approveMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
                  </Button>
                  {evaluation.verdict === 'conditional' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCondDeposit(String(evaluation.conditionalTerms?.requiredDeposit ?? ''));
                        setCondCosigner(evaluation.conditionalTerms?.requiresCosigner ?? false);
                        setCondOpen(true);
                      }}
                    >
                      <AlertTriangle size={13} /> Approve with conditions
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => setDenyOpen(true)}>
                    <XCircle size={13} /> Deny
                  </Button>
                </div>
              )}

              {['APPROVED', 'CONDITIONALLY_APPROVED'].includes(normalizeStatus(selectedApp ?? { id: 0 })) && (
                <div className="border-t border-[#1E3350] pt-4">
                  <Link href={`/leases/new?applicationId=${selectedApp?.id}`}>
                    <Button size="sm" className="w-full"><ArrowRight size={13} /> Create Lease</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[18px] border border-[#F59E0B]/20 bg-[#F59E0B]/6 p-4 text-sm text-[#F9D38B]">
              Policy evaluation unavailable. This is another backend contract gap the UI should not hide.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Modal
        open={denyOpen}
        onClose={() => setDenyOpen(false)}
        title="Deny Application"
        footer={(
          <>
            <Button variant="outline" size="sm" onClick={() => setDenyOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => denyMutation.mutate()} disabled={!denyReason.trim() || denyMutation.isPending}>
              {denyMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />} Deny
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Reason code</label>
            <select value={denyReasonCode} onChange={(event) => setDenyReasonCode(event.target.value)} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              <option value="">Select reason code</option>
              {['CREDIT_RISK', 'INCOME_INSUFFICIENT', 'IDENTITY_UNVERIFIED', 'BACKGROUND_CHECK_FAILED', 'INCOMPLETE_DOCUMENTATION', 'POLICY_MISMATCH', 'OTHER'].map((code) => (
                <option key={code} value={code}>{code.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Reason <span className="text-[#F43F5E]">*</span></label>
            <textarea value={denyReason} onChange={(event) => setDenyReason(event.target.value)} rows={3} placeholder="Explain the denial reason..." className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>

      <Modal
        open={condOpen}
        onClose={() => setCondOpen(false)}
        title="Approve with Conditions"
        footer={(
          <>
            <Button variant="outline" size="sm" onClick={() => setCondOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => conditionalMutation.mutate()} disabled={conditionalMutation.isPending}>
              {conditionalMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Required deposit ($)</label>
            <input type="number" value={condDeposit} onChange={(event) => setCondDeposit(event.target.value)} min={0} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]" />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={condCosigner} onChange={(event) => setCondCosigner(event.target.checked)} className="accent-[#3B82F6]" />
            <span className="text-sm text-[#94A3B8]">Cosigner required</span>
          </label>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Notes (optional)</label>
            <textarea value={condNote} onChange={(event) => setCondNote(event.target.value)} rows={2} className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>

      <Modal
        open={newAppOpen}
        onClose={() => setNewAppOpen(false)}
        title="New Application"
        footer={(
          <>
            <Button variant="outline" size="sm" onClick={() => setNewAppOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createAppMutation.mutate()} disabled={!newApp.applicantName.trim() || !newApp.email.trim() || createAppMutation.isPending}>
              {createAppMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <FilePlus2 size={13} />} Create
            </Button>
          </>
        )}
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
              <input
                type={type}
                value={newApp[key as keyof typeof newApp]}
                placeholder={placeholder}
                onChange={(event) => setNewApp((previous) => ({ ...previous, [key]: event.target.value }))}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
              />
            </div>
          ))}
        </div>
      </Modal>
    </WorkspaceShell>
  );
}
