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
    return await api<BriefingData>('/api/briefing/daily');
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

export async function fetchManualPaymentsSummary(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
  try {
    return await api<any>(`/reporting/manual-payments-summary${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchManualChargesSummary(params?: { propertyId?: string; startDate?: string; endDate?: string }) {
  try {
    return await api<any>(`/reporting/manual-charges-summary${buildQuery(params as Record<string, string>)}`);
  } catch { return null; }
}

export async function fetchOpexAnomalies() {
  try {
    return await api<any>('/reporting/analytics/opex-anomalies');
  } catch { return null; }
}

export async function fetchReportHeatmap() {
  try {
    return await api<any>('/reporting/analytics/heatmap');
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

export async function fetchTours(params?: { leadId?: string; propertyId?: string; status?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
  if (params?.leadId) {
    const res = await api<any>(`/api/tours/lead/${params.leadId}`);
    return res?.tours ?? res;
  }

  const res = await api<any>(`/api/tours${buildQuery(params as Record<string, string | number | boolean | undefined | null>)}`);
  return res?.tours ?? res;
}

export async function scheduleTour(data: { leadId: string; propertyId: string; unitId?: string; date?: string; time?: string; preferredDate?: string; preferredTime?: string; notes?: string; agentId?: string }) {
  return api('/api/tours/schedule', {
    method: 'POST',
    body: JSON.stringify({
      leadId: data.leadId,
      propertyId: data.propertyId,
      unitId: data.unitId,
      preferredDate: data.preferredDate ?? data.date,
      preferredTime: data.preferredTime ?? data.time,
      notes: data.notes,
    }),
  });
}

export async function updateTourStatus(id: string, status: string, feedback?: string) {
  return api(`/api/tours/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, feedback }),
  });
}

export async function assignTour(id: string, userId: string) {
  return api(`/api/tours/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  });
}

export async function rescheduleTour(id: string, data: { scheduledAt?: string; scheduledDate?: string; scheduledTime?: string }) {
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  const scheduledDate = data.scheduledDate ?? (scheduledAt ? scheduledAt.toISOString().slice(0, 10) : undefined);
  const scheduledTime = data.scheduledTime ?? (scheduledAt ? scheduledAt.toISOString().slice(11, 16) : undefined);

  return api(`/api/tours/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduledDate, scheduledTime }),
  });
}

export async function fetchPaymentPlans(params?: { invoiceId?: number } | unknown) {
  const query = params && typeof params === 'object' && 'invoiceId' in (params as Record<string, unknown>)
    ? { invoiceId: (params as { invoiceId?: number }).invoiceId }
    : undefined;

  return api(`/payments/payment-plans${buildQuery(query as Record<string, string | number | boolean | undefined | null> | undefined)}`);
}

export async function fetchLegalTracker(leaseId: string) {
  return api(`/payments/delinquency/legal-tracker/${leaseId}`);
}

export async function fetchAttorneyPacket(leaseId: string) {
  return api(`/payments/delinquency/attorney-packet/${leaseId}`);
}

export async function referAttorney(data: { leaseId: string; attorneyEmail?: string; attorneyName?: string; summary?: string; approvalConfirmed?: boolean }) {
  return api('/payments/delinquency/refer-attorney', {
    method: 'POST',
    body: JSON.stringify({
      leaseId: data.leaseId,
      attorneyEmail: data.attorneyEmail ?? 'counsel@example.com',
      attorneyName: data.attorneyName,
      summary: data.summary,
      approvalConfirmed: data.approvalConfirmed ?? true,
    }),
  });
}

export async function resolveLegalHold(data: { leaseId: string; reason?: string }) {
  return api(`/payments/delinquency/by-payment/${data.leaseId}/promise-to-pay`, {
    method: 'POST',
    body: JSON.stringify({ reason: data.reason ?? 'Resolved from admin parity surface.' }),
  });
}

