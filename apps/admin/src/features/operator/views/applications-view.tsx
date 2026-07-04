'use client';

import { useEffect, useState } from 'react';
import { Users, ClipboardList, KeyRound, ShieldCheck } from 'lucide-react';
import type {
  ReadOnlyOperatorData,
  OperatorApplicationItem,
  OperatorApplicationDetail,
  OperatorWorkflowItem,
} from '@/lib/operator/read-only-data';
import {
  loadOperatorApplicationDetail,
  screenOperatorApplication,
  performOperatorApplicationReviewAction,
  convertOperatorApplicationToLease,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { WorkflowFocusBanner, workflowFocusMatchesEntity } from '../components/workflow-focus-banner';
import { formatCurrency, formatNumber } from '../utils';

export function ApplicationsView({
  data,
  loaded,
  token,
  onRefresh,
  workflowFocus,
  onClearWorkflowFocus,
}: {
  data: ReadOnlyOperatorData;
  loaded: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  workflowFocus: OperatorWorkflowItem | null;
  onClearWorkflowFocus: () => void;
}) {
  const workbench = data.applications;
  const [selectedId, setSelectedId] = useState<number | null>(workbench?.applications[0]?.id ?? null);
  const [detail, setDetail] = useState<OperatorApplicationDetail | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewNote, setReviewNote] = useState('');
  const [denialReasonCode, setDenialReasonCode] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [leaseRent, setLeaseRent] = useState('');
  const [leaseDeposit, setLeaseDeposit] = useState('');

  useEffect(() => {
    if (!selectedId && workbench?.applications[0]?.id) {
      setSelectedId(workbench.applications[0].id);
    }
  }, [selectedId, workbench?.applications]);

  useEffect(() => {
    if (workflowFocus?.entityType === 'RentalApplication') {
      const applicationId = Number(workflowFocus.entityId);
      if (Number.isFinite(applicationId)) setSelectedId(applicationId);
    }
  }, [workflowFocus]);

  useEffect(() => {
    if (!selectedId || !token) {
      setDetail(null);
      return;
    }
    let active = true;
    void loadOperatorApplicationDetail(selectedId, { token })
      .then((nextDetail) => {
        if (active) setDetail(nextDetail);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : 'Unable to load application detail.');
      });
    return () => {
      active = false;
    };
  }, [selectedId, token]);

  const selected = detail?.application ?? workbench?.applications?.find((item) => item.id === selectedId) ?? null;

  async function runScreen(applicationId: number) {
    setPending(`screen-${applicationId}`);
    setMessage(null);
    try {
      await screenOperatorApplication(applicationId, { token });
      setMessage('Application screened.');
      await onRefresh();
      setDetail(await loadOperatorApplicationDetail(applicationId, { token }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to screen application.');
    } finally {
      setPending(null);
    }
  }

  async function submitReview(applicationId: number) {
    setPending(`review-${applicationId}`);
    setMessage(null);
    try {
      await performOperatorApplicationReviewAction(applicationId, {
        action: reviewAction,
        note: reviewNote.trim() || undefined,
        reason: reviewAction === 'DENY' ? reviewNote.trim() || 'Denied by operator review.' : undefined,
        reasonCode: reviewAction === 'DENY' ? denialReasonCode || undefined : undefined,
      }, { token });
      setReviewNote('');
      setMessage('Review action recorded.');
      await onRefresh();
      setDetail(await loadOperatorApplicationDetail(applicationId, { token }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to record review action.');
    } finally {
      setPending(null);
    }
  }

  async function submitLease(applicationId: number) {
    setPending(`lease-${applicationId}`);
    setMessage(null);
    try {
      const lease = await convertOperatorApplicationToLease(applicationId, {
        startDate: leaseStart,
        endDate: leaseEnd,
        rentAmount: leaseRent ? Number(leaseRent) : undefined,
        depositAmount: leaseDeposit ? Number(leaseDeposit) : undefined,
        moveInAt: leaseStart,
        noticePeriodDays: 30,
      }, { token });
      setMessage(`Draft lease created: ${lease.id}`);
      await onRefresh();
      setDetail(await loadOperatorApplicationDetail(applicationId, { token }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to convert application to lease.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="applications-title">
      <WorkflowFocusBanner
        item={workflowFocus}
        matched={workflowFocus ? workbench?.applications?.some((item) => workflowFocusMatchesEntity(workflowFocus, 'RentalApplication', item.id)) ?? false : undefined}
        onClear={onClearWorkflowFocus}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Applications" value={formatNumber(workbench?.metrics?.totalApplications)} detail="current workbench" icon={Users} />
        <MetricTile label="Need screening" value={formatNumber(workbench?.metrics?.needsScreening)} detail="ready for policy review" icon={ClipboardList} />
        <MetricTile label="Ready for lease" value={formatNumber(workbench?.metrics?.approvedReadyForLease)} detail="approved handoffs" icon={KeyRound} />
        <MetricTile label="Converted" value={formatNumber(workbench?.metrics?.convertedToLease)} detail="draft leases created" icon={ShieldCheck} />
      </div>

      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="applications-title" className="text-lg font-semibold">Tenant application to lease</h2>
          <p className="text-sm text-[var(--muted)]">Review applications, inspect policy evidence, and create draft leases from approved applicants.</p>
        </div>
        <span className="text-sm text-[var(--muted)]">{loaded && workbench ? new Date(workbench.generatedAt).toLocaleString() : 'Waiting for data'}</span>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      {!workbench ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          No application workbench returned by `/api/operator-applications`.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
            <div className="border-b border-[var(--border)] px-4 py-3">
              <h3 className="font-semibold">Application queue</h3>
            </div>
            {workbench.applications.length === 0 ? (
              <div className="px-4 py-4 text-sm text-[var(--muted)]">No rental applications returned.</div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {workbench.applications.map((application) => (
                  <ApplicationQueueRow
                    key={application.id}
                    application={application}
                    active={application.id === selectedId}
                    onSelect={() => setSelectedId(application.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
            <div className="border-b border-[var(--border)] px-4 py-3">
              <h3 className="font-semibold">Review and lease handoff</h3>
            </div>
            {!selected ? (
              <div className="px-4 py-4 text-sm text-[var(--muted)]">Select an application.</div>
            ) : (
              <div className="space-y-5 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{selected.applicantName}</h4>
                    <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{selected.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{selected.propertyName ?? 'No property'} {selected.unitLabel ? `- ${selected.unitLabel}` : ''}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-[var(--muted)]">Income</span><div className="font-medium">{formatCurrency(selected.income)}</div></div>
                    <div><span className="text-[var(--muted)]">Score</span><div className="font-medium">{selected.screeningScore ?? 'Not screened'}</div></div>
                    <div><span className="text-[var(--muted)]">Credit</span><div className="font-medium">{selected.creditScore ?? 'Missing'}</div></div>
                    <div><span className="text-[var(--muted)]">Next</span><div className="font-medium">{selected.nextAction.replaceAll('_', ' ')}</div></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    disabled={pending === `screen-${selected.id}`}
                    onClick={() => void runScreen(selected.id)}
                    className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {pending === `screen-${selected.id}` ? 'Screening' : 'Run screening'}
                  </button>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select value={reviewAction} onChange={(event) => setReviewAction(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Application review action">
                      {workbench.reviewActions.map((action) => <option key={action} value={action}>{action.replaceAll('_', ' ')}</option>)}
                    </select>
                    {reviewAction === 'DENY' ? (
                      <select value={denialReasonCode} onChange={(event) => setDenialReasonCode(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Denial reason code">
                        <option value="">Reason code</option>
                        {workbench.denialReasonCodes.map((code) => <option key={code} value={code}>{code.replaceAll('_', ' ')}</option>)}
                      </select>
                    ) : null}
                  </div>
                  <textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] p-2 text-sm" aria-label="Review note or denial reason" placeholder="Review note or denial reason" />
                  <button
                    disabled={pending === `review-${selected.id}`}
                    onClick={() => void submitReview(selected.id)}
                    className="w-full rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {pending === `review-${selected.id}` ? 'Saving review' : 'Save review action'}
                  </button>
                </div>

                <div className="space-y-2 border-t border-[var(--border)] pt-4">
                  <div className="text-sm font-semibold">Draft lease</div>
                  {detail?.leaseHandoff?.readinessWarnings.length ? (
                    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2 text-xs text-[var(--muted)]">
                      {detail.leaseHandoff.readinessWarnings.join(' ')}
                    </div>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input type="date" value={leaseStart} onChange={(event) => setLeaseStart(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Lease start" />
                    <input type="date" value={leaseEnd} onChange={(event) => setLeaseEnd(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Lease end" />
                    <input value={leaseRent} onChange={(event) => setLeaseRent(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Lease rent amount" placeholder={`Rent ${detail?.leaseHandoff?.recommendedRentAmount ?? ''}`} />
                    <input value={leaseDeposit} onChange={(event) => setLeaseDeposit(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Lease deposit amount" placeholder={`Deposit ${detail?.leaseHandoff?.recommendedDepositAmount ?? ''}`} />
                  </div>
                  <button
                    disabled={selected.nextAction !== 'convert_to_lease' || pending === `lease-${selected.id}` || !leaseStart || !leaseEnd}
                    onClick={() => void submitLease(selected.id)}
                    className="w-full rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {pending === `lease-${selected.id}` ? 'Creating lease' : 'Create draft lease'}
                  </button>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <div className="mb-2 text-sm font-semibold">Evidence</div>
                  <div className="space-y-2 text-xs text-[var(--muted)]">
                    <div>Policy: {JSON.stringify(detail?.policyEvaluation ?? {}).slice(0, 220)}</div>
                    <div>Lifecycle: {JSON.stringify(detail?.lifecycle ?? {}).slice(0, 180)}</div>
                    <div>Timeline events: {detail?.timeline.length ?? 0}</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}

export function ApplicationQueueRow({
  application,
  active,
  onSelect,
}: {
  application: OperatorApplicationItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`grid w-full gap-3 px-4 py-4 text-left md:grid-cols-[1fr_140px_150px_130px] md:items-center ${active ? 'bg-[var(--panel-strong)]' : 'hover:bg-[var(--panel-strong)]'}`}
    >
      <div>
        <div className="font-medium">{application.applicantName}</div>
        <div className="mt-1 text-xs text-[var(--muted)]">{application.email} · {application.propertyName ?? 'No property'} {application.unitLabel ? `- ${application.unitLabel}` : ''}</div>
      </div>
      <div className="text-sm">{application.status.replaceAll('_', ' ')}</div>
      <div className="text-sm">{application.screeningScore ?? 'Not screened'}</div>
      <div className="text-xs text-[var(--muted)]">{application.nextAction.replaceAll('_', ' ')}</div>
    </button>
  );
}
