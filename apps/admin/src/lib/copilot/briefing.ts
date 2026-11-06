import type { BriefingData, Decision, Signal } from '@keyring/types';
import { api } from './core';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function rec(value: unknown): Record<string, Json> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function list(value: unknown): Json[] {
  return Array.isArray(value) ? value : [];
}

export function computeSeverity(daysOverdue: number): Signal['severity'] {
  if (daysOverdue > 30) return 'critical';
  if (daysOverdue > 7) return 'high';
  return 'medium';
}

export function computeUrgency(priorityScore: number): Decision['urgency'] {
  if (priorityScore > 80) return 'immediate';
  if (priorityScore > 50) return 'today';
  return 'this_week';
}

export function mapDelinquencyToSignals(input: unknown): { signals: Signal[]; atRiskAmount: number } {
  const signals: Signal[] = [];
  let atRiskAmount = 0;
  const buckets = rec(input).buckets ?? input;
  if (!Array.isArray(buckets)) return { signals, atRiskAmount };

  for (const b of buckets) {
    for (const item of list(rec(b).items)) {
      const itemRec = rec(item);
      const amount = num(itemRec.outstandingAmount ?? itemRec.amount);
      atRiskAmount += amount;
      signals.push({
        id: `delinq-${str(itemRec.leaseId ?? itemRec.id)}`,
        severity: computeSeverity(num(itemRec.daysOverdue)),
        domain: 'payments',
        title: `${str(itemRec.tenantName, 'Tenant')} - $${amount.toLocaleString()} overdue`,
        summary: `${num(itemRec.daysOverdue)} days past due. ${str(itemRec.noticeStatus, 'No notice sent')}.`,
        monetaryImpact: amount,
        actionUrl: '/payments',
        actionLabel: 'Review Payment',
        createdAt: str(itemRec.createdAt, new Date().toISOString()),
      });
    }
  }
  return { signals, atRiskAmount };
}

export function mapFeedToDecisions(input: unknown): Decision[] {
  const decisions: Decision[] = [];
  const items = rec(input).items ?? input ?? [];
  for (const item of (Array.isArray(items) ? items : []).slice(0, 10)) {
    const itemRec = rec(item);
    const actions = list(itemRec.actions);
    if (actions.length) {
      decisions.push({
        id: str(itemRec.id, `feed-${Math.random().toString(36).slice(2)}`),
        domain: (str(itemRec.domain, 'payments') as Decision['domain']),
        entityType: str(itemRec.type, 'unknown'),
        entityId: str(itemRec.entityId ?? itemRec.id),
        title: str(itemRec.title, 'Action Required'),
        context: str(itemRec.summary ?? itemRec.description),
        aiRecommendation: typeof itemRec.aiRecommendation === 'string' ? itemRec.aiRecommendation : undefined,
        actions: actions.map((a) => {
          const action = rec(a);
          return ({
          label: str(action.label, 'Take Action'),
          endpoint: str(action.endpoint, '#'),
          method: (action.method === 'PUT' || action.method === 'PATCH' || action.method === 'DELETE' ? action.method : 'POST'),
          body: rec(action.body) as Record<string, unknown>,
          variant: (action.variant === 'danger' || action.variant === 'neutral' || action.variant === 'secondary' ? action.variant : 'primary'),
          confirmRequired: Boolean(action.confirmRequired || action.requiresConfirm),
          confirmation: typeof action.confirmation === 'object' && action.confirmation !== null && !Array.isArray(action.confirmation)
            ? {
                title: str(action.confirmation.title, 'Confirm'),
                message: str(action.confirmation.message),
                confirmLabel: typeof action.confirmation.confirmLabel === 'string' ? action.confirmation.confirmLabel : undefined,
                cancelLabel: typeof action.confirmation.cancelLabel === 'string' ? action.confirmation.cancelLabel : undefined,
              }
            : undefined,
        });
        }),
        urgency: computeUrgency(num(itemRec.priorityScore)),
      });
    }
  }
  return decisions;
}

export function mapScheduleToEvents(input: unknown, today: string): BriefingData['events'] {
  const events: BriefingData['events'] = [];
  const evts = rec(input).events ?? input ?? [];
  for (const e of list(evts).filter((ev) => str(rec(ev).date ?? rec(ev).scheduledAt).startsWith(today)).slice(0, 8)) {
    const event = rec(e);
    events.push({
      id: str(event.id, `evt-${Math.random().toString(36).slice(2)}`),
      type: str(event.type, 'maintenance').toLowerCase() as BriefingData['events'][number]['type'],
      title: str(event.title ?? event.type, 'Event'),
      scheduledAt: str(event.date ?? event.scheduledAt),
      propertyName: str(event.propertyName ?? rec(event.property).name),
      unitName: str(event.unitName ?? rec(event.unit).name) || undefined,
    });
  }
  return events;
}

export async function fetchBriefing(): Promise<BriefingData> {
  try {
    return await api<BriefingData>('/briefing/daily');
  } catch {
    return buildFallbackBriefing();
  }
}

async function buildFallbackBriefing(): Promise<BriefingData> {
  const [delinquency, feedData, schedule] = await Promise.allSettled([
    api('/payments/delinquency/queue'),
    api('/feed'),
    api('/schedule/events'),
  ]);

  let signals: Signal[] = [];
  let decisions: Decision[] = [];
  let events: BriefingData['events'] = [];
  let atRiskAmount = 0;

  if (delinquency.status === 'fulfilled') {
    const mapped = mapDelinquencyToSignals(delinquency.value);
    signals = mapped.signals;
    atRiskAmount = mapped.atRiskAmount;
  }

  if (feedData.status === 'fulfilled') {
    decisions = mapFeedToDecisions(feedData.value);
  }

  if (schedule.status === 'fulfilled') {
    const today = new Date().toISOString().split('T')[0];
    events = mapScheduleToEvents(schedule.value, today);
  }

  return {
    signals: signals.sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return sev[a.severity] - sev[b.severity];
    }),
    decisions,
    events,
    metrics: {
      atRiskAmount,
      pendingDecisions: decisions.length,
      todayEvents: events.length,
      vacantUnits: 0,
      overduePayments: signals.filter((s) => s.domain === 'payments').length,
    },
  };
}

export async function executeDecisionAction(endpoint: string, method: string, body?: Record<string, unknown>) {
  return api(endpoint, { method, body: body ? JSON.stringify(body) : undefined });
}

export const briefingApi = {
  fetchBriefing,
  executeDecisionAction,
};
