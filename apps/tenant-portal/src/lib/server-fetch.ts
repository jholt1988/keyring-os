import { cookies } from 'next/headers';

// Importing `next/headers` makes this module server-only: pulling it into a
// Client Component is a build error, so these helpers can't leak to the browser.

const MOCK_USER_ID = process.env.NEXT_PUBLIC_MOCK_USER_ID ?? 'dev-tenant-uuid-001';
const USE_MOCK_AUTH =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';

/**
 * Backend base URL for server-to-server calls. Server Components talk to the
 * backend directly (never through the browser), so this may be an internal URL
 * and must not rely on `credentials: 'include'`.
 */
function backendBase(): string {
  const configured =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
  const trimmed = configured.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

/**
 * Authenticated server-side GET for prefetching React Query data in Server
 * Components. Forwards the httpOnly `auth_token` cookie as a Bearer token
 * (production) or the dev-only mock-auth headers, mirroring the browser client
 * in `tenant-api.ts` so a server-prefetched query hydrates the client cache
 * identically. Throws on a non-2xx response so callers can `try/catch` and fall
 * back to the client fetch (dehydrate() only serializes successful queries).
 */
export async function serverApiGet<T>(path: string): Promise<T> {
  const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };

  if (USE_MOCK_AUTH) {
    requestHeaders['X-Mock-User-Id'] = MOCK_USER_ID;
    requestHeaders['X-Mock-Role'] = 'TENANT';
  } else {
    const token = (await cookies()).get('auth_token')?.value;
    if (token) requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${backendBase()}${path}`, {
    headers: requestHeaders,
    // Per-tenant data — never cache or share across users.
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`serverApiGet ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}
