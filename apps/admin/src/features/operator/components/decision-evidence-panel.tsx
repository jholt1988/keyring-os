import type { CommandCenterDecisionDetail } from '@/lib/operator/read-only-data';

export function DecisionEvidencePanel({
  detail,
  loading,
  actionNote,
  actionMessage,
  actionPending,
  onNoteChange,
  onExecute,
  onDefer,
  onClose,
}: {
  detail: CommandCenterDecisionDetail | null;
  loading: boolean;
  actionNote: string;
  actionMessage: string | null;
  actionPending: boolean;
  onNoteChange: (value: string) => void;
  onExecute: (actionId: string) => void;
  onDefer: () => void;
  onClose: () => void;
}) {
  if (!detail && !loading && !actionMessage) {
    return (
      <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4" aria-labelledby="evidence-title">
        <h2 id="evidence-title" className="text-lg font-semibold">Evidence drawer</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">Select a decision to inspect evidence, source links, audit history, and action controls.</p>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4" aria-labelledby="evidence-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="evidence-title" className="text-lg font-semibold">Evidence drawer</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{loading ? 'Loading decision detail' : detail?.decision.title}</p>
        </div>
        <button onClick={onClose} className="rounded-md border border-[var(--border)] px-2 py-1 text-xs">Close</button>
      </div>

      {actionMessage ? <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-3 text-sm text-[var(--muted)]">{actionMessage}</div> : null}

      {detail ? (
        <div className="mt-4 space-y-5">
          <div>
            <h3 className="text-sm font-semibold">Evidence</h3>
            <div className="mt-2 space-y-2">
              {detail.decision.evidence.map((evidence) => (
                <div key={`${evidence.source}-${evidence.label}`} className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{evidence.label}</div>
                    <div className="text-xs text-[var(--muted)]">{evidence.source}</div>
                  </div>
                  <div className="mt-1 text-sm text-[var(--muted)]">{String(evidence.value ?? 'Not set')}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Source links</h3>
            <div className="mt-2 space-y-2">
              {detail.sourceLinks.map((link) => (
                <div key={`${link.entityType}-${link.entityId}`} className="rounded-md border border-[var(--border)] p-3 text-sm">
                  <div className="font-medium">{link.label}</div>
                  <div className="mt-1 break-all text-xs text-[var(--muted)]">{link.entityType} {link.entityId}</div>
                  <div className="mt-1 break-all text-xs text-[var(--muted)]">{link.route}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Action</h3>
            <textarea
              value={actionNote}
              onChange={(event) => onNoteChange(event.target.value)}
              className="mt-2 min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] p-2 text-sm outline-none focus:border-[var(--accent)]"
              aria-label="Decision action note"
              placeholder="Optional operator note"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                disabled={actionPending}
                onClick={onDefer}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Defer
              </button>
              {detail.decision.actions.map((action) => (
                <button
                  key={action.id}
                  disabled={actionPending}
                  onClick={() => onExecute(action.id)}
                  className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {action.approvalTaskId ? 'Approval linked' : action.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Audit trail</h3>
            <div className="mt-2 space-y-3">
              {detail.auditTrail.length === 0 ? (
                <div className="text-sm text-[var(--muted)]">No audit activity recorded yet.</div>
              ) : (
                detail.auditTrail.map((item) => (
                  <div key={item.id} className="border-l border-[var(--border)] pl-3 text-sm">
                    <div className="font-medium">{item.title}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{item.domain} - {item.status} - {new Date(item.occurredAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
