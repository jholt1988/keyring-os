import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';
const REFRESH_COOKIE = 'refresh_token';
const ROLE_COOKIE = 'user_role'; // non-httpOnly: readable by middleware for UX-layer role guards
const ONE_DAY_SECONDS = 60 * 60 * 24;
const THIRTY_DAYS_SECONDS = ONE_DAY_SECONDS * 30;

function getBackendBase(): string {
  const configured = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_URL, NEXT_PUBLIC_API_URL, or NEXT_PUBLIC_API_BASE_URL must be configured in production');
    }
    return 'http://localhost:3001/api';
  }

  const trimmed = configured.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v2')) return trimmed.slice(0, -3);
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

function copyResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  return headers;
}

function resolveUserRole(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  
  const obj = payload as { role?: unknown; roles?: unknown; user?: { role?: unknown; roles?: unknown } };
  
  // 1. Check direct role at root
  if (typeof obj.role === 'string' && obj.role.trim()) {
    return obj.role;
  }
  
  // 2. Check direct roles at root
  if (Array.isArray(obj.roles)) {
    const firstRole = obj.roles.find((value) => typeof value === 'string' && value.trim());
    if (typeof firstRole === 'string') return firstRole;
  }
  
  // 3. Check nested user role
  const user = obj.user;
  if (user && typeof user === 'object') {
    if (typeof user.role === 'string' && user.role.trim()) {
      return user.role;
    }
    if (Array.isArray(user.roles)) {
      const firstRole = user.roles.find((value) => typeof value === 'string' && value.trim());
      if (typeof firstRole === 'string') return firstRole;
    }
  }

  return undefined;
}

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', request.headers.get('accept') ?? 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);
  
  let finalBody = body;
  if (refreshToken && path === 'auth/refresh') {
    // The NestJS backend expects { refreshToken: "..." } in the JSON body
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
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend unreachable';
    return NextResponse.json({ statusMessage: message }, { status: 502 });
  }

  const responseText = await backendResponse.text();
  const nextResponse = new NextResponse(responseText, {
    status: backendResponse.status,
    headers: copyResponseHeaders(backendResponse),
  });

  if ((path === 'auth/login' || path === 'auth/refresh') && backendResponse.ok) {
    const data = responseText ? JSON.parse(responseText) as { access_token?: string; accessToken?: string; refresh_token?: string; refreshToken?: string } : {};
    const access = data.access_token ?? data.accessToken;
    const refresh = data.refresh_token ?? data.refreshToken;
    const role = resolveUserRole(data);
    if (access) {
      nextResponse.cookies.set(AUTH_COOKIE, access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ONE_DAY_SECONDS,
      });
    }
    if (refresh) {
      nextResponse.cookies.set(REFRESH_COOKIE, refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: THIRTY_DAYS_SECONDS,
      });
    }
    if (role) {
      // Non-httpOnly: middleware reads this for UX-level role guards.
      // Backend guards remain authoritative; this is not a security boundary.
      nextResponse.cookies.set(ROLE_COOKIE, role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ONE_DAY_SECONDS,
      });
    }
  }

  if (path === 'auth/me' && backendResponse.ok) {
    const data = responseText ? JSON.parse(responseText) as unknown : undefined;
    const role = resolveUserRole(data);
    if (role) {
      nextResponse.cookies.set(ROLE_COOKIE, role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
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
