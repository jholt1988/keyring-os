'use client';

import { useState } from 'react';
import type { ReadOnlyOperatorData } from '@/lib/operator/read-only-data';
import { decideApprovalTask } from '@/lib/operator/read-only-data';

export function ApprovalQueueView({
  data,
  loaded,
  token,
  onRefresh,
}: {
  data: ReadOnlyOperatorData;
  loaded: boolean;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null);
  const [reasonByTask, setReasonByTask] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function decide(taskId: string, decision: 'APPROVE' | 'REJECT') {
    const reason = reasonByTask[taskId] ?? '';
    if (decision === 'REJECT' && !reason.trim()) {
      setRejectTaskId(taskId);
      setMessage('A rejection reason is required.');
      return;
    }

    setPendingTaskId(taskId);
    setMessage(null);
    try {
      await decideApprovalTask(taskId, decision, reason, { token });
      setReasonByTask((current) => ({ ...current, [taskId]: '' }));
      setRejectTaskId(null);
      setMessage(`Approval task ${decision === 'APPROVE' ? 'approved' : 'rejected'}.`);
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to decide approval task.');
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <section aria-labelledby="approval-title">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="approval-title" className="text-lg font-semibold">Pending approvals</h2>
          <p className="text-sm text-[var(--muted)]">Approvals execute through policy workflow actions and record a DecisionRecord plus audit event.</p>
        </div>
        <span className="text-sm text-[var(--muted)]">{loaded ? `${data.approvals.length} pending` : 'Waiting for data'}</span>
      </div>

      {message ? (
        <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
          {message}
        </div>
      ) : null}

      <div className="space-y-3">
        {data.approvals.length === 0 && (
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
            No pending approval tasks returned by `/api/policy/approval-tasks/pending`.
          </div>
        )}

        {data.approvals.map((task) => (
          <article key={task.id} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{task.status}</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{task.summary || 'No summary provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  {task.propertyId ? <span>Property {task.propertyId}</span> : null}
                  {task.leaseId ? <span>Lease {task.leaseId}</span> : null}
                  {task.workOrderId ? <span>Work order {task.workOrderId}</span> : null}
                </div>
              </div>
              <div className="flex min-w-[220px] flex-col gap-2">
                {rejectTaskId === task.id ? (
                  <textarea
                    value={reasonByTask[task.id] ?? ''}
                    onChange={(event) => setReasonByTask((current) => ({ ...current, [task.id]: event.target.value }))}
                    className="min-h-20 rounded-md border border-[var(--border)] bg-[var(--panel)] p-2 text-sm outline-none focus:border-[var(--accent)]"
                    aria-label="Approval rejection reason"
                    placeholder="Reason for rejection"
                  />
                ) : null}
                <div className="flex gap-2 sm:justify-end">
                  <button
                    disabled={pendingTaskId === task.id}
                    onClick={() => {
                      if (rejectTaskId !== task.id) {
                        setRejectTaskId(task.id);
                        return;
                      }
                      void decide(task.id, 'REJECT');
                    }}
                    className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {pendingTaskId === task.id && rejectTaskId === task.id ? 'Rejecting' : 'Reject'}
                  </button>
                  <button
                    disabled={pendingTaskId === task.id}
                    onClick={() => void decide(task.id, 'APPROVE')}
                    className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {pendingTaskId === task.id && rejectTaskId !== task.id ? 'Approving' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
