'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReadOnlyOperatorData, OperatorRenewalItem, OperatorWorkflowItem } from '@/lib/operator/read-only-data';
import {
  createOperatorRenewalOffer,
  recordOperatorRenewalResponse,
  sendOperatorRenewalSignature,
  refreshOperatorRenewalEnvelope,
  recordOperatorRenewalMoveOut,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { WorkflowFocusBanner, workflowFocusMatchesEntity, useFocusedRowScroll } from '../components/workflow-focus-banner';
import { cents, formatCurrency, formatNumber } from '../utils';
import { CalendarClock, ClipboardList, Inbox, KeyRound, Loader2, PenLine, ShieldCheck } from 'lucide-react';

export function RenewalsView({
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
  const workbench = data.renewals;
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rentByLease, setRentByLease] = useState<Record<string, string>>({});
  const [noteByLease, setNoteByLease] = useState<Record<string, string>>({});
  const [moveOutByLease, setMoveOutByLease] = useState<Record<string, string>>({});



  async function run(item: OperatorRenewalItem, action: 'offer' | 'accept' | 'decline' | 'signature' | 'refresh' | 'moveout') {
    setPending(`${action}-${item.leaseId}`);
    setMessage(null);
    try {
      const note = noteByLease[item.leaseId] ?? '';
      if (action === 'offer') {
        const start = new Date(item.endDate);
        start.setDate(start.getDate() + 1);
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        await createOperatorRenewalOffer(item.leaseId, {
          proposedRent: rentByLease[item.leaseId] ? Number(rentByLease[item.leaseId]) : item.currentRent,
          proposedStart: start.toISOString(),
          proposedEnd: end.toISOString(),
          message: note.trim() || undefined,
        }, { token });
        setMessage('Renewal offer created.');
      }
      if ((action === 'accept' || action === 'decline') && item.latestOffer) {
        await recordOperatorRenewalResponse(item.leaseId, item.latestOffer.id, {
          decision: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
          message: note.trim() || undefined,
        }, { token });
        setMessage(`Renewal ${action === 'accept' ? 'accepted' : 'declined'}.`);
      }
      if (action === 'signature') {
        await sendOperatorRenewalSignature(item.leaseId, {
          signerEmail: item.tenantEmail ?? undefined,
          signerName: item.tenantName,
          message: note.trim() || undefined,
        }, { token });
        setMessage('Renewal signature envelope sent.');
      }
      if (action === 'refresh' && item.latestEnvelope) {
        await refreshOperatorRenewalEnvelope(item.latestEnvelope.id, { token });
        setMessage('Renewal signature status refreshed.');
      }
      if (action === 'moveout') {
        const moveOutAt = moveOutByLease[item.leaseId] || item.endDate?.slice(0, 10);
        await recordOperatorRenewalMoveOut(item.leaseId, {
          moveOutAt,
          message: note.trim() || undefined,
          deliveryMethod: 'PORTAL',
        }, { token });
        setMessage('Move-out notice recorded.');
      }
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Renewal action failed.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="renewals-title">
      <WorkflowFocusBanner
        item={workflowFocus}
        matched={workflowFocus ? workbench?.leases?.some((item) => workflowFocusMatchesEntity(workflowFocus, 'Lease', item.leaseId)) ?? false : undefined}
        onClear={onClearWorkflowFocus}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricTile label="Expiring" value={formatNumber(workbench?.metrics?.expiringLeases)} detail="leases in window" icon={CalendarClock} />
        <MetricTile label="Need offer" value={formatNumber(workbench?.metrics?.needsOffer)} detail="no active offer" icon={ClipboardList} />
        <MetricTile label="Pending" value={formatNumber(workbench?.metrics?.offersPending)} detail="awaiting response" icon={Inbox} />
        <MetricTile label="Accepted" value={formatNumber(workbench?.metrics?.offersAccepted)} detail="ready to sign" icon={ShieldCheck} />
        <MetricTile label="Signatures" value={formatNumber(workbench?.metrics?.signaturesPending)} detail="pending envelopes" icon={PenLine} />
        <MetricTile label="Move-outs" value={formatNumber(workbench?.metrics?.moveOutNotices)} detail="notice given" icon={KeyRound} />
      </div>

      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="renewals-title" className="text-lg font-semibold">Renewal offer to signed renewal or move-out</h2>
          <p className="text-sm text-[var(--muted)]">Create renewal offers, record tenant decisions, send signature packets, or capture move-out notices.</p>
        </div>
        <span className="text-sm text-[var(--muted)]">{loaded && workbench ? new Date(workbench.generatedAt).toLocaleString() : 'Waiting for data'}</span>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      {!workbench ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          No renewals workbench returned by `/api/operator-renewals`.
        </div>
      ) : (
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="font-semibold">Renewal queue</h3>
          </div>
          {workbench.leases.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">No expiring leases returned.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {workbench.leases.map((item) => (
                <RenewalRow
                  key={item.leaseId}
                  item={item}
                  focused={workflowFocusMatchesEntity(workflowFocus, 'Lease', item.leaseId)}
                  pending={pending?.endsWith(item.leaseId) ?? false}
                  rent={rentByLease[item.leaseId] ?? ''}
                  note={noteByLease[item.leaseId] ?? ''}
                  moveOutAt={moveOutByLease[item.leaseId] ?? ''}
                  onRentChange={(value) => setRentByLease((current) => ({ ...current, [item.leaseId]: value }))}
                  onNoteChange={(value) => setNoteByLease((current) => ({ ...current, [item.leaseId]: value }))}
                  onMoveOutChange={(value) => setMoveOutByLease((current) => ({ ...current, [item.leaseId]: value }))}
                  onAction={(action) => void run(item, action)}
                  unitId={item.unitId}
                />
              ))}
            </div>
          )}
        </section>
      )}

    </section>
  );
}

