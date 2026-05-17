import type { BriefingData, Decision, Signal } from '@keyring/types';
import { api } from './core';

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

export function mapDelinquencyToSignals(input: any): { signals: Signal[]; atRiskAmount: number } {
  const signals: Signal[] = [];
  let atRiskAmount = 0;
  const buckets = input?.buckets ?? input;
  if (!Array.isArray(buckets)) return { signals, atRiskAmount };

  for (const b of buckets) {
    for (const item of b.items ?? []) {
      const amount = item.outstandingAmount ?? item.amount ?? 0;
      atRiskAmount += amount;
      signals.push({
        id: `delinq-${item.leaseId ?? item.id}`,
        severity: computeSeverity(item.daysOverdue ?? 0),
        domain: 'payments',
        title: `${item.tenantName ?? 'Tenant'} - $${amount.toLocaleString()} overdue`,
        summary: `${item.daysOverdue ?? 0} days past due. ${item.noticeStatus ?? 'No notice sent'}.`,
        monetaryImpact: amount,
        actionUrl: '/payments',
        actionLabel: 'Review Payment',
        createdAt: item.createdAt ?? new Date().toISOString(),
      });
    }
  }
  return { signals, atRiskAmount };
}

export function mapFeedToDecisions(input: any): Decision[] {
  const decisions: Decision[] = [];
  const items = input?.items ?? input ?? [];
  for (const item of (Array.isArray(items) ? items : []).slice(0, 10)) {
    if (item.actions?.length) {
      decisions.push({
        id: item.id ?? `feed-${Math.random().toString(36).slice(2)}`,
        domain: item.domain ?? 'payments',
        entityType: item.type ?? 'unknown',
        entityId: item.entityId ?? item.id ?? '',
        title: item.title ?? 'Action Required',
        context: item.summary ?? item.description ?? '',
        aiRecommendation: item.aiRecommendation,
        actions: (item.actions ?? []).map((a: any) => ({
          label: a.label ?? 'Take Action',
          endpoint: a.endpoint ?? '#',
          method: a.method ?? (a.type === 'navigation' ? 'GET' : 'POST'),
          body: a.body,
          variant: a.variant ?? 'primary',
          confirmRequired: Boolean(a.confirmRequired || a.requiresConfirm),
          confirmation: a.confirmation,
        })),
        urgency: computeUrgency(item.priorityScore ?? 0),
      });
    }
  }
  return decisions;
}

export function mapScheduleToEvents(input: any, today: string): BriefingData['events'] {
  const events: BriefingData['events'] = [];
  const evts = input?.events ?? input ?? [];
  for (const e of (Array.isArray(evts) ? evts : []).filter((ev: any) => (ev.date ?? ev.scheduledAt ?? '').startsWith(today)).slice(0, 8)) {
    events.push({
      id: e.id ?? `evt-${Math.random().toString(36).slice(2)}`,
      type: (e.type ?? 'maintenance').toLowerCase() as any,
      title: e.title ?? e.type ?? 'Event',
      scheduledAt: e.date ?? e.scheduledAt ?? '',
      propertyName: e.propertyName ?? e.property?.name ?? '',
      unitName: e.unitName ?? e.unit?.name,
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
