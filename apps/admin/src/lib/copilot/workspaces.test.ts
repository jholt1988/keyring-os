import { describe, expect, it, vi } from 'vitest';
import {
  fetchFinancialsWorkspace,
  fetchLeasingWorkspace,
  fetchPaymentsWorkspace,
  fetchRenewalsWorkspace,
  fetchRepairsWorkspace,
  fetchScreeningWorkspace,
} from './workspaces';

describe('workspaces api', () => {
  it('fetches payments/leasing/repairs/renewals with settled fallbacks', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ q: 1 }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ i: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ d: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ a: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ b: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ c: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ d: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ e: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ f: 1 }) }),
    );
    const payments = await fetchPaymentsWorkspace();
    const leasing = await fetchLeasingWorkspace();
    const repairs = await fetchRepairsWorkspace();
    const renewals = await fetchRenewalsWorkspace();
    expect(payments.opsSummary).toBeNull();
    expect(leasing.opsSummary).toEqual({ a: 1 });
    expect(repairs.requests).toEqual({ d: 1 });
    expect(renewals.leases).toBeNull();
  });

  it('screening and financials fallback paths', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) }),
    );
    await expect(fetchScreeningWorkspace()).resolves.toEqual({ applications: [] });
    const fin = await fetchFinancialsWorkspace();
    expect(fin.pendingTransactions).toEqual([]);
    expect(fin.chartOfAccounts).toEqual([]);
  });

  it('screening normalizes nested response and financials success path', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ applications: [{ id: 'a1' }] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ pendingTransactions: [1], metrics: { unreconciledAmount: 1 } }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [1] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'coa1' }] }),
    );
    await expect(fetchScreeningWorkspace()).resolves.toEqual({ applications: [{ id: 'a1' }] });
    const fin = await fetchFinancialsWorkspace();
    expect(fin.pendingTransactions).toEqual([1]);
    expect(fin.reconciliationDetail).toEqual({ items: [1] });
    expect(fin.chartOfAccounts).toEqual([{ id: 'coa1' }]);
  });

  it('covers all-settled success branches', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ dq: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ops: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ inv: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ dec: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ops: 2 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: 2 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ leads: 2 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ req: 3 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ est: 3 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ai: 3 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ leases: 4 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ recs: 4 }) }),
    );
    const payments = await fetchPaymentsWorkspace();
    const leasing = await fetchLeasingWorkspace();
    const repairs = await fetchRepairsWorkspace();
    const renewals = await fetchRenewalsWorkspace();
    expect(payments.delinquency).toEqual({ dq: 1 });
    expect(leasing.stats).toEqual({ stats: 2 });
    expect(repairs.aiMetrics).toEqual({ ai: 3 });
    expect(renewals.recommendations).toEqual({ recs: 4 });
  });

  it('covers mixed allSettled branches across workspace loaders', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ops: 'ok' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ dec: 'ok' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: 'ok' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ req: 'ok' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ai: 'ok' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ recs: 'ok' }) }),
    );

    const payments = await fetchPaymentsWorkspace();
    const leasing = await fetchLeasingWorkspace();
    const repairs = await fetchRepairsWorkspace();
    const renewals = await fetchRenewalsWorkspace();

    expect(payments.delinquency).toBeNull();
    expect(payments.opsSummary).toEqual({ ops: 'ok' });
    expect(payments.invoices).toBeNull();
    expect(payments.decisions).toEqual({ dec: 'ok' });

    expect(leasing.opsSummary).toBeNull();
    expect(leasing.stats).toEqual({ stats: 'ok' });
    expect(leasing.leads).toBeNull();

    expect(repairs.requests).toEqual({ req: 'ok' });
    expect(repairs.estimates).toBeNull();
    expect(repairs.aiMetrics).toEqual({ ai: 'ok' });

    expect(renewals.leases).toBeNull();
    expect(renewals.recommendations).toEqual({ recs: 'ok' });
  });
});
