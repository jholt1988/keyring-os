import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest } from './client';

describe('operator apiRequest URL building', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ data: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const calledUrl = () => fetchMock.mock.calls[0][0] as string;

  it('routes through the /api/backend proxy and strips the redundant /api prefix', async () => {
    // Paths carry a leading /api (from the generated schema); the proxy re-adds
    // /api upstream, so the client must NOT produce /api/backend/api/... (404).
    await apiRequest('get', '/api/command-center');
    expect(calledUrl()).toBe('/api/backend/command-center');
  });

  it('handles nested /api paths', async () => {
    await apiRequest('get', '/api/dashboard/metrics');
    expect(calledUrl()).toBe('/api/backend/dashboard/metrics');
  });

  it('preserves query params', async () => {
    await apiRequest('get', '/api/command-center', { query: { limit: 5 } });
    expect(calledUrl()).toBe('/api/backend/command-center?limit=5');
  });

  it('sends credentials so the httpOnly session cookie reaches the proxy', async () => {
    await apiRequest('get', '/api/properties');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });
});