export async function recordCourtDate(data: { leaseId: string; courtDate: string; docketNumber?: string; courtroom?: string; notes?: string }) {
  return api('/payments/delinquency/record-court-date', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createStripeCheckoutSession(data: { invoiceId: number; leaseId?: string; amount?: number; successUrl?: string; cancelUrl?: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return api('/payments/stripe/checkout-session', {
    method: 'POST',
    body: JSON.stringify({
      invoiceId: data.invoiceId,
      successUrl: data.successUrl ?? `${origin}/payments?checkout=success`,
      cancelUrl: data.cancelUrl ?? `${origin}/payments?checkout=cancelled`,
    }),
  });
}

export async function createPaymentPlan(data: Record<string, unknown>) {
  if (typeof data.invoiceId !== 'number') {
    throw new Error('createPaymentPlan requires invoiceId for the current backend contract.');
  }

  return api('/payments/payment-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createManualCharge(data: Record<string, unknown>) {
  return api('/payments/charges/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function voidManualCharge(id: string, reason = 'Voided from admin parity surface.') {
  return api(`/payments/charges/manual/${id}/void`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function fetchContractorBids(params?: { propertyId?: string; requestId?: string; status?: string }) {
  return api(`/contractor-bidding/bids${buildQuery(params as Record<string, string | number | boolean | undefined | null>)}`);
}

export async function createBid(data: Record<string, unknown>) {
  return api('/contractor-bidding/bids', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function awardBid(id: string) {
  return api(`/contractor-bidding/bids/${id}/award`, {
    method: 'PATCH',
  });
}

export async function rejectBid(id: string) {
  return api(`/contractor-bidding/bids/${id}/reject`, {
    method: 'PATCH',
  });
}

export async function aiScoreBid(id: string) {
  return api(`/contractor-bidding/bids/${id}/ai-score`, {
    method: 'POST',
  });
}

export async function fetchContractorRecommendations(propertyId: string, scope = 'general') {
  return api(`/contractor-bidding/properties/${propertyId}/recommendations${buildQuery({ scope })}`);
}

export async function fetchBillingSchedules() {
  return api('/billing/schedules');
}

export async function createBillingSchedule(data: Record<string, unknown>) {
  return api('/billing/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAutopay(params?: { leaseId?: string } | unknown) {
  const query = params && typeof params === 'object' && 'leaseId' in (params as Record<string, unknown>)
    ? { leaseId: (params as { leaseId?: string }).leaseId }
    : undefined;

  return api(`/billing/autopay${buildQuery(query as Record<string, string | number | boolean | undefined | null> | undefined)}`);
}

export async function enableAutopay(data: Record<string, unknown>) {
  return api('/billing/autopay', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function disableAutopay(leaseId: string) {
  return api(`/billing/autopay/${leaseId}/disable`, {
    method: 'PATCH',
  });
}

export async function fetchFeeScheduleVersions() {
  return api('/billing/fee-schedules/versions');
}

export async function fetchLeadApplications(params?: { propertyId?: string; status?: string; dateFrom?: string; dateTo?: string; limit?: number; offset?: number }) {
  const res = await api<any>(`/applications${buildQuery(params as Record<string, string | number | boolean | undefined | null>)}`);
  return res?.applications ?? res?.items ?? res?.data ?? res;
}

export async function submitLeadApplication(data: Record<string, unknown>) {
  return api('/applications/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLeadApplicationStatus(id: string, status: string, extras?: Record<string, unknown>) {
  return api(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(extras ?? {}) }),
  });
}

export async function triggerApplicationScreening(id: string, data?: Record<string, unknown>) {
  return api(`/applications/${id}/screening`, {
    method: 'PATCH',
    body: JSON.stringify(data ?? {}),
  });
}

export async function triggerSyndication(propertyId: string, data?: Record<string, unknown>) {
  return api(`/listings/syndication/${propertyId}/trigger`, {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  });
}

export async function getQuickBooksAuthUrl(): Promise<{ authUrl?: string; url?: string }> {
  const result = await api<any>('/quickbooks/auth-url');
  return {
    ...result,
    url: result?.url ?? result?.authUrl,
    authUrl: result?.authUrl ?? result?.url,
  };
}

export async function fetchQuickBooksStatus() {
  return api('/quickbooks/status');
}

export async function fetchAccountingSyncStatus() {
  return api('/quickbooks/status');
}

export async function syncQuickBooks() {
  return api('/quickbooks/sync', {
    method: 'POST',
  });
}

export async function disconnectQuickBooks() {
  return api('/quickbooks/disconnect', {
    method: 'POST',
  });
}

export async function testQuickBooksConnection() {
  return api('/quickbooks/test-connection');
}

export async function fetchSecurityEvents(params?: { userId?: string; username?: string; type?: string; from?: string; to?: string; limit?: number; offset?: number }) {
  return api(`/security-events${buildQuery(params as Record<string, string | number | boolean | undefined | null>)}`);
}

export async function fetchSmartDevices(params?: { propertyId?: string; unitId?: string }) {
  return api(`/smart-devices${buildQuery(params as Record<string, string | number | boolean | undefined | null>)}`);
}

export async function registerSmartDevice(data: Record<string, unknown>) {
  return api('/smart-devices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAccessCodes(deviceId: string) {
  return api(`/smart-devices/${deviceId}/access-codes`);
}

export async function createAccessCode(deviceId: string, data: Record<string, unknown>) {
  return api(`/smart-devices/${deviceId}/access-codes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchTenantInsurance(leaseId: string) {
  return api(`/tenant-insurance/lease/${leaseId}`);
}

export async function recordTenantInsurance(leaseId: string, data: Record<string, unknown>) {
  return api(`/tenant-insurance/lease/${leaseId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function recordMasterBill(data: Record<string, unknown>) {
  return api('/utility-billing/master-bill', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function allocateMasterBill(id: string) {
  return api(`/utility-billing/master-bill/${id}/allocate`, {
    method: 'POST',
  });
}

export async function fetchVendors() {
  return api('/vendors');
}

export async function createVendor(data: Record<string, unknown>) {
  return api('/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getVendors1099ExportUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${base}/vendors/1099-export`;
}

export async function fetchRentRecommendations() {
  return api('/rent-recommendations');
}

export async function fetchPendingRecommendations() {
  return api('/rent-recommendations/pending');
}

export async function generateRecommendations(data?: { unitIds?: string[] }) {
  return api('/rent-recommendations/generate', {
    method: 'POST',
    body: JSON.stringify({ unitIds: data?.unitIds ?? [] }),
  });
}

export async function bulkGenerateRecommendations() {
  return api('/rent-recommendations/bulk-generate/all', {
    method: 'POST',
  });
}

export async function acceptRecommendation(id: string) {
  return api(`/rent-recommendations/${id}/accept`, {
    method: 'POST',
  });
}

export async function rejectRecommendation(id: string) {
  return api(`/rent-recommendations/${id}/reject`, {
    method: 'POST',
  });
}

export async function applyRecommendation(id: string) {
  return api(`/rent-recommendations/${id}/apply`, {
    method: 'POST',
  });
}

export async function startMoveIn(data: { leaseId: string; tenantId: string }) {
  return api('/move-orchestration/move-in', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function startMoveOut(data: { leaseId: string; tenantId: string }) {
  return api('/move-orchestration/move-out', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchOwnerDraws(statementId: string) {
  return api(`/owner-portal/draws/statement/${statementId}`);
}

export async function createOwnerDraw(statementId: string, data: { amount?: number; bankAccount?: string; bankAccountId?: string }) {
  return api(`/owner-portal/draws/statement/${statementId}`, {
    method: 'POST',
    body: JSON.stringify({
      amountCents: Math.round(Number(data.amount ?? 0) * 100),
      bankAccountId: data.bankAccountId ?? data.bankAccount,
    }),
  });
}

export async function allocateTransaction(
  id: string,
  data: { propertyId?: string; unitId?: string; leaseId?: string; vendorId?: string; ownerId?: string; accountId?: string; amountCents?: number },
) {
  return api(`/bookkeeping/transactions/${id}/allocate`, {
    method: 'POST',
    body: JSON.stringify({
      allocations: [{
        accountId: data.accountId ?? 'unassigned',
        amountCents: data.amountCents ?? 0,
        propertyId: data.propertyId,
        unitId: data.unitId,
        leaseId: data.leaseId,
        vendorId: data.vendorId,
        ownerId: data.ownerId,
      }],
    }),
  });
}

export async function confirmReconciliationItem(id: string) {
  return api(`/bookkeeping/reconciliation/items/${id}/confirm`, {
    method: 'PATCH',
  });
}

export async function flagTransactionException(id: string, data?: { reason?: string; reviewed?: boolean }) {
  return api(`/bookkeeping/transactions/${id}/exception`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: data?.reason ?? (data?.reviewed ? 'Marked for review from admin parity surface.' : 'Exception flagged from admin parity surface.') }),
  });
}

export async function lockMonthlyClose(propertyId: string, month?: string) {
  return api(`/bookkeeping/monthly-close/${propertyId}/lock`, {
    method: 'POST',
    body: JSON.stringify({ month: month ?? new Date().toISOString().slice(0, 7) }),
  });
}

export async function reopenMonthlyClose(propertyId: string, month?: string, reason = 'Reopened from admin parity surface.') {
  return api(`/bookkeeping/monthly-close/${propertyId}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ month: month ?? new Date().toISOString().slice(0, 7), reason }),
  });
}

export async function fetchLeaseAbstractions() {
  return api('/lease-abstraction/abstractions');
}

export async function fetchLeaseAbstractionAnalytics(): Promise<{
  totalAbstractions: number;
  reviewedCount: number;
  pendingCount: number;
  accuracyScore: number | string;
  [key: string]: unknown;
}> {
  const result = await api<any>('/lease-abstraction/analytics');
  const reviewedCount = Number(result?.byStatus?.REVIEWED ?? 0);
  const pendingCount = Number(result?.needsReview ?? result?.byStatus?.REVIEW_NEEDED ?? 0);
  return {
    ...result,
    totalAbstractions: Number(result?.totalAbstractions ?? 0),
    reviewedCount,
    pendingCount,
    accuracyScore: result?.averageConfidence ?? 'n/a',
  };
}

export async function extractLease(data: FormData | { leaseId?: string; documentId?: string }) {
  const leaseId = data instanceof FormData ? String(data.get('leaseId') ?? '') : (data.leaseId ?? '');
  const documentId = data instanceof FormData ? String(data.get('documentId') ?? '') : (data.documentId ?? '');
  return api('/lease-abstraction/extract', {
    method: 'POST',
    body: JSON.stringify({ leaseId, documentId }),
  });
}

export async function bulkExtractLeases(_data?: FormData | unknown) {
  return api('/lease-abstraction/bulk-extract', {
    method: 'POST',
  });
}

export async function reviewLeaseAbstraction(id: string, data?: { reviewedById?: string; reviewed?: boolean; approved?: boolean }) {
  return api(`/lease-abstraction/abstractions/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewedById: data?.reviewedById ?? 'admin' }),
  });
}

export async function fetchChatSession(sessionId: string): Promise<{ messages: any[]; thread: any[] }> {
  const messages = await api<any[]>(`/chatbot/session/${sessionId}`);
  const normalized = Array.isArray(messages) ? messages : [];
  return { messages: normalized, thread: normalized };
}

export async function sendChatMessage(message: string, sessionId?: string): Promise<{ sessionId?: string; [key: string]: unknown }> {
  return api('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
}

export async function fetchCapexForecasts(): Promise<any[]> {
  const result = await api<any>('/capex-forecasting/forecasts');
  return Array.isArray(result) ? result : [];
}

export async function createCapexForecast(data: { propertyId: string; estimatedCost?: number; description?: string; category?: string; projectedYear?: number; urgency?: string; confidenceScore?: number; aiRationale?: string }) {
  return api('/capex-forecasting/forecasts', {
    method: 'POST',
    body: JSON.stringify({
      propertyId: data.propertyId,
      category: data.category ?? 'GENERAL',
      description: data.description,
      estimatedCostCents: Math.round(Number(data.estimatedCost ?? 0) * 100),
      projectedYear: data.projectedYear ?? new Date().getFullYear(),
      urgency: data.urgency ?? 'MEDIUM',
      confidenceScore: data.confidenceScore,
      aiRationale: data.aiRationale,
    }),
  });
}

export async function approveCapexForecast(id: string, approvedBudget?: number) {
  return api(`/capex-forecasting/forecasts/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approvedBudget: approvedBudget ?? 0 }),
  });
}

export async function completeCapexForecast(id: string, actualCostCents?: number) {
  return api(`/capex-forecasting/forecasts/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ actualCostCents: actualCostCents ?? 0 }),
  });
}

export async function generateCapexForecast(propertyId: string) {
  return api(`/capex-forecasting/properties/${propertyId}/generate`, {
    method: 'POST',
  });
}

export async function fetchCapexSummary(): Promise<{
  totalForecastedSpend: number;
  approvedCount: number;
  pendingCount: number;
  [key: string]: unknown;
}> {
  const result = await api<any>('/capex-forecasting/summary');
  const byUrgency = result?.byUrgency ?? {};
  const totalForecasts = Number(result?.totalForecasts ?? 0);
  const approvedCount = Number(byUrgency?.APPROVED ?? 0);
  return {
    ...result,
    totalForecastedSpend: Number(result?.totalEstimatedCents ?? 0) / 100,
    approvedCount,
    pendingCount: Math.max(0, totalForecasts - approvedCount),
  };
}

// fetchAuditLogs is defined above near fetchPortfolioAuditLogs

// ========== GAP REMEDIATION: Admin API Connectors ==========

export async function getDelinquencyLegalTracker(leaseId: string) {
  return await api(`/payments/delinquency/legal-tracker/${leaseId}`);
}

export async function getLedgerAccount(leaseId: string) {
  return await api(`/payments/ledger/accounts/${leaseId}`);
}

export async function assignVendor(maintenanceId: string, vendorId: string, notes?: string) {
  return await api(`/maintenance/${maintenanceId}/assign-vendor`, {
    method: 'POST',
    body: JSON.stringify({ vendorId, notes }),
  });
}

export async function notifyTenantMaintenance(maintenanceId: string, message: string) {
  return await api(`/maintenance/${maintenanceId}/notify-tenant`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function generateLeaseDocument(leaseId: string) {
  return await api(`/leases/${leaseId}/generate-document`, {
    method: 'POST',
  });
}

export async function sendLeaseForSignature(leaseId: string, signerEmail?: string, signerName?: string) {
  return await api(`/leases/${leaseId}/send-for-signature`, {
    method: 'POST',
    body: JSON.stringify({ signerEmail, signerName }),
  });
}

