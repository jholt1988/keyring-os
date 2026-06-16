import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createPaymentPlan,
  fetchNotifications,
  fetchScreeningWorkspace,
  getVendors1099ExportUrl,
} from './copilot-api';

describe('copilot-api targeted tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetchScreeningWorkspace normalizes array responses', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1 }],
    });
    await expect(fetchScreeningWorkspace()).resolves.toEqual({ applications: [{ id: 1 }] });
  });

  it('fetchScreeningWorkspace falls back to empty list on error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    await expect(fetchScreeningWorkspace()).resolves.toEqual({ applications: [] });
  });

  it('fetchNotifications builds query params', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => [] });
    await fetchNotifications({ unread: true, limit: 5 });
    const url = (fetch as any).mock.calls[0][0] as string;
    expect(url).toContain('/notifications?');
    expect(url).toContain('unread=true');
    expect(url).toContain('limit=5');
  });

  it('createPaymentPlan validates invoiceId', async () => {
    await expect(createPaymentPlan({})).rejects.toThrow(
      'createPaymentPlan requires invoiceId for the current backend contract.',
    );
  });

  it('getVendors1099ExportUrl uses api base env', async () => {
    const url = getVendors1099ExportUrl();
    expect(url).toContain('/vendors/1099-export');
  });
});
