// Audit logging for remediation actions
// Logs key actions for compliance

const auditLog: Array<{
  timestamp: string;
  action: string;
  userId?: string;
  entityType: string;
  entityId: string | number;
  details?: Record<string, unknown>;
}> = [];

export function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string | number,
  details?: Record<string, unknown>,
  userId?: string
) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    entityType,
    entityId,
    details,
    userId,
  };
  
  auditLog.push(entry);
  
  // In production, this would send to backend audit service
  console.log(`[AUDIT] ${action} on ${entityType}:${entityId}`, details);
  
  return entry;
}

export function getAuditLog() {
  return [...auditLog];
}

export function clearAuditLog() {
  auditLog.length = 0;
}

// Audit action names
export const AuditActions = {
  // Payments
  PAYMENT_MESSAGE_SENT: 'PAYMENT_MESSAGE_SENT',
  MANUAL_PAYMENT_RECORDED: 'MANUAL_PAYMENT_RECORDED',
  
  // Leases
  LEASE_DOCUMENT_GENERATED: 'LEASE_DOCUMENT_GENERATED',
  LEASE_SENT_FOR_SIGNATURE: 'LEASE_SENT_FOR_SIGNATURE',
  
  // Move-in
  ONBOARDING_STARTED: 'ONBOARDING_STARTED',
  MOVE_IN_COMPLETED: 'MOVE_IN_COMPLETED',
  
  // Maintenance
  VENDOR_ASSIGNED: 'VENDOR_ASSIGNED',
  TENANT_NOTIFIED: 'TENANT_NOTIFIED',
  OWNER_NOTIFIED: 'OWNER_NOTIFIED',
  
  // Financials
  STATEMENT_SENT: 'STATEMENT_SENT',
  
  // Screening
  SCREENING_OVERRIDE: 'SCREENING_OVERRIDE',
  
  // Portfolio
  RISK_ITEM_INJECTED: 'RISK_ITEM_INJECTED',
} as const;