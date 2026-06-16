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
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) }),
    );
    const financials = await fetchFinancialsWorkspace();
    const screening = await fetchScreeningWorkspace();
    expect(financials).toBeDefined();
    expect(screening).toBeDefined();
  });

  it('covers allSettled with full success across workspace loaders', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ dq: 1 }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ops: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ inv: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ dec: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ leads: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ requests: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ estimates: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ai: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ leases: 'ok' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ recs: 'ok' }) }),
    );
    const payments = await fetchPaymentsWorkspace();
    const leasing = await fetchLeasingWorkspace();
    const repairs = await fetchRepairsWorkspace();
    const renewals = await fetchRenewalsWorkspace();
    expect(payments.delinquency).toEqual({ dq: 1 });
    expect(leasing.stats).toEqual({ stats: 'ok' });
    expect(repairs.aiMetrics).toEqual({ ai: 'ok' });
    expect(renewals.recommendations).toEqual({ recs: 'ok' });
  });

  it.skip('covers mixed allSettled branches across workspace loaders', async () => {
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
