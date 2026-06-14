'use client';

import { useState } from 'react';
import { AlertTriangle, ClipboardList, KeyRound, PenLine, ShieldCheck } from 'lucide-react';
import type {
  ReadOnlyOperatorData,
  OperatorLeaseSigningItem,
  OperatorWorkflowItem,
} from '@/lib/operator/read-only-data';
import {
  generateLeaseSigningPacket,
  sendLeaseSigningEnvelope,
  refreshLeaseSigningEnvelope,
  resendLeaseSigningEnvelope,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { WorkflowFocusBanner, workflowFocusMatchesEntity, useFocusedRowScroll } from '../components/workflow-focus-banner';
import { formatCurrency, formatNumber } from '../utils';

export function LeaseSigningView({
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
  const workbench = data.leaseSigning;
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runAction(item: OperatorLeaseSigningItem, action: 'packet' | 'send' | 'refresh' | 'resend') {
    setPending(`${action}-${item.leaseId}`);
    setMessage(null);
    try {
      if (action === 'packet') {
        await generateLeaseSigningPacket(item.leaseId, { token });
        setMessage('Lease packet generated.');
      }
      if (action === 'send') {
        await sendLeaseSigningEnvelope(item.leaseId, {
          signerEmail: item.tenantEmail ?? undefined,
          signerName: item.tenantName,
          templateId: 'LEASE_PACKET_V1',
        }, { token });
        setMessage('Signature envelope sent.');
      }
      if (action === 'refresh' && item.latestEnvelope) {
        await refreshLeaseSigningEnvelope(item.latestEnvelope.id, { token });
        setMessage('Envelope status refreshed.');
      }
      if (action === 'resend' && item.latestEnvelope) {
        await resendLeaseSigningEnvelope(item.latestEnvelope.id, { token });
        setMessage('Signature notification resent.');
      }
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Lease signing action failed.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="lease-signing-title">
      <WorkflowFocusBanner
        item={workflowFocus}
        matched={workflowFocus ? workbench?.items.some((item) => workflowFocusMatchesEntity(workflowFocus, 'Lease', item.leaseId)) ?? false : undefined}
        onClear={onClearWorkflowFocus}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Draft leases" value={formatNumber(workbench?.metrics.draftLeases)} detail="signing candidates" icon={ClipboardList} />
        <MetricTile label="Packets ready" value={formatNumber(workbench?.metrics.packetsReady)} detail="ready to send" icon={ShieldCheck} />
        <MetricTile label="Sent envelopes" value={formatNumber(workbench?.metrics.envelopesSent)} detail="waiting on signatures" icon={PenLine} />
        <MetricTile label="Completed" value={formatNumber(workbench?.metrics.signaturesCompleted)} detail="signed packets" icon={KeyRound} />
        <MetricTile label="At risk" value={formatNumber(workbench?.metrics.riskItems)} detail="signature follow-up" icon={AlertTriangle} />
      </div>

      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="lease-signing-title" className="text-lg font-semibold">Lease signing workflow</h2>
          <p className="text-sm text-[var(--muted)]">Generate lease packets, send e-signature envelopes, monitor completion, and resend pending signature requests.</p>
        </div>
        <span className="text-sm text-[var(--muted)]">{loaded && workbench ? new Date(workbench.generatedAt).toLocaleString() : 'Waiting for data'}</span>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      {!workbench ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          No lease signing workbench returned by `/api/operator-lease-signing`.
        </div>
      ) : (
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="font-semibold">Signing queue</h3>
          </div>
          {workbench.items.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">No draft or signing leases returned.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {workbench.items.map((item) => (
                <LeaseSigningRow
                  key={item.leaseId}
                  item={item}
                  pending={pending}
                  focused={workflowFocusMatchesEntity(workflowFocus, 'Lease', item.leaseId)}
                  onAction={(action) => void runAction(item, action)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export function LeaseSigningRow({
  item,
  pending,
  focused,
  onAction,
}: {
  item: OperatorLeaseSigningItem;
  pending: string | null;
  focused: boolean;
  onAction: (action: 'packet' | 'send' | 'refresh' | 'resend') => void;
}) {
  const pendingForLease = pending?.endsWith(item.leaseId);
  const focusedRef = useFocusedRowScroll(focused);
  return (
    <article ref={focusedRef} className={`grid gap-4 px-4 py-4 xl:grid-cols-[1fr_250px_250px] xl:items-start ${focused ? 'bg-[var(--panel-strong)]' : ''}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{item.tenantName}</h4>
          {focused ? <span className="rounded-sm bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white">Focused workflow item</span> : null}
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.leaseStatus}</span>
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.nextAction.replaceAll('_', ' ')}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">{item.propertyName ?? 'No property'} {item.unitLabel ? `- ${item.unitLabel}` : ''}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>{formatCurrency(item.rentAmount)} rent</span>
          <span>{formatCurrency(item.depositAmount)} deposit</span>
          <span>{new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}</span>
          <span>{item.documentCount} packet docs</span>
        </div>
        {item.blockers.length > 0 ? (
          <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2 text-xs text-[var(--muted)]">
            {item.blockers.join(' ')}
          </div>
        ) : null}
      </div>

      <div className="text-sm">
        <div className="font-medium">Envelope</div>
        {item.latestEnvelope ? (
          <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
            <div>Status: {item.latestEnvelope.status}</div>
            <div>Provider: {item.latestEnvelope.providerStatus ?? item.latestEnvelope.providerEnvelopeId}</div>
            <div>Participants: {item.latestEnvelope.participants.map((p) => `${p.name} ${p.status}`).join(', ')}</div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-[var(--muted)]">No envelope created.</div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <button disabled={pendingForLease || item.nextAction === 'blocked'} onClick={() => onAction('packet')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Generate packet
        </button>
        <button disabled={pendingForLease || item.nextAction === 'blocked' || item.nextAction === 'monitor_signature' || item.nextAction === 'complete'} onClick={() => onAction('send')} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          Send envelope
        </button>
        <button disabled={pendingForLease || !item.latestEnvelope} onClick={() => onAction('refresh')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Refresh status
        </button>
        <button disabled={pendingForLease || !item.latestEnvelope || item.nextAction === 'complete'} onClick={() => onAction('resend')} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Resend
        </button>
      </div>
    </article>
  );
}
