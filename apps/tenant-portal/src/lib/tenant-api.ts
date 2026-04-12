import type { TenantFeedResponse } from '@keyring/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const MOCK_USER_ID = process.env.NEXT_PUBLIC_MOCK_USER_ID ?? 'dev-tenant-uuid-001';

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Mock-User-Id': MOCK_USER_ID,
    'X-Mock-Role': 'TENANT',
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: headers() });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Feed ─────────────────────────────────────────────────────────────────────

export async function fetchTenantFeed(): Promise<TenantFeedResponse> {
  return api<TenantFeedResponse>('/tenant/feed');
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface TenantDashboard {
  lease?: {
    id: string;
    status: string;
    endDate: string;
    rentAmount: number;
    unit?: { address?: string; unitNumber?: string; property?: { name?: string } };
  };
  maintenanceRequests?: { id: string; title: string; status: string }[];
  recentInspections?: unknown[];
  notifications?: unknown[];
  upcomingEvents?: unknown[];
}

export async function fetchTenantDashboard(): Promise<TenantDashboard> {
  return api<TenantDashboard>('/tenant/dashboard');
}

// ── Lease ────────────────────────────────────────────────────────────────────

export interface Lease {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  noticePeriodDays: number;
  moveOutAt?: string;
  unit?: {
    id: string;
    unitNumber: string;
    property?: { id: string; name: string; address?: string };
  };
  renewalOffers?: RenewalOffer[];
  esignEnvelopes?: EsignEnvelope[];
  documents?: LeaseDocument[];
}

export interface RenewalOffer {
  id: number;
  proposedRent: number;
  proposedStart: string;
  proposedEnd: string;
  status: string;
  message?: string;
  expiresAt?: string;
}

export interface EsignEnvelope {
  id: number;
  status: string;
  providerEnvelopeId: string;
  createdAt: string;
}

export interface LeaseDocument {
  id: number;
  name: string;
  fileType?: string;
  createdAt: string;
}

export async function fetchMyLease(): Promise<Lease | null> {
  try {
    return await api<Lease>('/leases/my-lease');
  } catch {
    return null;
  }
}

export async function fetchRenewalOffers(leaseId: string): Promise<RenewalOffer[]> {
  try {
    return await api<RenewalOffer[]>(`/leases/${leaseId}/renewal-offers`);
  } catch {
    return [];
  }
}

export async function respondToRenewalOffer(
  leaseId: string,
  offerId: number,
  decision: 'ACCEPTED' | 'DECLINED',
): Promise<void> {
  await api(`/leases/${leaseId}/renewal-offers/${offerId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ decision }),
  });
}

export async function fetchSigningEnvelopes(leaseId: string): Promise<EsignEnvelope[]> {
  try {
    return await api<EsignEnvelope[]>(`/esignature/leases/${leaseId}/envelopes`);
  } catch {
    return [];
  }
}

export async function fetchRecipientViewUrl(envelopeId: number): Promise<{ url: string }> {
  return api<{ url: string }>(`/esignature/envelopes/${envelopeId}/recipient-view`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function submitMoveOutNotice(
  leaseId: string,
  data: { moveOutDate: string; reason?: string },
): Promise<void> {
  await api(`/leases/${leaseId}/tenant-notices`, {
    method: 'POST',
    body: JSON.stringify({ type: 'MOVE_OUT', ...data }),
  });
}

// ── Payments ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  status: string;
  invoiceId?: number;
}

export interface Invoice {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  issuedAt: string;
}

export interface LedgerEntry {
  id: number | string;
  date: string;
  description: string;
  charge?: number;
  payment?: number;
  balance: number;
}

export interface AutopayEnrollment {
  id?: number;
  leaseId: string;
  isActive: boolean;
  paymentMethodId?: number;
}

export async function fetchPayments(): Promise<Payment[]> {
  try {
    return await api<Payment[]>('/payments');
  } catch {
    return [];
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    return await api<Invoice[]>('/payments/invoices');
  } catch {
    return [];
  }
}

export async function fetchLedger(leaseId: string): Promise<LedgerEntry[]> {
  try {
    const data = await api<{ entries?: LedgerEntry[] } | LedgerEntry[]>(
      `/payments/ledger/accounts/${leaseId}`,
    );
    return Array.isArray(data) ? data : (data.entries ?? []);
  } catch {
    return [];
  }
}

export async function fetchAutopay(): Promise<AutopayEnrollment | null> {
  try {
    return await api<AutopayEnrollment>('/billing/autopay');
  } catch {
    return null;
  }
}

export async function enableAutopay(leaseId: string, paymentMethodId?: number): Promise<void> {
  await api('/billing/autopay', {
    method: 'POST',
    body: JSON.stringify({ leaseId, paymentMethodId }),
  });
}

export async function disableAutopay(leaseId: string): Promise<void> {
  await api(`/billing/autopay/${leaseId}/disable`, { method: 'PATCH' });
}

export async function createStripeCheckoutSession(data: {
  leaseId: string;
  amount: number;
  invoiceId?: number;
}): Promise<{ url: string }> {
  return api<{ url: string }>('/payments/stripe/checkout-session', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceNote {
  id: number;
  content: string;
  createdAt: string;
  author?: { firstName?: string; lastName?: string };
}

export async function fetchMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  try {
    return await api<MaintenanceRequest[]>('/maintenance');
  } catch {
    return [];
  }
}

export async function fetchMaintenanceRequest(id: string): Promise<MaintenanceRequest | null> {
  try {
    return await api<MaintenanceRequest>(`/maintenance/${id}`);
  } catch {
    return null;
  }
}

export async function createMaintenanceRequest(data: {
  title: string;
  description: string;
  category: string;
  priority: string;
}): Promise<MaintenanceRequest> {
  return api<MaintenanceRequest>('/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addMaintenanceNote(id: string, content: string): Promise<void> {
  await api(`/maintenance/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function confirmMaintenanceComplete(id: string): Promise<void> {
  await api(`/maintenance/${id}/confirm-complete`, { method: 'POST' });
}

// ── Documents ─────────────────────────────────────────────────────────────────

export interface Document {
  id: number;
  name: string;
  fileType?: string;
  category?: string;
  createdAt: string;
  url?: string;
}

export async function fetchDocuments(): Promise<Document[]> {
  try {
    return await api<Document[]>('/documents');
  } catch {
    return [];
  }
}

export function getDocumentDownloadUrl(id: number): string {
  return `${BASE}/documents/${id}/download`;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(params?: { read?: boolean }): Promise<Notification[]> {
  try {
    const qs = params?.read !== undefined ? `?read=${params.read}` : '';
    return await api<Notification[]>(`/notifications${qs}`);
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: number): Promise<void> {
  await api(`/notifications/${id}/read`, { method: 'PUT' });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export interface Conversation {
  id: number;
  subject?: string;
  updatedAt: string;
  participants?: { userId: string; user?: { firstName?: string; lastName?: string } }[];
  messages?: Message[];
}

export interface Message {
  id: number;
  content: string;
  senderId: string;
  conversationId: number;
  createdAt: string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    return await api<Conversation[]>('/messaging/conversations');
  } catch {
    return [];
  }
}

export async function fetchMessages(conversationId: number): Promise<Message[]> {
  try {
    return await api<Message[]>(`/messaging/conversations/${conversationId}/messages`);
  } catch {
    return [];
  }
}

export async function sendMessage(conversationId: number, content: string): Promise<Message> {
  return api<Message>(`/messaging/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function createConversation(data: {
  subject: string;
  content: string;
}): Promise<Conversation> {
  return api<Conversation>('/messaging/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Inspections ───────────────────────────────────────────────────────────────

export interface Inspection {
  id: number;
  type: string;
  status: string;
  createdAt: string;
  rooms?: InspectionRoom[];
}

export interface InspectionRoom {
  id: number;
  name: string;
  roomType: string;
  checklistItems?: { id: number; label: string; condition?: string; notes?: string }[];
}

export async function fetchInspections(): Promise<Inspection[]> {
  try {
    return await api<Inspection[]>('/inspections');
  } catch {
    return [];
  }
}

export async function fetchInspection(id: number): Promise<Inspection | null> {
  try {
    return await api<Inspection>(`/inspections/${id}`);
  } catch {
    return null;
  }
}
