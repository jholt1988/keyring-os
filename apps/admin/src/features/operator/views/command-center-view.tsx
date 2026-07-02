'use client';

import { useState } from 'react';
import type { ReadOnlyOperatorData, CommandCenterDecisionDetail, CommandCenterDecision, FeedItem } from '@/lib/operator/read-only-data';
import {
  loadCommandCenterDecisionDetail,
  executeCommandCenterAction,
  deferCommandCenterDecision,
} from '@/lib/operator/read-only-data';
import { MetricTile } from '../components/metric-tile';
import { FilterSelect } from '../components/filter-select';
import { DecisionEvidencePanel } from '../components/decision-evidence-panel';
import { CollapsiblePanel } from '@/components/ui/collapsible-panel';
import { formatCurrency, formatNumber, priorityLabel, decisionPriorityLabel } from '../utils';
import { AlertTriangle, ArrowUpRight, Banknote, Building2, ClipboardList, ShieldCheck, Wrench } from 'lucide-react';

export function CommandCenterView({
  data,
  totals,
  loaded,
  token,
  onRefresh,
}: {
  data: ReadOnlyOperatorData;
  totals: { properties: number; units: number; occupied: number; vacant: number; occupancy: number };
  loaded: boolean;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CommandCenterDecisionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [filters, setFilters] = useState({ type: 'ALL', priority: 'ALL', status: 'ALL', due: 'ALL', propertyId: '' });
  const briefingDecisionItems: FeedItem[] = data.briefing?.signals.slice(0, 6).map((signal) => ({
    id: signal.id,
    kind: 'critical_signal',
    domain: signal.domain ?? 'operations',
    title: signal.title,
    summary: signal.summary ?? '',
    priority: signal.severity === 'critical' ? 95 : signal.severity === 'high' ? 75 : 50,
    timestamp: signal.createdAt,
    actions: [{ id: `${signal.id}-review`, label: signal.actionLabel ?? 'Review', type: 'navigation' }],
    metadata: { impact: { financial: signal.monetaryImpact, risk: signal.severity } },
  })) ?? [];
  const decisionItems = data.feed.length > 0 ? data.feed : briefingDecisionItems;
  const rawCommandDecisions = data.commandCenter?.decisions ?? [];
  const aiCapabilities = data.aiCapabilities?.capabilities ?? [];
  const highRiskAiCapabilities = aiCapabilities.filter((capability) => capability.riskLevel === 'HIGH').length;
  const decisionRecordCapabilities = aiCapabilities.filter((capability) => capability.persistsDecisionRecord).length;
  const approvalGatedCapabilities = aiCapabilities.filter((capability) => capability.requiresApprovalForExternalAction).length;
  const commandDecisions = rawCommandDecisions.filter((decision) => {
    if (filters.type !== 'ALL' && decision.type !== filters.type) return false;
    if (filters.priority !== 'ALL' && decision.priority !== filters.priority) return false;
    if (filters.status === 'approval-linked' && !decision.approvalTaskId) return false;
    if (filters.status === 'unlinked' && decision.approvalTaskId) return false;
    if (filters.propertyId.trim() && decision.propertyId !== filters.propertyId.trim()) return false;
    if (filters.due === 'overdue' && (!decision.dueAt || new Date(decision.dueAt) >= new Date())) return false;
    if (filters.due === 'upcoming' && (!decision.dueAt || new Date(decision.dueAt) < new Date())) return false;
    return true;
  });
  const openDecisionCount = data.commandCenter?.metrics.totalDecisions ?? data.briefing?.metrics?.pendingDecisions ?? decisionItems.length;
  const atRiskAmount = data.briefing?.metrics?.atRiskAmount ?? data.metrics?.financials?.outstanding;

  async function selectDecision(decisionId: string) {
    setSelectedDecisionId(decisionId);
    setDetail(null);
    setActionMessage(null);
    setDetailLoading(true);
    try {
      setDetail(await loadCommandCenterDecisionDetail(decisionId, { token }));
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to load decision detail.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function executeAction(actionId: string) {
    if (!selectedDecisionId) return;
    setActionPending(true);
    setActionMessage(null);
    try {
      await executeCommandCenterAction(selectedDecisionId, actionId, actionNote, { token });
      setActionMessage('Approval task created for this command-center action.');
      setActionNote('');
      await onRefresh();
      setDetail(await loadCommandCenterDecisionDetail(selectedDecisionId, { token }));
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to execute command-center action.');
    } finally {
      setActionPending(false);
    }
  }

  async function deferSelectedDecision() {
    if (!selectedDecisionId) return;
    setActionPending(true);
    setActionMessage(null);
    try {
      await deferCommandCenterDecision(selectedDecisionId, actionNote, { token });
      setActionMessage('Decision deferred and recorded.');
      setActionNote('');
      await onRefresh();
      setDetail(await loadCommandCenterDecisionDetail(selectedDecisionId, { token }));
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to defer decision.');
    } finally {
      setActionPending(false);
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Occupancy" value={`${totals.occupancy}%`} detail={`${formatNumber(totals.occupied)} occupied / ${formatNumber(totals.units)} units`} icon={Building2} />
        <MetricTile label="Open decisions" value={formatNumber(openDecisionCount)} detail="canonical command-center queue" icon={ClipboardList} />
        <MetricTile label="At-risk amount" value={formatCurrency(atRiskAmount)} detail="requires review before action" icon={Banknote} />
        <MetricTile label="Maintenance load" value={formatNumber(data.metrics?.maintenance?.open ?? data.metrics?.maintenance?.total)} detail="read-only operational count" icon={Wrench} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-3" aria-labelledby="decision-queue-title">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 id="decision-queue-title" className="text-lg font-semibold">Decision queue</h2>
              <span className="text-sm text-[var(--muted)]">{loaded ? `${commandDecisions.length || decisionItems.length} loaded` : 'Waiting for data'}</span>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              <FilterSelect label="Type" value={filters.type} onChange={(type) => setFilters((current) => ({ ...current, type }))} options={['ALL', ...Array.from(new Set(rawCommandDecisions.map((decision) => decision.type)))]} />
              <FilterSelect label="Priority" value={filters.priority} onChange={(priority) => setFilters((current) => ({ ...current, priority }))} options={['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']} />
              <FilterSelect label="Status" value={filters.status} onChange={(status) => setFilters((current) => ({ ...current, status }))} options={['ALL', 'approval-linked', 'unlinked']} />
              <FilterSelect label="Due" value={filters.due} onChange={(due) => setFilters((current) => ({ ...current, due }))} options={['ALL', 'overdue', 'upcoming']} />
              <label className="text-xs font-medium text-[var(--muted)]">
                Property
                <input
                  value={filters.propertyId}
                  onChange={(event) => setFilters((current) => ({ ...current, propertyId: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                  placeholder="Property id"
                />
              </label>
            </div>
          </div>

          {commandDecisions.length === 0 && decisionItems.length === 0 && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
              No command-center items returned by the current contracts.
            </div>
          )}

          {rawCommandDecisions.length > 0 && commandDecisions.length === 0 && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5 text-sm text-[var(--muted)]">
              No command-center items match the current filters.
            </div>
          )}

          {commandDecisions.map((item) => (
            <article key={item.id} className={`rounded-md border bg-[var(--panel)] p-4 ${selectedDecisionId === item.id ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--panel-strong)]">
                    <AlertTriangle size={19} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.domain}</span>
                      <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.type.replace(/_/g, ' ').toLowerCase()}</span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">{item.recommendedAction}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-1 text-xs font-medium">{decisionPriorityLabel(item)}</span>
                  <span className="text-xs text-[var(--muted)]">{item.dueAt ? new Date(item.dueAt).toLocaleDateString() : 'Review'}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {item.evidence.slice(0, 3).map((evidence) => (
                  <div key={`${item.id}-${evidence.label}`} className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-3">
                    <div className="text-xs text-[var(--muted)]">{evidence.label}</div>
                    <div className="mt-1 truncate text-sm font-medium">{String(evidence.value ?? 'Not set')}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[var(--muted)]">Evidence from {item.entity.type} {item.entity.label ? `- ${item.entity.label}` : ''}</span>
                <button onClick={() => void selectDecision(item.id)} className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium">
                  Open evidence
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}

          {commandDecisions.length === 0 && decisionItems.map((item) => (
            <article key={item.id} className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--panel-strong)]">
                    <AlertTriangle size={19} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">{item.domain}</span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{item.summary}</p>
                  </div>
                </div>
                <span className="rounded-sm bg-[var(--panel-strong)] px-2 py-1 text-xs font-medium">{priorityLabel(item)}</span>
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          <DecisionEvidencePanel
            detail={detail}
            loading={detailLoading}
            actionNote={actionNote}
            actionMessage={actionMessage}
            actionPending={actionPending}
            onNoteChange={setActionNote}
            onExecute={(actionId) => void executeAction(actionId)}
            onDefer={() => void deferSelectedDecision()}
            onClose={() => {
              setSelectedDecisionId(null);
              setDetail(null);
              setActionMessage(null);
            }}
          />

          <CollapsiblePanel
            title="Approval Panel"
            variant="compact"
            badge={formatNumber(data.commandCenter?.metrics.pendingApprovals ?? data.approvals.length)}
          >
            <div className="text-3xl font-semibold">{formatNumber(data.commandCenter?.metrics.pendingApprovals ?? data.approvals.length)}</div>
            <p className="mt-1 text-sm text-[var(--muted)]">pending approval tasks connected to executable workflows</p>
          </CollapsiblePanel>

          <CollapsiblePanel
            title="AI Workflow Readiness"
            badge={formatNumber(aiCapabilities.length)}
            actions={
              <span className="text-xs font-medium text-[var(--muted)]">
                {data.aiCapabilities ? `${data.aiCapabilities.mode} / ${data.aiCapabilities.model}` : 'No manifest'}
              </span>
            }
          >
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2">
                <div className="text-lg font-semibold">{formatNumber(highRiskAiCapabilities)}</div>
                <div className="mt-1 text-[11px] text-[var(--muted)]">high risk</div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2">
                <div className="text-lg font-semibold">{formatNumber(approvalGatedCapabilities)}</div>
                <div className="mt-1 text-[11px] text-[var(--muted)]">approval gated</div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-2">
                <div className="text-lg font-semibold">{formatNumber(decisionRecordCapabilities)}</div>
                <div className="mt-1 text-[11px] text-[var(--muted)]">decision record</div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {aiCapabilities.slice(0, 5).map((capability) => (
                <div key={capability.id} className="rounded-md border border-[var(--border)] bg-[var(--panel-strong)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{capability.id.replace(/-/g, ' ')}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">{capability.workflowIds.slice(0, 3).join(' / ')}</div>
                    </div>
                    <span className="rounded-sm border border-[var(--border)] px-2 py-0.5 text-[11px] font-medium">{capability.riskLevel.toLowerCase()}</span>
                  </div>
                  <div className="mt-2 text-xs leading-5 text-[var(--muted)]">{capability.primaryGuardrails[0] ?? capability.description}</div>
                </div>
              ))}
              {aiCapabilities.length === 0 && (
                <div className="text-sm text-[var(--muted)]">No AI capability manifest returned by the backend.</div>
              )}
            </div>
          </CollapsiblePanel>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4" aria-labelledby="briefing-title">
            <h2 id="briefing-title" className="text-lg font-semibold">Today</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Events</dt>
                <dd className="font-medium">{formatNumber(data.briefing?.metrics?.todayEvents ?? data.briefing?.events.length)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Vacant units</dt>
                <dd className="font-medium">{formatNumber(data.briefing?.metrics?.vacantUnits ?? totals.vacant)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Overdue payments</dt>
                <dd className="font-medium">{formatNumber(data.briefing?.metrics?.overduePayments)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4" aria-labelledby="timeline-title">
            <h2 id="timeline-title" className="text-lg font-semibold">Workflow timeline</h2>
            <div className="mt-4 space-y-3">
              {(data.commandCenter?.timeline ?? []).slice(0, 5).map((item) => (
                <div key={item.id} className="border-l border-[var(--border)] pl-3 text-sm">
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{item.status} - {new Date(item.occurredAt).toLocaleString()}</div>
                </div>
              ))}
              {(data.commandCenter?.timeline ?? []).length === 0 && (
                <div className="text-sm text-[var(--muted)]">No recent workflow executions returned.</div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4" aria-labelledby="beta-title">
            <h2 id="beta-title" className="text-lg font-semibold">Port scope</h2>
            <div className="mt-4 space-y-3 text-sm">
              {['Read-only command center', 'Read-only portfolio list', 'No operator mutations', 'Canonical backend routes only'].map((item) => (
                <div key={item} className="flex gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[var(--success)]" size={16} aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
