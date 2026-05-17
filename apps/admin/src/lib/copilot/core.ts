export const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v2';

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
