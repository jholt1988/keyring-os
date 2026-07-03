import { describe, expect, it, vi } from 'vitest';
import { createVendor, fetchVendors, getVendors1099ExportUrl } from './vendors';

describe('vendors api', () => {
  it('fetches and creates vendor', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    await fetchVendors();
    await createVendor({ name: 'Vendor' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('builds export url through the /api/v2 proxy', () => {
    expect(getVendors1099ExportUrl()).toBe('/api/v2/vendors/1099-export');
  });
});
