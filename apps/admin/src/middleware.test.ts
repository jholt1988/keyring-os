import { describe, expect, it } from 'vitest';
import { middleware } from './middleware';

function req(path: string, cookies: Record<string, string> = {}) {
  const url = `https://app.test${path}`;
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) =>
        cookies[name] ? { value: cookies[name], name } : undefined,
    },
  } as any;
}

describe('middleware', () => {
  it('allows public paths', () => {
    const res = middleware(req('/login'));
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

  it('redirects authenticated users away from login', () => {
    const res = middleware(req('/login', { auth_token: 'x' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://app.test/');
  });

  it('redirects when role is present but unauthorized', () => {
    const res = middleware(req('/admin', { auth_token: 'x', user_role: 'TENANT' }));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/unauthorized');
  });

  it('allows when role cookie is missing (fail-open)', () => {
    const res = middleware(req('/admin', { auth_token: 'x' }));
    expect(res.status).toBe(200);
  });
});
