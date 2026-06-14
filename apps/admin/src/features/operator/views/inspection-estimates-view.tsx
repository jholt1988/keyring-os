'use client';

import { useState } from 'react';
import { AlertTriangle, ClipboardList, Inbox, PenLine, ShieldCheck, Wrench } from 'lucide-react';
import type {
  ReadOnlyOperatorData,
  OperatorInspectionEstimateItem,
  OperatorWorkflowItem,
} from '@/lib/operator/read-only-data';
import {
  generateInspectionRepairEstimate,
  approveInspectionRepairEstimate,
  rejectInspectionRepairEstimate,
  createRepairRequestFromEstimate,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { WorkflowFocusBanner, workflowFocusMatchesEntity, useFocusedRowScroll } from '../components/workflow-focus-banner';
import { formatCurrency, formatNumber } from '../utils';

export function InspectionEstimatesView({
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
  const workbench = data.inspectionEstimates;
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [noteByEstimate, setNoteByEstimate] = useState<Record<string, string>>({});

  async function run(item: OperatorInspectionEstimateItem, action: 'generate' | 'approve' | 'reject' | 'repair') {
    const estimate = item.latestEstimate;
    setPending(`${action}-${item.inspectionId}`);
    setMessage(null);
    try {
      if (action === 'generate') {
        await generateInspectionRepairEstimate(item.inspectionId, { token });
        setMessage('Repair estimate generated.');
      }
      if (action === 'approve' && estimate) {
        await approveInspectionRepairEstimate(estimate.id, { token });
        setMessage('Repair estimate approved.');
      }
      if (action === 'reject' && estimate) {
        await rejectInspectionRepairEstimate(estimate.id, noteByEstimate[estimate.id] ?? '', { token });
        setMessage('Repair estimate rejected.');
      }
      if (action === 'repair' && estimate) {
        await createRepairRequestFromEstimate(estimate.id, {
          title: `Inspection repair - ${item.unitLabel ?? item.unitId}`,
          priority: estimate.totalProjectCost >= 1500 ? 'HIGH' : estimate.totalProjectCost <= 250 ? 'LOW' : 'MEDIUM',
        }, { token });
        setMessage('Maintenance repair request created.');
      }
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Inspection estimate action failed.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="inspection-estimates-title">
      <WorkflowFocusBanner
        item={workflowFocus}
        matched={workflowFocus ? workbench?.inspections.some((item) => workflowFocusMatchesEntity(workflowFocus, 'InspectionRequest', item.inspectionId)) ?? false : undefined}
        onClear={onClearWorkflowFocus}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricTile label="Completed" value={formatNumber(workbench?.metrics.completedInspections)} detail="inspections" icon={ClipboardList} />
        <MetricTile label="Need estimate" value={formatNumber(workbench?.metrics.inspectionsNeedingEstimate)} detail="findings ready" icon={AlertTriangle} />
        <MetricTile label="Draft" value={formatNumber(workbench?.metrics.draftEstimates)} detail="estimates" icon={Inbox} />
        <MetricTile label="Pending review" value={formatNumber(workbench?.metrics.pendingReviewEstimates)} detail="operator approval" icon={ShieldCheck} />
        <MetricTile label="Approved" value={formatNumber(workbench?.metrics.approvedEstimates)} detail="repair scope" icon={PenLine} />
        <MetricTile label="Repair ready" value={formatNumber(workbench?.metrics.repairReadyEstimates)} detail="needs request" icon={Wrench} />
      </div>

      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="inspection-estimates-title" className="text-lg font-semibold">Inspection to repair estimate</h2>
          <p className="text-sm text-[var(--muted)]">Turn completed inspection findings into repair estimates, approve scope, and create maintenance repair work.</p>
        </div>
        <span className="text-sm text-[var(--muted)]">{loaded && workbench ? new Date(workbench.generatedAt).toLocaleString() : 'Waiting for data'}</span>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      {!workbench ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          No inspection estimates workbench returned by `/api/operator-inspection-estimates`.
        </div>
      ) : (
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="font-semibold">Estimate queue</h3>
          </div>
          {workbench.inspections.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">No inspections returned.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {workbench.inspections.map((item) => (
                <InspectionEstimateRow
                  key={item.inspectionId}
                  item={item}
                  focused={workflowFocusMatchesEntity(workflowFocus, 'InspectionRequest', item.inspectionId)}
                  pending={pending?.endsWith(String(item.inspectionId)) ?? false}
                  reviewNote={item.latestEstimate ? noteByEstimate[item.latestEstimate.id] ?? '' : ''}
                  onReviewNoteChange={(note) => {
                    if (!item.latestEstimate) return;
                    setNoteByEstimate((current) => ({ ...current, [item.latestEstimate!.id]: note }));
                  }}
                  onAction={(action) => void run(item, action)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export function InspectionEstimateRow({
  item,
  focused,
  pending,
  reviewNote,
  onReviewNoteChange,
  onAction,
}: {
  item: OperatorInspectionEstimateItem;
  focused: boolean;
  pending: boolean;
  reviewNote: string;
  onReviewNoteChange: (note: string) => void;
  onAction: (action: 'generate' | 'approve' | 'reject' | 'repair') => void;
}) {
  const estimate = item.latestEstimate;
  const focusedRef = useFocusedRowScroll(focused);
  return (
    <article ref={focusedRef} className={`grid gap-4 px-4 py-4 xl:grid-cols-[1fr_260px_260px] xl:items-start ${focused ? 'bg-[var(--panel-strong)]' : ''}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{item.type.replaceAll('_', ' ')}</h4>
          {focused ? <span className="rounded-sm bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white">Focused workflow item</span> : null}
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.status}</span>
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.nextAction.replaceAll('_', ' ')}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{item.propertyName ?? 'No property'} {item.unitLabel ? `- ${item.unitLabel}` : ''}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>{item.findingsCount} findings</span>
          <span>{item.photosCount} photos</span>
          <span>{item.estimateCount} estimates</span>
          <span>Scheduled {new Date(item.scheduledDate).toLocaleDateString()}</span>
          {item.completedDate ? <span>Completed {new Date(item.completedDate).toLocaleDateString()}</span> : null}
        </div>
        {item.blockers.length > 0 ? <div className="mt-3 text-xs text-[var(--danger)]">{item.blockers.join(' ')}</div> : null}
      </div>

      <div className="text-sm">
        <div className="font-medium">Latest estimate</div>
        {estimate ? (
          <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
            <div>Status: {estimate.status}</div>
            <div>Total: {formatCurrency(estimate.totalProjectCost)}</div>
            <div>Labor: {formatCurrency(estimate.totalLaborCost)} · Materials: {formatCurrency(estimate.totalMaterialCost)}</div>
            <div>{estimate.lineItemCount} line items</div>
            {estimate.maintenanceRequestId ? <div>Repair request {estimate.maintenanceRequestId}</div> : null}
          </div>
        ) : (
          <div className="mt-2 text-xs text-[var(--muted)]">No estimate generated.</div>
        )}
        {estimate ? (
          <textarea value={reviewNote} onChange={(event) => onReviewNoteChange(event.target.value)} className="mt-3 min-h-16 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] p-2 text-sm" aria-label="Inspection estimate review note" placeholder="Reject reason or repair note" />
        ) : null}
      </div>

      <div className="grid gap-2">
        <button disabled={pending || item.nextAction === 'blocked'} onClick={() => onAction('generate')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Generate estimate
        </button>
        <button disabled={pending || !estimate || !['DRAFT', 'PENDING_REVIEW'].includes(estimate.status)} onClick={() => onAction('approve')} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          Approve estimate
        </button>
        <button disabled={pending || !estimate || estimate.status === 'APPROVED'} onClick={() => onAction('reject')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Reject estimate
        </button>
        <button disabled={pending || !estimate || estimate.status !== 'APPROVED' || Boolean(estimate.maintenanceRequestId)} onClick={() => onAction('repair')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Create repair request
        </button>
      </div>
    </article>
  );
}
