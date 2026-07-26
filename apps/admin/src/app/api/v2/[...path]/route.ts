import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  REFRESH_COOKIE,
  ROLE_COOKIE,
  ONE_DAY_SECONDS,
  THIRTY_DAYS_SECONDS,
  BACKEND_TIMEOUT_MS,
  isDev,
  getBackendBase,
  copyResponseHeaders,
  safeJsonParse,
  unwrapResult,
  asToken,
  resolveUserRole,
  setSessionCookie,
  type AuthTokenPayload,
} from '@/lib/proxy/backend-proxy';

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const secure = request.nextUrl.protocol === 'https:';

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', request.headers.get('accept') ?? 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  // Short-circuit unauthenticated session probes. Return a generic 401 — do not
  // echo cookie names or any request internals back to the client.
  if (path === 'auth/me' && !token) {
    return NextResponse.json({ statusMessage: 'Not authenticated' }, { status: 401 });
  }

  let finalBody = body;
  if (refreshToken && path === 'auth/refresh') {
    // The NestJS backend expects { refreshToken: "..." } in the JSON body.
    headers.set('content-type', 'application/json');
    finalBody = JSON.stringify({ refreshToken });
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getBackendBase()}/${path}${request.nextUrl.search}`, {
      method,
      headers,
      body: finalBody,
      cache: 'no-store',
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (error) {
    // Surface the upstream failure reason only in development.
    const message = isDev() && error instanceof Error ? error.message : 'Backend unreachable';
    return NextResponse.json({ statusMessage: message }, { status: 502 });
  }

  const responseText = await backendResponse.text();
  const nextResponse = new NextResponse(responseText, {
    status: backendResponse.status,
    headers: copyResponseHeaders(backendResponse),
  });

  if ((path === 'auth/login' || path === 'auth/refresh') && backendResponse.ok) {
    const data = unwrapResult(safeJsonParse(responseText)) as AuthTokenPayload;
    const access = asToken(data.access_token) ?? asToken(data.accessToken);
    const refresh = asToken(data.refresh_token) ?? asToken(data.refreshToken);

    if (!access && path === 'auth/login') {
      // Backend accepted the login but returned no token — a real
      // misconfiguration. Keep the message generic in production.
      const detail = isDev() ? ` Body: ${responseText}` : '';
      return NextResponse.json(
        { statusMessage: `Login succeeded but no access token was returned.${detail}` },
        { status: 502 },
      );
    }

    const role = resolveUserRole(data);
    if (access) {
      setSessionCookie(nextResponse, AUTH_COOKIE, access, ONE_DAY_SECONDS, secure);
    }
    if (refresh) {
      setSessionCookie(nextResponse, REFRESH_COOKIE, refresh, THIRTY_DAYS_SECONDS, secure);
    }
    if (role) {
      // Non-httpOnly: middleware reads this for UX-level role guards.
      // Backend guards remain authoritative; this is not a security boundary.
      nextResponse.cookies.set(ROLE_COOKIE, role, {
        httpOnly: false,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: ONE_DAY_SECONDS,
      });
    }
  }

  if (path === 'auth/me' && backendResponse.ok) {
    const data = unwrapResult(safeJsonParse(responseText));
    const role = resolveUserRole(data);
    if (role) {
      nextResponse.cookies.set(ROLE_COOKIE, role, {
        httpOnly: false,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: ONE_DAY_SECONDS,
      });
    }
  }

  if (path === 'auth/logout') {
    nextResponse.cookies.delete(AUTH_COOKIE);
    nextResponse.cookies.delete(REFRESH_COOKIE);
    nextResponse.cookies.delete(ROLE_COOKIE);
  }

  return nextResponse;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
