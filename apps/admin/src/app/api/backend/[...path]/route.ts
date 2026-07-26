import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  BACKEND_TIMEOUT_MS,
  getOperatorApiBase,
  maskError,
} from '@/lib/proxy/backend-proxy';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const upstreamPath = path.join('/');

  const upstreamUrl = new URL(`${getOperatorApiBase()}/${upstreamPath}`);
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
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (error) {
    return NextResponse.json({ statusMessage: maskError(error) }, { status: 502 });
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
