import { describe, expect, it, vi } from 'vitest';
import {
  createPaymentPlan,
  fetchUnitLedger,
  issueDelinquencyNotice,
  logManualPayment,
} from './payments';

describe('payments api', () => {
  it('fetchUnitLedger returns data when request succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'ledger-1' }) }));
    await expect(fetchUnitLedger('lease-1')).resolves.toEqual({ id: 'ledger-1' });
  });

  it('fetchUnitLedger returns null when request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }));
    await expect(fetchUnitLedger('lease-1')).resolves.toBeNull();
  });

  it('createPaymentPlan validates invoiceId', async () => {
    await expect(createPaymentPlan({})).rejects.toThrow('requires invoiceId');
  });

  it('createPaymentPlan posts when invoiceId is present', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(createPaymentPlan({ invoiceId: 123, leaseId: 'l1' })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('issueDelinquencyNotice and logManualPayment post payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    await issueDelinquencyNotice({ leaseId: 'l1', deliveryMethod: 'EMAIL', approvalConfirmed: true });
    await logManualPayment({
      leaseId: 'l1',
      propertyId: 'p1',
      tenantId: 't1',
      amountCents: 100,
      method: 'ACH',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
