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

  it('builds export url from env', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');
    expect(getVendors1099ExportUrl()).toBe('https://api.example.com/vendors/1099-export');
  });
});
