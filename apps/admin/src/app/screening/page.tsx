'use client';

import { useState } from 'react';
import { Users, CheckCircle, AlertTriangle, XCircle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialogue';
import { WorkspaceShell, PolicyBadge, ExplainableAction, SectionCard } from '@/components/copilot';
import { useScreeningWorkspace } from '@/app/hooks/useWorkspace';
import { fetchPolicyEvaluation } from '@/lib/copilot-api';
import type { PolicyEvaluation } from '@keyring/types';

export default function ScreeningPage() {
  const { data, isLoading } = useScreeningWorkspace();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<PolicyEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

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
          {[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Screening" subtitle="Policy Decision Engine" icon={Users}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1.5 text-xs"><Shield size={12} /> Credit &ge; 620</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1.5 text-xs"><Shield size={12} /> No recent evictions</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1.5 text-xs"><Shield size={12} /> Income &ge; 4x rent</span>
        <span className="ml-auto font-mono text-xs text-muted-foreground">0 fail = Approve | 1 fail = Conditional | 2+ fail = Deny</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          {pending.length > 0 && (
            <SectionCard title={`Pending Review (${pending.length})`} subtitle="Awaiting screening">
              <div className="space-y-2">{pending.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} />)}</div>
            </SectionCard>
          )}
          <SectionCard title={`Approved (${approve.length})`} subtitle="Passed all criteria">
            {approve.length === 0 ? <p className="text-sm text-muted-foreground">None yet</p> : (
              <div className="space-y-2">{approve.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} verdict="approve" />)}</div>
            )}
          </SectionCard>
        </div>

        <SectionCard title={`Conditional (${conditional.length})`} subtitle="1 criterion failed">
          {conditional.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : (
            <div className="space-y-2">{conditional.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} verdict="conditional" />)}</div>
          )}
        </SectionCard>

        <SectionCard title={`Denied (${deny.length})`} subtitle="2+ criteria failed">
          {deny.length === 0 ? <p className="text-sm text-muted-foreground">None</p> : (
            <div className="space-y-2">{deny.map((app: any) => <AppRow key={app.id} app={app} onClick={() => selectApp(app)} verdict="deny" />)}</div>
          )}
        </SectionCard>
      </div>

      <Dialog open={!!selectedApp} onOpenChange={(open: boolean) => { if (!open) { setSelectedApp(null); setEvaluation(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedApp?.fullName ?? selectedApp?.applicantName ?? 'Applicant'}</DialogTitle>
          </DialogHeader>
          {evaluation && <PolicyBadge verdict={evaluation.verdict} className="mb-4" />}
          <div className="mb-4 space-y-1 text-xs text-muted-foreground">
            <p>Email: {selectedApp?.email ?? 'N/A'}</p>
            <p>Income: ${(selectedApp?.income ?? 0).toLocaleString()}/mo</p>
            <p>Credit Score: {selectedApp?.creditScore ?? 'Pending'}</p>
          </div>
          {evalLoading ? (
            <div className="animate-pulse space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 rounded bg-muted" />)}</div>
          ) : evaluation ? (
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">POLICY EVALUATION</p>
              {evaluation.criteria.map((c) => (
                <div key={c.rule} className={`flex items-start gap-3 rounded-lg border p-3 ${c.passed ? 'border-green-500/10 bg-green-500/5' : 'border-red-500/10 bg-red-500/5'}`}>
                  {c.passed ? <CheckCircle size={16} className="mt-0.5 text-green-500" /> : <XCircle size={16} className="mt-0.5 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium">{c.rule.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{c.explanation}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">Actual: {c.actual} | Required: {c.threshold}</p>
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
              <div className="flex items-center gap-2 border-t pt-4">
                <Button size="sm" onClick={() => { setSelectedApp(null); setEvaluation(null); }}><CheckCircle size={14} /> Approve</Button>
                {evaluation.verdict === 'conditional' && <Button size="sm" variant="outline"><AlertTriangle size={14} /> Approve w/ Conditions</Button>}
                <Button size="sm" variant="destructive"><XCircle size={14} /> Deny</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}

function AppRow({ app, onClick, verdict }: { app: any; onClick: () => void; verdict?: 'approve' | 'conditional' | 'deny' }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-muted">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{app.fullName ?? app.applicantName ?? 'Applicant'}</p>
        <p className="truncate text-xs text-muted-foreground">{app.propertyName ?? app.property?.name ?? ''} {app.unitName ?? ''}</p>
      </div>
      {verdict && <PolicyBadge verdict={verdict} />}
      <ArrowRight size={14} className="text-muted-foreground/50" />
    </button>
  );
}
