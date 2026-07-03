/**
 * Single browser-side API client for the admin app.
 *
 * All client-side calls to the pms-master backend go through the Next.js proxy
 * at `/api/v2/*`, which:
 *   - reads the httpOnly `auth_token` cookie and forwards it as a Bearer header
 *     (the browser never handles the token directly — see ADR-001 auth),
 *   - rewrites `/api/v2/<path>` to the backend's `/api/<path>`.
 *
 * Use this instead of hardcoding `/api/v2` literals or calling
 * `NEXT_PUBLIC_API_URL` directly from client code. Direct `NEXT_PUBLIC_API_URL`
 * calls from the browser bypass the proxy, so they miss cookie→bearer auth and
 * are subject to CORS.
 *
 * NOTE: this client is browser-only (it relies on the proxy + `credentials`).
 * Server Components / Server Actions / Route Handlers that run on the Next
 * server should call the backend directly with an absolute URL instead — a
 * relative `/api/v2` path has no origin server-side.
 */

/** Canonical client-side prefix. The Next proxy maps this to the backend `/api`. */
export const API_V2_BASE = '/api/v2';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  /** Query params appended to the URL (undefined/null entries are skipped). */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** JSON-serializable request body. Sets Content-Type: application/json. */
  json?: unknown;
  /** Raw request body (use `json` for JSON payloads). */
  body?: BodyInit | null;
};

function buildPath(path: string, query?: ApiRequestOptions['query']): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${API_V2_BASE}${normalizedPath}`;
  if (query) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      qs.set(key, String(value));
    }
    const q = qs.toString();
    if (q) url += `?${q}`;
  }
  return url;
}

/**
 * Perform a request through the `/api/v2` proxy and parse the JSON response.
 * Throws {@link ApiError} on any non-2xx status.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { query, json, headers, body: rawBody, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('accept', 'application/json');
  let body: BodyInit | null | undefined = rawBody;
  if (json !== undefined) {
    finalHeaders.set('content-type', 'application/json');
    body = JSON.stringify(json);
  }

  const response = await fetch(buildPath(path, query), {
    credentials: 'include',
    cache: 'no-store',
    ...rest,
    headers: finalHeaders,
    body,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const parsed: unknown = contentType.includes('application/json')
    ? await response.json().catch(() => undefined)
    : await response.text();

  if (!response.ok) {
    throw new ApiError(`API request failed: ${response.status}`, response.status, parsed);
  }

  return parsed as T;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', json }),
  put: <T>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', json }),
  patch: <T>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', json }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
