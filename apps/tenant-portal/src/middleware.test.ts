import { describe, expect, it } from 'vitest';
import type { NextRequest } from 'next/server';
import { middleware } from './middleware';

function req(path: string, cookies: Record<string, string> = {}): NextRequest {
  const url = `https://portal.test${path}`;
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) =>
        cookies[name] ? { value: cookies[name], name } : undefined,
    },
  } as unknown as NextRequest;
}

describe('tenant-portal middleware', () => {
  it('allows public paths', () => {
    const res = middleware(req('/login'));
    expect(res.status).toBe(200);
  });

  it('allows legal paths without auth', () => {
    const res = middleware(req('/legal/privacy-policy'));
    expect(res.status).toBe(200);
  });

  it('redirects first-time unauthenticated root user to landing', () => {
    const res = middleware(req('/'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/landing');
  });

  it('redirects unauthenticated user to login with redirect param', () => {
    const res = middleware(req('/payments?tab=open'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
    expect(res.headers.get('location')).toContain('redirect=%2Fpayments%3Ftab%3Dopen');
  });

  it('redirects authenticated users away from login to /feed', () => {
    const res = middleware(req('/login', { auth_token: '***' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://portal.test/feed');
  });

  it('redirects authenticated users away from landing to /feed', () => {
    const res = middleware(req('/landing', { auth_token: '***' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://portal.test/feed');
  });

  it('allows authenticated user through to protected routes', () => {
    const res = middleware(req('/maintenance', { auth_token: '***' }));
    expect(res.status).toBe(200);
  });
});
