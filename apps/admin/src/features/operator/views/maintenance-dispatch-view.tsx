'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowUpRight, ClipboardList, ShieldCheck, Users, Wrench } from 'lucide-react';
import type {
  ReadOnlyOperatorData,
  OperatorMaintenanceDispatchItem,
  OperatorWorkflowItem,
} from '@/lib/operator/read-only-data';
import {
  dispatchMaintenanceVendor,
  requestMaintenanceVendorBid,
  awardMaintenanceVendorBid,
  completeMaintenanceVendorDispatch,
  rejectMaintenanceVendorBid,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { WorkflowFocusBanner, workflowFocusMatchesEntity, useFocusedRowScroll } from '../components/workflow-focus-banner';
import { formatNumber, cents } from '../utils';

export function MaintenanceDispatchView({
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
  const workbench = data.maintenanceDispatch;
  const [selectedVendorByRequest, setSelectedVendorByRequest] = useState<Record<string, string>>({});
  const [notifyByRequest, setNotifyByRequest] = useState<Record<string, boolean>>({});
  const [noteByRequest, setNoteByRequest] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);



  async function dispatch(item: OperatorMaintenanceDispatchItem) {
    const vendorId = selectedVendorByRequest[item.requestId];
    if (!vendorId) {
      setMessage('Select a vendor before dispatching.');
      return;
    }
    setPending(`dispatch-${item.requestId}`);
    setMessage(null);
    try {
      const note = noteByRequest[item.requestId] ?? '';
      await dispatchMaintenanceVendor(item.requestId, {
        vendorId,
        notes: note.trim() || undefined,
        notifyTenant: Boolean(notifyByRequest[item.requestId]),
        tenantMessage: notifyByRequest[item.requestId] ? `A vendor has been dispatched for ${item.title}. ${note}`.trim() : undefined,
      }, { token });
      setMessage('Vendor dispatched.');
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to dispatch vendor.');
    } finally {
      setPending(null);
    }
  }

  async function requestBid(item: OperatorMaintenanceDispatchItem) {
    const vendorId = selectedVendorByRequest[item.requestId];
    setPending(`bid-${item.requestId}`);
    setMessage(null);
    try {
      await requestMaintenanceVendorBid(item.requestId, {
        vendorId: vendorId || undefined,
        scope: noteByRequest[item.requestId]?.trim() || item.description,
      }, { token });
      setMessage('Vendor bid requested.');
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to request vendor bid.');
    } finally {
      setPending(null);
    }
  }

  async function awardBid(item: OperatorMaintenanceDispatchItem) {
    if (!item.latestBid) return;
    setPending(`award-${item.requestId}`);
    setMessage(null);
    try {
      const note = noteByRequest[item.requestId] ?? '';
      await awardMaintenanceVendorBid(item.latestBid.id, {
        note: note.trim() || undefined,
        notifyTenant: Boolean(notifyByRequest[item.requestId]),
        tenantMessage: notifyByRequest[item.requestId] ? `A vendor bid has been approved for ${item.title}. ${note}`.trim() : undefined,
      }, { token });
      setMessage('Vendor bid awarded.');
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to award vendor bid.');
    } finally {
      setPending(null);
    }
  }

  async function completeDispatch(item: OperatorMaintenanceDispatchItem) {
    if (!item.latestDispatch) return;
    setPending(`complete-${item.requestId}`);
    setMessage(null);
    try {
      await completeMaintenanceVendorDispatch(item.latestDispatch.id, {
        note: noteByRequest[item.requestId]?.trim() || 'Vendor dispatch completed.',
      }, { token });
      setMessage('Vendor dispatch completed.');
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to complete vendor dispatch.');
    } finally {
      setPending(null);
    }
  }

  async function rejectBid(item: OperatorMaintenanceDispatchItem) {
    if (!item.latestBid) return;
    setPending(`reject-${item.requestId}`);
    setMessage(null);
    try {
      await rejectMaintenanceVendorBid(item.latestBid.id, {
        reason: noteByRequest[item.requestId]?.trim() || undefined,
      }, { token });
      setMessage('Vendor bid rejected.');
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reject vendor bid.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="maintenance-dispatch-title">
      <WorkflowFocusBanner
        item={workflowFocus}
        matched={workflowFocus ? workbench?.requests?.some((item) => workflowFocusMatchesEntity(workflowFocus, 'MaintenanceRequest', item.requestId)) ?? false : undefined}
        onClear={onClearWorkflowFocus}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricTile label="Open" value={formatNumber(workbench?.metrics?.openRequests)} detail="active requests" icon={Wrench} />
        <MetricTile label="Emergency" value={formatNumber(workbench?.metrics?.emergencyRequests)} detail="high priority" icon={AlertTriangle} />
        <MetricTile label="Unassigned" value={formatNumber(workbench?.metrics?.unassignedRequests)} detail="needs owner" icon={Users} />
        <MetricTile label="Vendor ready" value={formatNumber(workbench?.metrics?.vendorReadyRequests)} detail="dispatch candidates" icon={ArrowUpRight} />
        <MetricTile label="Open bids" value={formatNumber(workbench?.metrics?.bidsOpen)} detail="vendor responses" icon={ClipboardList} />
        <MetricTile label="Dispatched" value={formatNumber(workbench?.metrics?.dispatchedRequests)} detail="vendors active" icon={Wrench} />
        <MetricTile label="Complete" value={formatNumber(workbench?.metrics?.completedDispatches)} detail="vendor finished" icon={ShieldCheck} />
      </div>



      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="maintenance-dispatch-title" className="text-lg font-semibold">Maintenance request to vendor dispatch</h2>
          <p className="text-sm text-[var(--muted)]">Triage open requests, request contractor bids, dispatch vendors, and optionally notify tenants.</p>
        </div>
        <span className="text-sm text-[var(--muted)]">{loaded && workbench ? new Date(workbench.generatedAt).toLocaleString() : 'Waiting for data'}</span>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      {!workbench ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          No maintenance dispatch workbench returned by `/api/operator-maintenance-dispatch`.
        </div>
      ) : (
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="font-semibold">Dispatch queue</h3>
          </div>
          {workbench.requests.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">No open maintenance requests returned.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {workbench.requests.map((item) => (
                <MaintenanceDispatchRow
                  key={item.requestId}
                  item={item}
                  vendors={workbench.vendors}
                  focused={workflowFocusMatchesEntity(workflowFocus, 'MaintenanceRequest', item.requestId)}
                  selectedVendor={selectedVendorByRequest[item.requestId] ?? ''}
                  note={noteByRequest[item.requestId] ?? ''}
                  notifyTenant={Boolean(notifyByRequest[item.requestId])}
                  pending={pending?.endsWith(item.requestId) ?? false}
                  onVendorChange={(vendorId) => setSelectedVendorByRequest((current) => ({ ...current, [item.requestId]: vendorId }))}
                  onNoteChange={(note) => setNoteByRequest((current) => ({ ...current, [item.requestId]: note }))}
                  onNotifyChange={(notify) => setNotifyByRequest((current) => ({ ...current, [item.requestId]: notify }))}
                  onDispatch={() => void dispatch(item)}
                  onRequestBid={() => void requestBid(item)}
                  onAwardBid={() => void awardBid(item)}
                  onCompleteDispatch={() => void completeDispatch(item)}
                  onRejectBid={() => void rejectBid(item)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export function MaintenanceDispatchRow({
  item,
  vendors,
  focused,
  selectedVendor,
  note,
  notifyTenant,
  pending,
  onVendorChange,
  onNoteChange,
  onNotifyChange,
  onDispatch,
  onRequestBid,
  onAwardBid,
  onCompleteDispatch,
  onRejectBid,
}: {
  item: OperatorMaintenanceDispatchItem;
  vendors: NonNullable<ReadOnlyOperatorData['maintenanceDispatch']>['vendors'];
  focused: boolean;
  selectedVendor: string;
  note: string;
  notifyTenant: boolean;
  pending: boolean;
  onVendorChange: (vendorId: string) => void;
  onNoteChange: (note: string) => void;
  onNotifyChange: (notify: boolean) => void;
  onDispatch: () => void;
  onRequestBid: () => void;
  onAwardBid: () => void;
  onCompleteDispatch: () => void;
  onRejectBid: () => void;
}) {
  const hasAwardableBid = Boolean(item.latestBid && !['AWARDED', 'COMPLETED', 'REJECTED'].includes(item.latestBid.status));
  const hasRejectableBid = Boolean(item.latestBid && !['AWARDED', 'COMPLETED', 'REJECTED'].includes(item.latestBid.status));
  const hasActiveDispatch = Boolean(item.latestDispatch && item.latestDispatch.status === 'AWARDED');
  const focusedRef = useFocusedRowScroll(focused);

  return (
    <article ref={focusedRef} className={`grid gap-4 px-4 py-4 xl:grid-cols-[1fr_280px_260px] xl:items-start ${focused ? 'bg-[var(--panel-strong)]' : ''}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{item.title}</h4>
          {focused ? <span className="rounded-sm bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white">Focused workflow item</span> : null}
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.priority}</span>
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.nextAction.replaceAll('_', ' ')}</span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{item.description}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>{item.propertyName ?? 'No property'} {item.unitLabel ? `- ${item.unitLabel}` : ''}</span>
          <span>Tenant {item.tenantName}</span>
          <span>Assignee {item.assigneeName ?? 'none'}</span>
          <span>{item.bidsCount} bids</span>
          {item.responseDueAt ? <span>Response due {new Date(item.responseDueAt).toLocaleString()}</span> : null}
        </div>
        {item.latestBid ? (
          <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2 text-xs text-[var(--muted)]">
            Latest bid: {item.latestBid.vendorName ?? 'Vendor'} · {item.latestBid.status} {cents(item.latestBid.bidAmountCents) ? `· ${cents(item.latestBid.bidAmountCents)}` : ''}
          </div>
        ) : null}
        {item.latestDispatch ? (
          <div className="mt-2 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2 text-xs text-[var(--muted)]">
            Dispatch: {item.latestDispatch.vendorName ?? 'Vendor'} · {item.latestDispatch.status}
            {item.latestDispatch.awardedAt ? ` · awarded ${new Date(item.latestDispatch.awardedAt).toLocaleDateString()}` : ''}
            {item.latestDispatch.responseNotes ? <div className="mt-1">{item.latestDispatch.responseNotes}</div> : null}
          </div>
        ) : null}
        {(item.dispatchHistory?.length ?? 0) > 1 ? (
          <div className="mt-2 text-xs text-[var(--muted)]">
            Dispatch history: {item.dispatchHistory?.map((dispatch) => `${dispatch.vendorName ?? 'Vendor'} ${dispatch.status}`).join(' · ')}
          </div>
        ) : null}
        {(item.blockers?.length ?? 0) > 0 ? <div className="mt-3 text-xs text-[var(--danger)]">{item.blockers?.join(' ')}</div> : null}
      </div>

      <div className="space-y-2">
        <select value={selectedVendor} onChange={(event) => onVendorChange(event.target.value)} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Maintenance vendor">
          <option value="">Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>{vendor.name} · {vendor.complianceStatus}</option>
          ))}
        </select>
        <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} className="min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] p-2 text-sm" aria-label="Maintenance dispatch note" placeholder="Scope, access notes, tenant instructions" />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input type="checkbox" checked={notifyTenant} onChange={(event) => onNotifyChange(event.target.checked)} />
          Notify tenant
        </label>
      </div>

      <div className="grid gap-2">
        <button disabled={pending || item.nextAction === 'blocked'} onClick={onRequestBid} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Request bid
        </button>
        <button disabled={pending || item.nextAction === 'blocked'} onClick={onDispatch} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          Dispatch vendor
        </button>
        <button disabled={pending || !hasAwardableBid} onClick={onAwardBid} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Award bid
        </button>
        <button disabled={pending || !hasActiveDispatch} onClick={onCompleteDispatch} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Complete dispatch
        </button>
        <button disabled={pending || !hasRejectableBid} onClick={onRejectBid} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--danger)] disabled:opacity-50">
          Reject bid
        </button>
      </div>
    </article>
  );
}
