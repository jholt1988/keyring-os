'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReadOnlyOperatorData, OperatorWorkflowItem, CommandCenterDecision } from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { workflowItemMatchesDecision, workflowTargetView, workflowTargetLabel } from '../components/workflow-focus-banner';
import { formatNumber, cents } from '../utils';
import { AlertTriangle, ArrowUpRight, Banknote, ClipboardList, Layers3, RefreshCcw, ShieldCheck } from 'lucide-react';

export function WorkflowsView({
  data,
  loaded,
  selectedWorkflowId,
  onSelectWorkflow,
  onOpenWorkflow,
}: {
  data: ReadOnlyOperatorData;
  loaded: boolean;
  selectedWorkflowId: string | null;
  onSelectWorkflow: (item: OperatorWorkflowItem) => void;
  onOpenWorkflow: (item: OperatorWorkflowItem) => void;
}) {
  const groups = useMemo(() => data.workflows?.groups ?? [], [data.workflows?.groups]);
  const totalItems = data.workflows?.totals?.items ?? 0;
  const paymentWorkbench = data.paymentWorkbench;
  const allItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = allItems.find((item) => item.id === selectedItemId) ?? allItems[0] ?? null;
  const relatedDecision = selectedItem
    ? (data.commandCenter?.decisions ?? []).find((decision) => workflowItemMatchesDecision(selectedItem, decision)) ?? null
    : null;
  const relatedAiCapabilities = selectedItem
    ? (data.aiCapabilities?.capabilities ?? []).filter((capability) => capability.workflowIds.includes(selectedItem.workflowId))
    : [];

  useEffect(() => {
    if (selectedWorkflowId && allItems.some((item) => item.id === selectedWorkflowId)) {
      setSelectedItemId(selectedWorkflowId);
      return;
    }
    if (!selectedItemId && allItems[0]) {
      setSelectedItemId(allItems[0].id);
    }
  }, [allItems, selectedItemId, selectedWorkflowId]);

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Workflow groups" value={formatNumber(data.workflows?.totals?.workflows ?? groups.length)} detail="Phase 3 operational areas" icon={Layers3} />
        <MetricTile label="Open items" value={formatNumber(totalItems)} detail="work ready or blocked" icon={ClipboardList} />
        <MetricTile label="High priority" value={formatNumber(data.workflows?.totals?.highPriority)} detail="needs same-day review" icon={AlertTriangle} />
        <MetricTile label="Blocked" value={formatNumber(data.workflows?.totals?.blocked)} detail="requires resolution before progress" icon={ShieldCheck} />
      </div>

      <section aria-labelledby="workflow-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="workflow-title" className="text-lg font-semibold">Core operational workflows</h2>
          <span className="text-sm text-[var(--muted)]">{loaded ? `${totalItems} items` : 'Waiting for data'}</span>
        </div>

        {groups.length === 0 && (
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
            No workflow read model returned by `/api/operator-workflows`.
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.workflowId} className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
                <div className="flex flex-col gap-1 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{group.label}</h3>
                    <p className="text-xs text-[var(--muted)]">{group.workflowId}</p>
                  </div>
                  <span className="text-sm text-[var(--muted)]">{group.count} open</span>
                </div>

                {(group.items?.length ?? 0) === 0 ? (
                  <div className="px-4 py-4 text-sm text-[var(--muted)]">No active items in this workflow.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {(group.items ?? []).map((item) => (
                      <WorkflowRow
                        key={item.id}
                        item={item}
                        selected={selectedItem?.id === item.id}
                        onSelect={() => {
                          setSelectedItemId(item.id);
                          onSelectWorkflow(item);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <WorkflowInspector
            item={selectedItem}
            decision={relatedDecision}
            capabilities={relatedAiCapabilities}
            manifestMode={data.aiCapabilities?.mode}
            onOpenWorkflow={onOpenWorkflow}
          />
        </div>
      </section>

      <section className="mt-8" aria-labelledby="payment-workbench-title">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="payment-workbench-title" className="text-lg font-semibold">Payment and reconciliation workbench</h2>
            <p className="text-sm text-[var(--muted)]">Read-only Phase 3 payment workflow: ledger balances, delinquency, exceptions, and accounting gates.</p>
          </div>
          <span className="text-sm text-[var(--muted)]">{paymentWorkbench ? new Date(paymentWorkbench.generatedAt).toLocaleString() : 'Waiting for data'}</span>
        </div>

        {!paymentWorkbench ? (
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
            No payment workbench returned by `/api/operator-payments`.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricTile label="Ledger balance" value={cents(paymentWorkbench.metrics?.totalBalanceCents) ?? '$0'} detail={`${formatNumber(paymentWorkbench.metrics?.ledgerAccounts)} accounts`} icon={Banknote} />
              <MetricTile label="Delinquent" value={cents(paymentWorkbench.metrics?.delinquentAmountCents) ?? '$0'} detail={`${formatNumber(paymentWorkbench.metrics?.delinquentLeases)} leases`} icon={AlertTriangle} />
              <MetricTile label="Exceptions" value={formatNumber(paymentWorkbench.metrics?.paymentExceptions)} detail="bookkeeping exceptions" icon={ClipboardList} />
              <MetricTile label="Unreconciled" value={formatNumber(paymentWorkbench.metrics?.unreconciledItems)} detail="bank/recon items" icon={RefreshCcw} />
              <MetricTile label="Payment gates" value={paymentWorkbench.metrics?.paymentExpansionBlocked ? 'Blocked' : 'Ready'} detail="write expansion status" icon={ShieldCheck} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
              <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <h3 className="font-semibold">Tenant ledger accounts</h3>
                </div>
                {paymentWorkbench.ledgerAccounts.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[var(--muted)]">No lease ledger accounts returned.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {paymentWorkbench.ledgerAccounts.map((account) => (
                      <article key={account.leaseId} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_150px_180px] md:items-center">
                        <div>
                          <div className="font-medium">{account.tenantName}</div>
                          <div className="mt-1 text-xs text-[var(--muted)]">{account.propertyName ?? 'No property'} {account.unitName ? `- ${account.unitName}` : ''}</div>
                        </div>
                        <div className="text-sm font-medium">{cents(account.currentBalanceCents)}</div>
                        <div className="break-all text-xs text-[var(--muted)]">{account.canonicalRoute}</div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <h3 className="font-semibold">Payment exceptions</h3>
                </div>
                {paymentWorkbench.exceptions.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-[var(--muted)]">No payment exceptions returned.</div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {paymentWorkbench.exceptions.map((item) => (
                      <article key={item.id} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="mt-1 text-xs text-[var(--muted)]">{item.reason ?? item.status}</div>
                          </div>
                          <div className="text-sm font-medium">{cents(item.amountCents)}</div>
                        </div>
                        <div className="mt-2 break-all text-xs text-[var(--muted)]">{item.canonicalRoute}</div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function WorkflowRow({ item, selected, onSelect }: { item: OperatorWorkflowItem; selected: boolean; onSelect: () => void }) {
  const amount = cents(item.amountCents);

  return (
    <article className={`grid gap-3 px-4 py-4 lg:grid-cols-[1fr_150px_150px_180px] lg:items-center ${selected ? 'bg-[var(--panel-strong)]' : ''}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium">{item.title}</h4>
          <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.status.toLowerCase().replace(/_/g, ' ')}</span>
          <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-0.5 text-xs">{item.priority.toLowerCase()}</span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{item.nextAction}</p>
      </div>
      <div className="text-sm">
        <span className="lg:hidden text-[var(--muted)]">Entity: </span>
        {item.entityType}
      </div>
      <div className="text-sm">
        <span className="lg:hidden text-[var(--muted)]">Amount: </span>
        {amount ?? (item.dueAt ? new Date(item.dueAt).toLocaleDateString() : 'No date')}
      </div>
      <div className="flex justify-start lg:justify-end">
        <button onClick={onSelect} className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium">
          Inspect
          <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export function WorkflowInspector({
  item,
  decision,
  capabilities,
  manifestMode,
  onOpenWorkflow,
}: {
  item: OperatorWorkflowItem | null;
  decision: CommandCenterDecision | null;
  capabilities: NonNullable<ReadOnlyOperatorData['aiCapabilities']>['capabilities'];
  manifestMode?: string;
  onOpenWorkflow: (item: OperatorWorkflowItem) => void;
}) {
  if (!item) {
    return (
      <aside className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 text-sm text-[var(--muted)]">
        Select a workflow item to inspect decision linkage, AI guardrails, and the canonical backend route.
      </aside>
    );
  }

  const targetView = workflowTargetView(item.workflowId);
  const targetLabel = workflowTargetLabel(targetView);

  return (
    <aside className="h-fit rounded-md border border-[var(--border)] bg-[var(--panel)]">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h3 className="font-semibold">Workflow inspector</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{item.workflowId}</p>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="text-sm font-medium">{item.title}</div>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.nextAction}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--muted)]">Status</div>
            <div className="mt-1 font-medium">{item.status.replace(/_/g, ' ')}</div>
          </div>
          <div className="rounded-md border border-[var(--border)] p-3">
            <div className="text-xs text-[var(--muted)]">Priority</div>
            <div className="mt-1 font-medium">{item.priority.toLowerCase()}</div>
          </div>
        </div>

        <div className="rounded-md border border-[var(--border)] p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Canonical route</div>
          <div className="mt-2 break-all text-sm">{item.canonicalRoute}</div>
        </div>

        <button
          disabled={!targetView || targetView === 'workflows'}
          onClick={() => targetView && targetView !== 'workflows' && onOpenWorkflow(item)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Open {targetLabel}
          <ArrowUpRight size={15} aria-hidden="true" />
        </button>
        {targetView === 'workflows' && (
          <div className="text-xs leading-5 text-[var(--muted)]">
            Payment and accounting workflow actions are handled in the workbench below this queue.
          </div>
        )}

        <div className="rounded-md border border-[var(--border)] p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Command decision</div>
          {decision ? (
            <div className="mt-2">
              <div className="text-sm font-medium">{decision.title}</div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{decision.recommendedAction}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-1">{decision.priority.toLowerCase()}</span>
                <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-1">{decision.type}</span>
                {decision.approvalTaskId && <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-1">approval linked</span>}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-[var(--muted)]">No command-center decision currently matches this workflow item.</div>
          )}
        </div>

        <div className="rounded-md border border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">AI workflow coverage</div>
            <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-1 text-xs">{manifestMode ?? 'unknown'}</span>
          </div>
          <div className="mt-3 space-y-3">
            {capabilities.map((capability) => (
              <div key={capability.id} className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{capability.task}</span>
                  <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs">{capability.riskLevel.toLowerCase()}</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{capability.primaryGuardrails?.[0] ?? capability.description}</p>
              </div>
            ))}
            {capabilities.length === 0 && (
              <div className="text-sm text-[var(--muted)]">No AI capability is mapped to this workflow yet.</div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
