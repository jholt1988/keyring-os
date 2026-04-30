import { NextRequest,NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:3001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const search = request.nextUrl.search;

  try {
    const response = await fetch(`${BACKEND_URL}/${path}${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        authorization: request.headers.get('authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { statusMessage: 'Backend unreachable' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join('/');
  const body = await request.json();

  try {
    const response = await fetch(`${BACKEND_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth header if present
        authorization: request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { statusMessage: 'Backend unreachable' },
      { status: 502 }
    );
  }
}
