import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';
const REFRESH_COOKIE = 'refresh_token';
const ONE_DAY_SECONDS = 60 * 60 * 24;
const THIRTY_DAYS_SECONDS = ONE_DAY_SECONDS * 30;

function getBackendBase(): string {
  const configured = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_URL or NEXT_PUBLIC_API_URL must be configured in production');
    }
    return 'http://127.0.0.1:3001/api/v2';
  }

  const trimmed = configured.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v2')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v2`;
  return `${trimmed}/api/v2`;
}

function copyResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  return headers;
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
  if (refreshToken && path === 'auth/refresh') headers.set('x-refresh-token', refreshToken);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${getBackendBase()}/${path}${request.nextUrl.search}`, {
      method,
      headers,
      body,
      cache: 'no-store',
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

  if (path === 'auth/login' && backendResponse.ok) {
    const data = responseText ? JSON.parse(responseText) as { access_token?: string; accessToken?: string; refresh_token?: string; refreshToken?: string } : {};
    const access = data.access_token ?? data.accessToken;
    const refresh = data.refresh_token ?? data.refreshToken;
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
  }

  if (path === 'auth/logout') {
    nextResponse.cookies.delete(AUTH_COOKIE);
    nextResponse.cookies.delete(REFRESH_COOKIE);
  }

  return nextResponse;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
