import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

/**
 * Build a route context whose `params` promise resolves to the given path
 * segments (matching the `[...path]` catch-all convention).
 */
function ctx(...segments: string[]) {
  return { params: Promise.resolve({ path: segments }) };
}

/**
 * Construct a NextRequest for the proxy. Cookies are supplied via the Cookie
 * header so NextRequest parses them into request.cookies.
 */
function makeRequest(
  path: string,
  { method = 'GET', cookies = {}, body, protocol = 'https' }: {
    method?: string;
    cookies?: Record<string, string>;
    body?: string;
    protocol?: 'http' | 'https';
  } = {},
) {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  const headers: Record<string, string> = { accept: 'application/json' };
  if (cookieHeader) headers.cookie = cookieHeader;
  if (body) headers['content-type'] = 'application/json';
  return new NextRequest(`${protocol}://app.test/api/v2/${path}`, {
    method,
    headers,
    body,
  });
}

/** Stub global fetch with a single Response. */
function stubFetch(response: Response) {
  const spy = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', spy);
  return spy;
}

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  process.env.API_URL = 'http://backend.test/api';
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.API_URL;
});

describe('auth proxy /api/v2/[...path]', () => {
  it('returns a generic 401 for auth/me with no token (no cookie-name leak)', async () => {
    const fetchSpy = stubFetch(jsonResponse({}, 200));
    const res = await GET(makeRequest('auth/me', { cookies: { keyring_return_visit: '1' } }), ctx('auth', 'me'));

    expect(res.status).toBe(401);
    const payload = await res.json();
    expect(payload.statusMessage).toBe('Not authenticated');
    // Must NOT echo back cookie names or any request internals.
    expect(JSON.stringify(payload)).not.toContain('keyring_return_visit');
    // Backend must not be called when there is no token.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('forwards the bearer token to the backend', async () => {
    const fetchSpy = stubFetch(jsonResponse({ id: 'u1', role: 'ADMIN' }, 200));
    await GET(makeRequest('auth/me', { cookies: { auth_token: 'tok123' } }), ctx('auth', 'me'));

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, init] = fetchSpy.mock.calls[0];
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer tok123');
  });

  it('sets a single httpOnly auth_token cookie on login', async () => {
    stubFetch(jsonResponse({ access_token: 'access-1', refresh_token: 'refresh-1', role: 'ADMIN' }, 200));
    const res = await POST(
      makeRequest('auth/login', { method: 'POST', body: JSON.stringify({ username: 'a', password: 'b' }) }),
      ctx('auth', 'login'),
    );

    expect(res.status).toBe(200);
    const setCookies = res.headers.getSetCookie();
    const authCookies = setCookies.filter((c) => c.startsWith('auth_token='));
    // Exactly one Set-Cookie for auth_token — no duplicate/manual append.
    expect(authCookies).toHaveLength(1);
    expect(authCookies[0]).toContain('HttpOnly');
    expect(authCookies[0]).toContain('SameSite=lax');
    expect(authCookies[0]).toContain('Secure'); // https request

    // Refresh + role cookies present; role is NOT httpOnly.
    expect(setCookies.some((c) => c.startsWith('refresh_token=') && c.includes('HttpOnly'))).toBe(true);
    const roleCookie = setCookies.find((c) => c.startsWith('user_role='));
    expect(roleCookie).toBeDefined();
    expect(roleCookie).not.toContain('HttpOnly');
  });

  it('does not mark cookies Secure on plain http (local dev)', async () => {
    stubFetch(jsonResponse({ access_token: 'access-1' }, 200));
    const res = await POST(
      makeRequest('auth/login', { method: 'POST', protocol: 'http', body: '{}' }),
      ctx('auth', 'login'),
    );
    const authCookie = res.headers.getSetCookie().find((c) => c.startsWith('auth_token='));
    expect(authCookie).toBeDefined();
    expect(authCookie).not.toContain('Secure');
  });

  it('returns 502 (not 500) when backend login succeeds but returns no token', async () => {
    stubFetch(jsonResponse({ ok: true }, 200));
    const res = await POST(makeRequest('auth/login', { method: 'POST', body: '{}' }), ctx('auth', 'login'));
    expect(res.status).toBe(502);
  });

  it('does not crash on malformed (non-JSON) backend body', async () => {
    stubFetch(new Response('<html>oops</html>', { status: 200, headers: { 'content-type': 'text/html' } }));
    // Should resolve, not throw, even though the body is not JSON.
    const res = await POST(makeRequest('auth/login', { method: 'POST', body: '{}' }), ctx('auth', 'login'));
    // No token parsed → treated as the "no token" case → 502, not an unhandled 500.
    expect(res.status).toBe(502);
  });

  it('returns 502 with a generic message when the backend is unreachable in production', async () => {
    const original = process.env.NODE_ENV;
    // @ts-expect-error - NODE_ENV is writable in the test environment
    process.env.NODE_ENV = 'production';
    process.env.API_URL = 'http://backend.test/api';
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED secret-host:5432')));
    try {
      const res = await GET(makeRequest('auth/me', { cookies: { auth_token: 't' } }), ctx('auth', 'me'));
      expect(res.status).toBe(502);
      const payload = await res.json();
      expect(payload.statusMessage).toBe('Backend unreachable');
      expect(payload.statusMessage).not.toContain('ECONNREFUSED');
    } finally {
      // @ts-expect-error - restore
      process.env.NODE_ENV = original;
    }
  });

  it('clears all auth cookies on logout', async () => {
    stubFetch(jsonResponse({ ok: true }, 200));
    const res = await POST(makeRequest('auth/logout', { method: 'POST', cookies: { auth_token: 't' } }), ctx('auth', 'logout'));
    const setCookies = res.headers.getSetCookie().join('\n');
    // Deletion sets Max-Age=0 (or expires in the past) for each cookie.
    expect(setCookies).toContain('auth_token=');
    expect(setCookies).toContain('refresh_token=');
    expect(setCookies).toContain('user_role=');
  });
});
