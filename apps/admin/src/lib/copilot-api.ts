import type { BriefingData, Signal, Decision, PolicyEvaluation } from '@keyring/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Mock-User-Id': 'dev-admin-uuid-001',
  'X-Mock-Role': 'ADMIN',
});

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), ...opts });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `?${query}` : '';
}

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await api<T>(path);
  } catch {
    return fallback;
  }
}

export async function fetchBriefing(): Promise<BriefingData> {
  try {
    return await api<BriefingData>('api/briefing/daily');
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
    return await api<PolicyEvaluation>(`/rental-applications/${applicationId}/policy-evaluation`);
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

export async function fetchPortfolioWorkspace() {
  try {
    const propsRes = await api<any>('/properties');
    const data = propsRes.data || propsRes || [];
    
    const enriched = await Promise.all(data.map(async (p: any) => {
      const rollupRes = await api<any>(`/properties/${p.id}/rollup`).catch(() => ({}));
      return {
        id: p.id,
        name: p.name,
        address: p.address,
        ...rollupRes
      };
    }));
    return enriched;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchPropertyWorkspace(id: string) {
  const [property, rollup] = await Promise.allSettled([
    api(`/properties/${id}`),
    api(`/properties/${id}/rollup`),
  ]);
  return {
    property: property.status === 'fulfilled' ? property.value : null,
    rollup: rollup.status === 'fulfilled' ? rollup.value : null,
  };
}

export async function fetchUnitLedger(leaseId: string) {
  try {
    return await api(`/payments/ledger/accounts/${leaseId}`);
  } catch {
    return null;
  }
}

export async function fetchUnitWorkspace(propertyId: string, unitId: string) {
  const [property, rollup] = await Promise.allSettled([
    api(`/properties/${propertyId}`),
    api(`/properties/units/${unitId}/rollup`),
  ]);
  
  let unit = null;
  if (property.status === 'fulfilled' && (property.value as any)?.units) {
    unit = ((property.value as any).units).find((u: any) => u.id === unitId);
  }
  
  return {
    unit,
    rollup: rollup.status === 'fulfilled' ? rollup.value : null,
  };
}

export async function transitionUnitState(unitId: string, status: string) {
  return api(`/properties/units/${unitId}/transition`, {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}

export async function fetchWorkflows() {
  try {
    return await api('/workflows');
  } catch {
    return [];
  }
}

export async function fetchWorkflowExecutions() {
  try {
    return await api('/workflows/executions?limit=20');
  } catch {
    return [];
  }
}

export async function triggerWorkflow(id: string, input: Record<string, unknown>) {
  return api(`/workflows/${id}/execute`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function fetchUnitRepairs(unitId: string) {
  try {
    const res = await api<any>(`/maintenance?unitId=${unitId}`);
    return Array.isArray(res) ? res : res.data || [];
  } catch {
    return [];
  }
}

export async function fetchPropertyRepairs(propertyId: string) {
  try {
    const res = await api<any>(`/maintenance?propertyId=${propertyId}`);
    return Array.isArray(res) ? res : res.data || [];
  } catch {
    return [];
  }
}

export async function fetchAuditLogs(params?: {
  entityId?: string;
  module?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}) {
  try {
    return await api<{ data: any[]; total: number }>(`/audit-logs${buildQuery(params as Record<string, string>)}`);
  } catch {
    return { data: [], total: 0 };
  }
}

export async function fetchPortfolioAuditLogs() {
  try {
    return await api<{ data: any[]; total: number }>('/audit-logs?limit=20');
  } catch {
    return { data: [], total: 0 };
  }
}

export async function fetchPortfolioRepairs() {
  try {
    const res = await api<any>('/maintenance');
    return Array.isArray(res) ? res : res.data || [];
  } catch {
    return [];
  }
}

// ── Tenant Management ──────────────────────────────────────

export async function fetchTenants(params?: Record<string, string>) {
  try {
    const res = await api<any>(`/tenants${buildQuery(params)}`);
    return res;
  } catch {
    return { data: [], total: 0, skip: 0, take: 25 };
  }
}

export async function fetchTenantById(id: string) {
  return api<any>(`/tenants/${id}`);
}

export async function fetchTenantWorkspace(id: string) {
  try {
    return await api<any>(`/tenants/${id}/workspace`);
  } catch {
    return null;
  }
}

export async function fetchTenantHealth(id: string) {
  try {
    return await api<any>(`/tenants/${id}/health`);
  } catch {
    return null;
  }
}

export async function fetchTenantActivity(id: string, limit = 50) {
  try {
    return await api<any[]>(`/tenants/${id}/activity?limit=${limit}`);
  } catch {
    return [];
  }
}

export async function updateTenantProfile(id: string, data: Record<string, unknown>) {
  return api(`/tenants/${id}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function addHouseholdMember(tenantId: string, data: Record<string, unknown>) {
  return api(`/tenants/${tenantId}/household`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addViolation(tenantId: string, data: Record<string, unknown>) {
  return api(`/tenants/${tenantId}/violations`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


// ── Screening mutations ───────────────────────────────────────────────────────

export async function reviewApplication(
  id: number,
  data: {
    action: 'APPROVE' | 'CONDITIONAL_APPROVE' | 'DENY' | 'REQUEST_INFO' | 'SCHEDULE_INTERVIEW';
    note?: string;
    reason?: string;
    reasonCode?: string;
    conditionalDeposit?: number;
    requiresCosigner?: boolean;
  },
) {
  return api(`/rental-applications/${id}/review-action`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createApplication(data: Record<string, unknown>) {
  return api('/rental-applications', { method: 'POST', body: JSON.stringify(data) });
}

// ── Estimate mutations ────────────────────────────────────────────────────────

export async function approveEstimate(id: string) {
  return api(`/estimates/${id}/approve`, { method: 'PATCH' });
}

export async function rejectEstimate(id: string, reason?: string) {
  return api(`/estimates/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) });
}

// ── Bookkeeping mutations ─────────────────────────────────────────────────────

export async function categorizeTransaction(id: string, category: string) {
  return api(`/bookkeeping/transactions/${id}/categorize`, {
    method: 'PATCH',
    body: JSON.stringify({ category }),
  });
}

export async function approveOwnerStatement(id: string) {
  return api(`/bookkeeping/owner-statements/${id}/approve`, { method: 'PATCH' });
}

export async function sendOwnerStatement(id: string) {
  return api(`/bookkeeping/owner-statements/${id}/send`, { method: 'PATCH' });
}

export async function fetchChartOfAccounts() {
  try {
    return await api<Array<{ id: string; name: string; code: string }>>('/bookkeeping/chart-of-accounts');
  } catch {
    return [];
  }
}

// ── Renewal mutations ─────────────────────────────────────────────────────────

export async function createRenewalOffer(
  leaseId: string,
  data: {
    proposedRent: number;
    proposedStart: string;
    proposedEnd: string;
    message?: string;
    expiresAt?: string;
    escalationPercent?: number;
  },
) {
  return api(`/leases/${leaseId}/renewal-offers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Payment mutations ─────────────────────────────────────────────────────────

export async function issueDelinquencyNotice(data: {
  leaseId: string;
  deliveryMethod: string;
  approvalConfirmed: boolean;
  message?: string;
}) {
  return api('/payments/delinquency/issue-notice', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logManualPayment(data: {
  leaseId: string;
  propertyId: string;
  unitId?: string;
  tenantId: string;
  amountCents: number;
  method: string;
  referenceNumber?: string;
  receivedAt?: string;
  appliedTo?: string;
  memo?: string;
}) {
  return api('/payments/manual', { method: 'POST', body: JSON.stringify(data) });
}

// ── Lease mutations ───────────────────────────────────────────────────────────

export async function createLease(data: {
  startDate: string;
  endDate: string;
  rentAmount: number;
  tenantId: string;
  unitId: string;
  depositAmount?: number;
  noticePeriodDays?: number;
  autoRenew?: boolean;
  moveInAt?: string;
}) {
  return api('/leases', { method: 'POST', body: JSON.stringify(data) });
}

export async function recordLeaseNotice(
  leaseId: string,
  data: { type: string; deliveryMethod: string; message?: string },
) {
  return api(`/leases/${leaseId}/notices`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Messaging ─────────────────────────────────────────────────────────────────

export async function fetchConversations() {
  try {
    return await api<any[]>('/messaging/conversations');
  } catch {
    return [];
  }
}

export async function fetchMessages(conversationId: number) {
  try {
    return await api<any[]>(`/messaging/conversations/${conversationId}/messages`);
  } catch {
    return [];
  }
}

export async function createConversation(data: {
  subject?: string;
  content: string;
  participantIds?: string[];
}) {
  return api('/messaging/conversations', { method: 'POST', body: JSON.stringify(data) });
}

export async function sendMessage(conversationId: number, content: string) {
  return api(`/messaging/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotifications(params?: { unread?: boolean; limit?: number }) {
  try {
    const qs = new URLSearchParams();
    if (params?.unread) qs.set('unread', 'true');
    if (params?.limit) qs.set('limit', String(params.limit));
    return await api<any[]>(`/notifications?${qs.toString()}`);
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: number) {
  return api(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return api('/notifications/read-all', { method: 'POST' });
}

export async function deleteNotification(id: number) {
  return api(`/notifications/${id}`, { method: 'DELETE' });
}

// ── Maintenance mutations ─────────────────────────────────────────────────────

export async function createMaintenanceRequest(data: {
  title: string;
  category: string;
  priority: string;
  description: string;
  unitId?: string;
  propertyId?: string;
  tenantId?: string;
}) {
  return api('/maintenance', { method: 'POST', body: JSON.stringify(data) });
}

// ── Property mutations ────────────────────────────────────────────────────────

export async function createProperty(data: {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  propertyType?: string;
}) {
  return api('/properties', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProperty(id: string, data: Record<string, unknown>) {
  return api(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function createUnit(
  propertyId: string,
  data: {
    name: string;
    unitNumber?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    status?: string;
  },
) {
  return api(`/properties/${propertyId}/units`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUnit(propertyId: string, unitId: string, data: Record<string, unknown>) {
  return api(`/properties/${propertyId}/units/${unitId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Inspections ───────────────────────────────────────────────────────────────

export async function fetchInspections(params?: { propertyId?: string; status?: string }) {
  try {
    return await api<any[]>(`/inspections${buildQuery(params as Record<string, string>)}`);
  } catch {
    return [];
  }
}

export async function fetchInspection(id: number) {
  try {
    return await api<any>(`/inspections/${id}`);
  } catch {
    return null;
  }
}

export async function createInspection(data: Record<string, unknown>) {
  return api('/inspections', { method: 'POST', body: JSON.stringify(data) });
}

export async function completeInspection(id: number) {
  return api(`/inspections/${id}/complete`, { method: 'POST' });
}

export async function startInspection(id: number) {
  return api('/inspections/start', { method: 'POST', body: JSON.stringify({ inspectionId: id }) });
}

// ── Documents ─────────────────────────────────────────────────────────────────

export async function fetchDocuments(params?: { propertyId?: string; leaseId?: string; category?: string }) {
  try {
    return await api<any[]>(`/documents${buildQuery(params as Record<string, string>)}`);
  } catch {
    return [];
  }
}

export async function uploadDocument(formData: FormData) {
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
  const res = await fetch(`${BASE}/documents/upload`, {
    method: 'POST',
    headers: { 'X-Mock-Role': 'PROPERTY_MANAGER' },
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export function getDocumentDownloadUrl(id: number) {
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${BASE}/documents/${id}/download`;
}

// ── E-Signatures ──────────────────────────────────────────────────────────────

export async function fetchEsignEnvelopes() {
  try {
    return await api<any[]>('/esignature/risk-queue');
  } catch {
    return [];
  }
}

export async function voidEnvelope(id: string) {
  return api(`/esignature/envelopes/${id}/void`, { method: 'PATCH' });
}

export async function resendEnvelope(id: string) {
  return api(`/esignature/envelopes/${id}/resend`, { method: 'POST' });
}

export function getSignedDocUrl(id: string) {
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${BASE}/esignature/envelopes/${id}/documents/signed`;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function fetchRentRoll(params?: { propertyId?: string }) {
  try {
    return await api<any>(`/reporting/rent-roll${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchProfitLoss(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
  try {
    return await api<any>(`/reporting/profit-loss${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchVacancyRate(params?: { propertyId?: string }) {
  try {
    return await api<any>(`/reporting/vacancy-rate${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchDelinquencyAnalytics() {
  try {
    return await api<any>('/reporting/delinquency-analytics');
  } catch { return null; }
}

export async function fetchMaintenanceAnalytics(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
  try {
    return await api<any>(`/reporting/maintenance-analytics${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchPaymentHistory(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
  try {
    return await api<any>(`/reporting/payment-history${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchCapexAnalytics(params?: { propertyId?: string; upgradeCost?: number; rentBump?: number }) {
  try {
    return await api<any>(`/reporting/analytics/capex${buildQuery(params as Record<string, string | number>)}`);
  } catch { return null; }
}

// fetchAuditLogs is defined above near fetchPortfolioAuditLogs
