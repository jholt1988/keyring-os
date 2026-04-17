// Gap Remediation API Client
// Generated endpoints from P0 fixes

const API_BASE = '/api/v2';

// ========== Payment Execution (Issue 1) ==========

export async function messageTenant(paymentId: number, subject: string, message: string) {
  return fetch(`${API_BASE}/payments/${paymentId}/message-tenant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, message }),
  }).then(r => r.json());
}

export async function recordManualPayment(
  paymentId: number,
  amount: number,
  paymentDate: string,
  notes?: string,
  paymentMethod?: string
) {
  return fetch(`${API_BASE}/payments/${paymentId}/record-manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, paymentDate, notes, paymentMethod }),
  }).then(r => r.json());
}

// ========== Lease Signing Flow (Issue 3) ==========

export async function generateLeaseDocument(leaseId: number) {
  return fetch(`${API_BASE}/leases/${leaseId}/generate-document`, {
    method: 'POST',
  }).then(r => r.json());
}

export async function sendForSignature(leaseId: number, signerEmail?: string, signerName?: string) {
  return fetch(`${API_BASE}/leases/${leaseId}/send-for-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signerEmail, signerName }),
  }).then(r => r.json());
}

// ========== Move-in State Machine (Issue 4) ==========

export async function startOnboarding(unitId: string) {
  return fetch(`${API_BASE}/property/units/${unitId}/start-onboarding`, {
    method: 'POST',
  }).then(r => r.json());
}

export async function completeMoveIn(unitId: string, notes?: string) {
  return fetch(`${API_BASE}/property/units/${unitId}/complete-move-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  }).then(r => r.json());
}

// ========== Screening Risk Reasoning (Issue 5) ==========

export async function getScreeningReasoning(applicationId: number) {
  return fetch(`${API_BASE}/rental-applications/${applicationId}/screening-reasoning`, {
    method: 'GET',
  }).then(r => r.json());
}

// ========== Maintenance Dispatch (Issue 6) ==========

export async function assignVendor(maintenanceId: string, vendorId: string, notes?: string) {
  return fetch(`${API_BASE}/maintenance/${maintenanceId}/assign-vendor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorId, notes }),
  }).then(r => r.json());
}

export async function notifyTenant(maintenanceId: string, message: string) {
  return fetch(`${API_BASE}/maintenance/${maintenanceId}/notify-tenant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  }).then(r => r.json());
}

export async function notifyOwner(maintenanceId: string, message: string) {
  return fetch(`${API_BASE}/maintenance/${maintenanceId}/notify-owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  }).then(r => r.json());
}

// ========== Owner Statement (Issue 8) ==========

export async function sendOwnerStatement(statementId: string, ownerId?: string) {
  return fetch(`${API_BASE}/billing/statements/${statementId}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId }),
  }).then(r => r.json());
}

// ========== Expense Anomaly Details (Issue 9) ==========

export async function getExpenseAnomalyDetails(expenseId: number) {
  return fetch(`${API_BASE}/expenses/${expenseId}/anomaly-details`, {
    method: 'GET',
  }).then(r => r.json());
}

// ========== Portfolio Risk Briefing (Issue 10) ==========

export async function injectRiskItem(
  propertyId: string,
  riskType: string,
  riskScore: number,
  description: string
) {
  return fetch(`${API_BASE}/briefing/inject-risk-item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId, riskType, riskScore, description }),
  }).then(r => r.json());
}

// ========== Telemetry Events (for measurement) ==========

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  // In production, this would send to analytics
  console.log(`[TELEMETRY] ${eventName}`, properties);
  
  // Also emit for any listening handlers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('telemetry', { 
      detail: { eventName, properties, timestamp: new Date().toISOString() } 
    }));
  }
}

// ========== Telemetry Tracking ==========

export async function trackTelemetry(
  eventType: string,
  domain: string,
  entityId?: string,
  action?: string,
  metadata?: Record<string, unknown>
) {
  return fetch(`${API_BASE}/telemetry/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, domain, entityId, action, metadata }),
  }).then(r => r.json());
}

export async function trackUiAction(
  action: string,
  domain: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  return fetch(`${API_BASE}/telemetry/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, domain, entityId, metadata }),
  }).then(r => r.json());
}

export async function trackDecision(
  decisionId: string,
  decisionType: string,
  outcome: string
) {
  return fetch(`${API_BASE}/telemetry/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisionId, decisionType, outcome }),
  }).then(r => r.json());
}

export async function fetchTelemetrySummary(days: number = 7) {
  return fetch(`${API_BASE}/telemetry/summary?days=${days}`).then(r => r.json());
}

// Telemetry event names
export const TelemetryEvents = {
  PAYMENT_MESSAGE_SENT: 'payment_message_sent',
  MANUAL_PAYMENT_RECORDED: 'manual_payment_recorded',
  LEASE_DOCUMENT_GENERATED: 'lease_document_generated',
  LEASE_SENT_FOR_SIGNATURE: 'lease_sent_for_signature',
  ONBOARDING_STARTED: 'onboarding_started',
  MOVE_IN_COMPLETED: 'move_in_completed',
  SCREENING_REASONING_VIEWED: 'screening_reasoning_viewed',
  VENDOR_ASSIGNED: 'vendor_assigned',
  TENANT_NOTIFIED: 'tenant_notified',
  OWNER_NOTIFIED: 'owner_notified',
  STATEMENT_SENT: 'statement_sent',
  EXPENSE_ANOMALY_VIEWED: 'expense_anomaly_viewed',
  RISK_ITEM_INJECTED: 'risk_item_injected',
} as const;