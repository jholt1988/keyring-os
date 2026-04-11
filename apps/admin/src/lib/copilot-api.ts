import type { BriefingData, Signal, Decision, PolicyEvaluation } from '@keyring/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Mock-User-Id': 'dev-admin-uuid-001',
  'X-Mock-Role': 'admin',
});

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), ...opts });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
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
    api('/api/v2/feed'),
    api('/schedule/events'),
  ]);

  const signals: Signal[] = [];
  const decisions: Decision[] = [];
  const events: BriefingData['events'] = [];
  let atRiskAmount = 0;

  if (delinquency.status === 'fulfilled') {
    const buckets = (delinquency.value as any)?.buckets ?? delinquency.value;
    if (Array.isArray(buckets)) {
      for (const b of buckets) {
        for (const item of b.items ?? []) {
          const amount = item.outstandingAmount ?? item.amount ?? 0;
          atRiskAmount += amount;
          signals.push({
            id: `delinq-${item.leaseId ?? item.id}`,
            severity: (item.daysOverdue ?? 0) > 30 ? 'critical' : (item.daysOverdue ?? 0) > 7 ? 'high' : 'medium',
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
    }
  }

  if (feedData.status === 'fulfilled') {
    const items = (feedData.value as any)?.items ?? feedData.value ?? [];
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
            method: a.method ?? 'POST',
            body: a.body,
            variant: a.variant ?? 'primary',
          })),
          urgency: item.priorityScore > 80 ? 'immediate' : item.priorityScore > 50 ? 'today' : 'this_week',
        });
      }
    }
  }

  if (schedule.status === 'fulfilled') {
    const evts = (schedule.value as any)?.events ?? schedule.value ?? [];
    const today = new Date().toISOString().split('T')[0];
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
  }

  return {
    signals: signals.sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 } as const;
      return sev[a.severity] - sev[b.severity];
    }),
    decisions,
    events,
    metrics: { atRiskAmount, pendingDecisions: decisions.length, todayEvents: events.length, vacantUnits: 0, overduePayments: signals.filter(s => s.domain === 'payments').length },
  };
}

export async function executeDecisionAction(endpoint: string, method: string, body?: Record<string, unknown>) {
  return api(endpoint, { method, body: body ? JSON.stringify(body) : undefined });
}

export async function fetchPaymentsWorkspace() {
  const [delinquency, opsSummary, invoices] = await Promise.allSettled([
    api('/payments/delinquency/queue'),
    api('/payments/ops-summary'),
    api('/payments/invoices'),
  ]);
  return {
    delinquency: delinquency.status === 'fulfilled' ? delinquency.value : null,
    opsSummary: opsSummary.status === 'fulfilled' ? opsSummary.value : null,
    invoices: invoices.status === 'fulfilled' ? invoices.value : null,
  };
}

export async function fetchLeasingWorkspace() {
  const [opsSummary, stats, leads] = await Promise.allSettled([
    api('/leasing/ops-summary'),
    api('/leasing/statistics'),
    api('/leasing/leads'),
  ]);
  return {
    opsSummary: opsSummary.status === 'fulfilled' ? opsSummary.value : null,
    stats: stats.status === 'fulfilled' ? stats.value : null,
    leads: leads.status === 'fulfilled' ? leads.value : null,
  };
}

export async function fetchRepairsWorkspace() {
  const [requests, estimates, aiMetrics] = await Promise.allSettled([
    api('/maintenance?sortBy=priority&sortOrder=asc'),
    api('/estimates'),
    api('/maintenance/ai-metrics'),
  ]);
  return {
    requests: requests.status === 'fulfilled' ? requests.value : null,
    estimates: estimates.status === 'fulfilled' ? estimates.value : null,
    aiMetrics: aiMetrics.status === 'fulfilled' ? aiMetrics.value : null,
  };
}

export async function fetchRenewalsWorkspace() {
  const [leases, recommendations] = await Promise.allSettled([
    api('/leases'),
    api('/rent-recommendations'),
  ]);
  return {
    leases: leases.status === 'fulfilled' ? leases.value : null,
    recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
  };
}

export async function fetchScreeningWorkspace() {
  try {
    const apps = await api<any>('/rental-applications');
    return { applications: Array.isArray(apps) ? apps : apps?.data ?? apps?.applications ?? [] };
  } catch {
    return { applications: [] };
  }
}

export async function fetchPolicyEvaluation(applicationId: string): Promise<PolicyEvaluation | null> {
  try {
    return await api<PolicyEvaluation>(`/screening/${applicationId}/policy-evaluation`);
  } catch {
    return null;
  }
}

export async function fetchFinancialsWorkspace() {
  const [workspace, reconciliation, chartOfAccounts] = await Promise.allSettled([
    api('/bookkeeping/workspace'),
    api('/bookkeeping/reconciliation'),
    api('/bookkeeping/chart-of-accounts'),
  ]);
  return {
    ...(workspace.status === 'fulfilled' ? (workspace.value as any) : {
      pendingTransactions: [],
      exceptions: [],
      reconciliation: { unmatchedCount: 0, matchedCount: 0, exceptionCount: 0, items: [] },
      monthlyClose: [],
      ownerStatements: [],
      metrics: { unreconciledAmount: 0, pendingCategorization: 0, exceptionsCount: 0, monthsOpen: 0, ownerDistributionsDue: 0 },
    }),
    reconciliationDetail: reconciliation.status === 'fulfilled' ? reconciliation.value : null,
    chartOfAccounts: chartOfAccounts.status === 'fulfilled' ? chartOfAccounts.value : [],
  };
}