export function RenewalRow({
  item,
  focused,
  pending,
  rent,
  note,
  moveOutAt,
  onRentChange,
  onNoteChange,
  onMoveOutChange,
  onAction,

}: {
  item: OperatorRenewalItem;
  focused: boolean;
  pending: boolean;
  rent: string;
  note: string;
  moveOutAt: string;
  onRentChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onMoveOutChange: (value: string) => void;
  onAction: (action: 'offer' | 'accept' | 'decline' | 'signature' | 'refresh' | 'moveout') => void;
  unitId: string;
}) {
  const focusedRef = useFocusedRowScroll(focused);
  return (
    <article ref={focusedRef} className={`grid gap-4 px-4 py-4 xl:grid-cols-[1fr_280px_280px] xl:items-start ${focused ? 'bg-[var(--panel-strong)]' : ''}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{item.tenantName}</h4>
          {focused ? <span className="rounded-sm bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white">Focused workflow item</span> : null}
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.leaseStatus}</span>
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.nextAction.replaceAll('_', ' ')}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">{item.propertyName ?? 'No property'} {item.unitLabel ? `- ${item.unitLabel}` : ''}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>Rent {cents(item.currentRentCents) ?? formatCurrency(item.currentRent)}</span>
          <span>Ends {new Date(item.endDate).toLocaleDateString()}</span>
          {item.renewalDueAt ? <span>Due {new Date(item.renewalDueAt).toLocaleDateString()}</span> : null}
          {item.latestOffer ? <span>Offer {item.latestOffer.status} · {cents(item.latestOffer.proposedRentCents) ?? formatCurrency(item.latestOffer.proposedRent)}</span> : null}
          {item.latestEnvelope ? <span>Envelope {item.latestEnvelope.status}</span> : null}
          {item.latestNotice ? <span>Notice {item.latestNotice.type}</span> : null}
        </div>
        {(item.blockers?.length ?? 0) > 0 ? <div className="mt-3 text-xs text-[var(--danger)]">{item.blockers?.join(' ')}</div> : null}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input value={rent} onChange={(event) => onRentChange(event.target.value)} className="h-10 flex-1 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm outline-none focus:border-[var(--accent)]" aria-label="Renewal rent amount" placeholder={`Rent ${item.currentRent}`} />
          <Link href={`/renewals/pricing?unitId=${item.unitId}`} className="flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm hover:bg-[var(--accent)] hover:text-white">
            Optimize Price
          </Link>
        </div>
        <input type="date" value={moveOutAt} onChange={(event) => onMoveOutChange(event.target.value)} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm outline-none focus:border-[var(--accent)]" aria-label="Move-out date" />
        <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} className="min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] p-2 text-sm outline-none focus:border-[var(--accent)]" aria-label="Renewal note" placeholder="Offer message, response note, or move-out reason" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <button disabled={pending || item.nextAction === 'blocked'} onClick={() => onAction('offer')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">Create offer</button>
        <button disabled={pending || !item.latestOffer || item.latestOffer.status !== 'OFFERED'} onClick={() => onAction('accept')} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Record accept</button>
        <button disabled={pending || !item.latestOffer || item.latestOffer.status !== 'OFFERED'} onClick={() => onAction('decline')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">Record decline</button>
        <button disabled={pending || item.nextAction === 'blocked' || item.nextAction === 'create_offer'} onClick={() => onAction('signature')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">Send signature</button>
        <button disabled={pending || !item.latestEnvelope} onClick={() => onAction('refresh')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">Refresh signature</button>
        <button disabled={pending} onClick={() => onAction('moveout')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">Record move-out</button>
      </div>
    </article>
  );
}
