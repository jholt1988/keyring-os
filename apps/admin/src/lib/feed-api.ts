import type { FeedResponse, UserRole } from '@keyring/types';

/**
 * Fetches the Co-Pilot feed from the pms-master backend.
 *
 * Called server-side only (Next.js Server Component / Route Handler).
 * Never import this in a Client Component.
 *
 * Throws on non-2xx responses so the caller can handle errors explicitly.
 */
export async function fetchFeed(role: UserRole): Promise<FeedResponse> {
  const base = process.env.BACKEND_URL;
  if (!base) {
    throw new Error(
      'BACKEND_URL is not set. Add it to .env.local (see .env.local.example).',
    );
  }

  const url = `${base}/api/feed?role=${encodeURIComponent(role)}`;

  const res = await fetch(url, {
    // Revalidate every 60 seconds — balances freshness with DB load.
    // Phase 2 (signal cache table) will allow longer TTLs.
    next: { revalidate: 60 },
    headers: {
      Accept: 'application/json',
      // Phase 4: forward the user's JWT here once auth is wired.
      // Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new FeedApiError(
      `Feed API responded ${res.status} ${res.statusText}`,
      res.status,
    );
  }

  return res.json() as Promise<FeedResponse>;
}

export class FeedApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FeedApiError';
  }
}
