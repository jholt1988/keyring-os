import { NextRequest, NextResponse } from 'next/server';

/**
 * Tenant-portal BFF proxy.
 *
 * Browser calls to `/api/v2/*` are proxied to the pms-master backend's `/api/*`
 * with the httpOnly `auth_token` cookie forwarded as a Bearer token — so the
 * token never reaches client JS and there is no cross-origin CORS. This mirrors
 * the admin app's `/api/v2` proxy.
 *
 * NOTE: tenant-portal has no login flow of its own, so this proxy does not set
 * session cookies (unlike admin's, which rotates them on auth/login|refresh).
 * If a tenant login flow is added, adopt admin's cookie-rotating proxy (ideally
 * by extracting a shared @keyring proxy package used by both apps).
 */

const AUTH_COOKIE = 'auth_token';
const BACKEND_TIMEOUT_MS = 10_000;

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/** Backend base, normalized to end with `/api`. Throws in prod when unset. */
function getBackendBase(): string {
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

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join('/');
  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', request.headers.get('accept') ?? 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getBackendBase()}/${path}${request.nextUrl.search}`, {
      method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (error) {
    // Surface the upstream failure reason only in development.
    const message = isDev() && error instanceof Error ? error.message : 'Backend unreachable';
    return NextResponse.json({ statusMessage: message }, { status: 502 });
  }

  const responseText = await backendResponse.text();
  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get('content-type');
  if (responseContentType) responseHeaders.set('content-type', responseContentType);
  return new NextResponse(responseText, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
