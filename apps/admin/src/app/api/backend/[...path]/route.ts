import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';

const backendBaseUrl = process.env.OPERATOR_API_BASE_URL ?? process.env.API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const upstreamPath = path.join('/');

  // Normalize base URL to include /api prefix
  const normalizedBase = backendBaseUrl.replace(/\/+$/, '');
  const apiBase = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;
  const upstreamUrl = new URL(`${apiBase}/${upstreamPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  const headers = new Headers();

  // Forward Authorization header if provided explicitly (operator manual token)
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('authorization', authorization);
  } else {
    // Fall back to session cookie (copilot/admin auth flow)
    const sessionToken = request.cookies.get(AUTH_COOKIE)?.value;
    if (sessionToken) {
      headers.set('authorization', `Bearer ${sessionToken}`);
    }
  }

  headers.set('accept', 'application/json');

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  let response: Response;
  try {
    response = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend unreachable';
    return NextResponse.json({ statusMessage: message }, { status: 502 });
  }

  const responseBody = await response.text();
  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
