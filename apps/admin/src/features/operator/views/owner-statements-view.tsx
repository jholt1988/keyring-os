'use client';

import { useEffect, useState } from 'react';
import type { ReadOnlyOperatorData, OperatorOwnerStatementItem, OperatorWorkflowItem } from '@/lib/operator/read-only-data';
import {
  generateOperatorOwnerStatements,
  approveOperatorOwnerStatement,
  sendOperatorOwnerStatement,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { WorkflowFocusBanner, workflowFocusMatchesEntity, useFocusedRowScroll } from '../components/workflow-focus-banner';
import { formatNumber, cents } from '../utils';
import { ArrowUpRight, Banknote, ClipboardList, Inbox, KeyRound, ShieldCheck } from 'lucide-react';

export function OwnerStatementsView({
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
  const workbench = data.ownerStatements;
  const [month, setMonth] = useState(workbench?.month ?? new Date().toISOString().slice(0, 7));
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (workbench?.month) setMonth(workbench.month);
  }, [workbench?.month]);

  async function generate() {
    setPending('generate');
    setMessage(null);
    try {
      await generateOperatorOwnerStatements(month, { token });
      setMessage('Owner statements generated from posted entries.');
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to generate owner statements.');
    } finally {
      setPending(null);
    }
  }

  async function act(statement: OperatorOwnerStatementItem, action: 'approve' | 'send') {
    setPending(`${action}-${statement.id}`);
    setMessage(null);
    try {
      if (action === 'approve') {
        await approveOperatorOwnerStatement(statement.id, { token });
        setMessage('Owner statement approved.');
      } else {
        await sendOperatorOwnerStatement(statement.id, { token });
        setMessage('Owner statement marked sent.');
      }
      await onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Unable to ${action} owner statement.`);
    } finally {
      setPending(null);
    }
  }

  return (
    <section aria-labelledby="owner-statements-title">
      <WorkflowFocusBanner
        item={workflowFocus}
        matched={workflowFocus ? workbench?.statements.some((item) => workflowFocusMatchesEntity(workflowFocus, 'OwnerStatement', item.id)) ?? false : undefined}
        onClear={onClearWorkflowFocus}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricTile label="Statements" value={formatNumber(workbench?.metrics.statements)} detail={workbench?.month ?? month} icon={ClipboardList} />
        <MetricTile label="Draft" value={formatNumber(workbench?.metrics.draftStatements)} detail="needs review" icon={Inbox} />
        <MetricTile label="Approved" value={formatNumber(workbench?.metrics.approvedStatements)} detail="ready to send" icon={ShieldCheck} />
        <MetricTile label="Sent" value={formatNumber(workbench?.metrics.sentStatements)} detail="delivered" icon={ArrowUpRight} />
        <MetricTile label="Distribution" value={cents(workbench?.metrics.netDistributionCents) ?? '$0'} detail="net owner amount" icon={Banknote} />
        <MetricTile label="Close locks" value={`${formatNumber(workbench?.metrics.closeLockedProperties)}/${formatNumber((workbench?.metrics.closeLockedProperties ?? 0) + (workbench?.metrics.closeUnlockedProperties ?? 0))}`} detail="locked properties" icon={KeyRound} />
      </div>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="owner-statements-title" className="text-lg font-semibold">Owner statement review</h2>
          <p className="text-sm text-[var(--muted)]">Generate statements from posted accounting entries, review monthly-close blockers, approve, and send to owners.</p>
        </div>
        <div className="flex gap-2">
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm" aria-label="Statement month" />
          <button disabled={pending === 'generate' || !month} onClick={() => void generate()} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
            Generate
          </button>
        </div>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      {!workbench ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
          No owner statements workbench returned by `/api/operator-owner-statements`.
        </div>
      ) : (
        <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="font-semibold">Statement queue</h3>
          </div>
          {workbench.statements.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">No owner statements returned for {workbench.month}.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {workbench.statements.map((statement) => (
                <OwnerStatementRow
                  key={statement.id}
                  statement={statement}
                  focused={workflowFocusMatchesEntity(workflowFocus, 'OwnerStatement', statement.id)}
                  pending={pending?.endsWith(statement.id) ?? false}
                  onApprove={() => void act(statement, 'approve')}
                  onSend={() => void act(statement, 'send')}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export function OwnerStatementRow({
  statement,
  focused,
  pending,
  onApprove,
  onSend,
}: {
  statement: OperatorOwnerStatementItem;
  focused: boolean;
  pending: boolean;
  onApprove: () => void;
  onSend: () => void;
}) {
  const focusedRef = useFocusedRowScroll(focused);
  return (
    <article ref={focusedRef} className={`grid gap-4 px-4 py-4 xl:grid-cols-[1fr_280px_220px] xl:items-start ${focused ? 'bg-[var(--panel-strong)]' : ''}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold">{statement.ownerName}</h4>
          {focused ? <span className="rounded-sm bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white">Focused workflow item</span> : null}
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{statement.status}</span>
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{statement.nextAction}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span>{statement.month}</span>
          <span>Gross {cents(statement.grossIncomeCents)}</span>
          <span>Expenses {cents(statement.totalExpensesCents)}</span>
          <span>Mgmt fee {cents(statement.managementFeeCents)}</span>
        </div>
        {statement.blockers.length > 0 ? <div className="mt-3 text-xs text-[var(--danger)]">{statement.blockers.join(' ')}</div> : null}
      </div>

      <div className="text-sm">
        <div className="font-medium">Net distribution</div>
        <div className="mt-1 text-xl font-semibold">{cents(statement.netDistributionCents)}</div>
        <div className="mt-2 text-xs text-[var(--muted)]">
          {statement.approvedAt ? `Approved ${new Date(statement.approvedAt).toLocaleString()}` : 'Not approved'}
          <br />
          {statement.sentAt ? `Sent ${new Date(statement.sentAt).toLocaleString()}` : 'Not sent'}
        </div>
      </div>

      <div className="grid gap-2">
        <button disabled={pending || statement.nextAction === 'blocked' || statement.status !== 'DRAFT'} onClick={onApprove} className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          Approve
        </button>
        <button disabled={pending || statement.status !== 'APPROVED'} onClick={onSend} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-50">
          Send
        </button>
      </div>
    </article>
  );
}
