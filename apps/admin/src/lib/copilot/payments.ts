import { api } from './core';
import { executeDecisionAction } from './briefing';

export async function fetchUnitLedger(leaseId: string) {
  try {
    return await api(`/payments/ledger/accounts/${leaseId}`);
  } catch {
    return null;
  }
}

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

export async function createPaymentPlan(data: Record<string, unknown>) {
  if (typeof data.invoiceId !== 'number') {
    throw new Error('createPaymentPlan requires invoiceId for the current backend contract.');
  }
  return api('/payments/payment-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export const paymentsApi = {
  fetchUnitLedger,
  createPaymentPlan,
  issueDelinquencyNotice,
  logManualPayment,
  executeDecisionAction,
};
