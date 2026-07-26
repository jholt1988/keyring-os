import { cookies } from 'next/headers';
import { QueryClient } from '@tanstack/react-query';

// Importing `next/headers` makes this module server-only: pulling it into a
// Client Component is a build error, so these helpers can't leak to the browser.
//
// Client code talks to the backend through the `/api/v2` proxy (see
// api-client.ts). Server Components can't use a relative proxy path (no origin
// server-side), so they call the backend directly here, forwarding the httpOnly
// `auth_token` cookie as a Bearer token — exactly what the v2 proxy does.

/**
 * Resolve the backend base URL. Mirrors the `/api/v2` proxy's `getBackendBase`
 * so a server prefetch hits the *same* backend the client's proxied calls
 * resolve to (backend `/api/<path>` == client `/api/v2/<path>`).
 */
function backendBase(): string {
  const configured =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'API_URL, NEXT_PUBLIC_API_URL, or NEXT_PUBLIC_API_BASE_URL must be configured in production',
      );
    }
    return 'http://localhost:3001/api';
  }
  const trimmed = configured.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v2')) return trimmed.slice(0, -3);
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

/**
 * Authenticated server-side GET for prefetching React Query data in Server
 * Components. Forwards the httpOnly `auth_token` cookie as a Bearer token, so a
 * server-prefetched query hydrates the client cache identically to the browser
 * client (which goes through the v2 proxy). Throws on a non-2xx response so
 * callers can fall back to the client fetch.
 */
export async function serverApiGet<T = unknown>(path: string): Promise<T> {
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };
  const token = (await cookies()).get('auth_token')?.value;
  if (token) requestHeaders['authorization'] = `Bearer ${token}`;

  const res = await fetch(`${backendBase()}${path}`, {
    headers: requestHeaders,
    // Per-request, per-user data — never cache or share across users.
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`serverApiGet ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

/** A fresh, request-scoped QueryClient for server-side prefetching. */
export function createServerQueryClient(): QueryClient {
  return new QueryClient();
}

/**
 * Best-effort server prefetch. When the backend is reachable during SSR this
 * fills the cache so the first paint already has data (no client mount -> fetch
 * -> render waterfall); on failure it swallows the error so the page still
 * renders and the client refetches on mount. `dehydrate()` only serializes
 * successful queries, so a failed prefetch never leaks an error state into the
 * HTML, and `retry: false` keeps SSR fast when the backend is down.
 */
export async function prefetchServerQuery<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
): Promise<void> {
  try {
    await queryClient.fetchQuery({ queryKey, queryFn, retry: false });
  } catch {
    /* best-effort; client refetches on mount */
  }
}
