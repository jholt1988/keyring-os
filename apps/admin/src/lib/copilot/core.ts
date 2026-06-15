/**
 * Unified API core — points all copilot/admin API calls through `/api/backend`.
 *
 * Previously used `/api/v2` which was a separate proxy. Now consolidated to use
 * the same backend proxy as the Operator, ensuring:
 * 1. All API calls route through a single proxy with consistent auth handling
 * 2. Session cookies (auth_token) are forwarded automatically
 * 3. Bearer token from operator context can be used as fallback
 *
 * @deprecated Individual functions in legacy.ts — prefer operator feature modules.
 */

export const BASE = '/api/backend';

/**
 * @deprecated Use `/api/v2` only if you need backwards compatibility.
 * New code should import from `@/features/operator` instead.
 */
export const LEGACY_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v2';

const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
});

export async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: headers(),
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export function buildQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `?${query}` : '';
}
