import { NextRequest, NextResponse } from 'next/server';

function getBackendBase(): string {
  const configured = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_URL or NEXT_PUBLIC_API_URL must be configured in production');
    }
    return 'http://127.0.0.1:3001/api';
  }

  const trimmed = configured.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v2')) return trimmed.slice(0, -3);
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

async function proxyAuthRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const method = request.method.toUpperCase();
  const token = request.cookies.get('auth_token')?.value;
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
    });
    const responseText = await backendResponse.text();
    const responseHeaders = new Headers();
    const responseContentType = backendResponse.headers.get('content-type');
    if (responseContentType) responseHeaders.set('content-type', responseContentType);
    return new NextResponse(responseText, { status: backendResponse.status, headers: responseHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend unreachable';
    return NextResponse.json({ statusMessage: message }, { status: 502 });
  }
}

export const GET = proxyAuthRequest;
export const POST = proxyAuthRequest;
export const PUT = proxyAuthRequest;
export const PATCH = proxyAuthRequest;
export const DELETE = proxyAuthRequest;
