import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  BACKEND_TIMEOUT_MS,
  copyResponseHeaders,
  getBackendBase,
  maskError,
} from '@/lib/proxy/backend-proxy';

async function proxyAuthRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const method = request.method.toUpperCase();
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', request.headers.get('accept') ?? 'application/json');
  if (token) headers.set('authorization', `Bearer ${token}`);

  try {
    const backendResponse = await fetch(`${getBackendBase()}/auth/${path}${request.nextUrl.search}`, {
      method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    const responseText = await backendResponse.text();
    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: copyResponseHeaders(backendResponse),
    });
  } catch (error) {
    return NextResponse.json({ statusMessage: maskError(error) }, { status: 502 });
  }
}

export const GET = proxyAuthRequest;
export const POST = proxyAuthRequest;
export const PUT = proxyAuthRequest;
export const PATCH = proxyAuthRequest;
export const DELETE = proxyAuthRequest;
