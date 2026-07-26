import { describe, expect, it, vi } from 'vitest';
import { FeedApiError, fetchFeed } from './feed-api';

describe('fetchFeed', () => {
  it('throws when api base env is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    await expect(fetchFeed('ADMIN' as unknown)).rejects.toThrow('BACKEND_URL is not set');
  });

  it('returns json on success', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test');
    const payload = { items: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      }),
    );

    await expect(fetchFeed('ADMIN' as unknown)).resolves.toEqual(payload);
  });

  it('throws FeedApiError on non-2xx', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      }),
    );

    await expect(fetchFeed('OWNER' as unknown)).rejects.toBeInstanceOf(FeedApiError);
  });
});
