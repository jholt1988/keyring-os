import type { paths } from './generated/schema';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type JsonBody = Record<string, unknown> | unknown[] | string | number | boolean | null;

export type ApiClientOptions = {
  token?: string;
  baseUrl?: string;
};

export class OperatorApiError extends Error {
  constructor(
    readonly message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = 'OperatorApiError';
  }
}

const defaultBaseUrl = '/api/backend';

/**
 * Attempt to read the auth_token from document.cookie.
 * The v2 proxy sets auth_token as httpOnly, so this only works
 * for non-httpOnly copies. The backend proxy now forwards the
 * httpOnly cookie server-side, so this is a client-side fallback.
 */
function getSessionToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)operator_api_token=([^;]*)/);
  return match?.[1] || undefined;
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>, baseUrl = defaultBaseUrl) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  // The /api/backend proxy already prepends `/api` when forwarding upstream, so
  // strip a leading `/api` from the path to avoid a /api/api double-prefix
  // (the backend now serves single-prefixed routes — see pms-master #50).
  const deApiPath = path.replace(/^\/api(?=\/|$)/, '');
  const normalizedPath = deApiPath.startsWith('/') ? deApiPath : `/${deApiPath}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`, 'http://operator.local');

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}`;
}

export async function apiRequest<T>(
  method: HttpMethod,
  path: keyof paths & string,
  options: ApiClientOptions & {
    query?: Record<string, string | number | boolean | undefined>;
    body?: JsonBody;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  // Resolve token: explicit > localStorage > session cookie
  const token = options.token
    || (typeof window !== 'undefined' ? window.localStorage.getItem('operator_api_token') : null)
    || getSessionToken()
    || undefined;

  const response = await fetch(buildUrl(path, options.query, options.baseUrl), {
    method: method.toUpperCase(),
    credentials: 'include', // Forward session cookies to backend proxy
    headers: {
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new OperatorApiError(`API request failed: ${response.status}`, response.status, body);
  }

  return body as T;
}

