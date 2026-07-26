import { afterEach, describe, expect, it } from 'vitest';
import {
  asToken,
  maskError,
  normalizeApiBase,
  resolveUserRole,
  safeJsonParse,
  unwrapResult,
} from './backend-proxy';

describe('normalizeApiBase', () => {
  it('appends /api when missing', () => {
    expect(normalizeApiBase('http://b.test')).toBe('http://b.test/api');
  });
  it('keeps an existing /api', () => {
    expect(normalizeApiBase('http://b.test/api')).toBe('http://b.test/api');
  });
  it('rewrites /api/v2 down to /api', () => {
    expect(normalizeApiBase('http://b.test/api/v2')).toBe('http://b.test/api');
  });
  it('strips trailing slashes', () => {
    expect(normalizeApiBase('http://b.test/api/')).toBe('http://b.test/api');
  });
});

describe('maskError', () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    // @ts-expect-error NODE_ENV is writable in tests
    process.env.NODE_ENV = original;
  });

  it('surfaces the underlying message in development', () => {
    // @ts-expect-error NODE_ENV is writable in tests
    process.env.NODE_ENV = 'development';
    expect(maskError(new Error('ECONNREFUSED secret-host:5432'))).toContain('ECONNREFUSED');
  });

  it('returns a generic message in production (no leak)', () => {
    // @ts-expect-error NODE_ENV is writable in tests
    process.env.NODE_ENV = 'production';
    const msg = maskError(new Error('ECONNREFUSED secret-host:5432'));
    expect(msg).toBe('Backend unreachable');
    expect(msg).not.toContain('ECONNREFUSED');
  });
});

describe('resolveUserRole', () => {
  it('reads a root role', () => expect(resolveUserRole({ role: 'ADMIN' })).toBe('ADMIN'));
  it('reads the first of roles[]', () =>
    expect(resolveUserRole({ roles: ['PROPERTY_MANAGER'] })).toBe('PROPERTY_MANAGER'));
  it('reads a nested user.role', () =>
    expect(resolveUserRole({ user: { role: 'TENANT' } })).toBe('TENANT'));
  it('returns undefined when absent', () => expect(resolveUserRole({})).toBeUndefined());
});

describe('safeJsonParse / unwrapResult / asToken', () => {
  it('parses valid JSON', () => expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 }));
  it('returns undefined for invalid or empty input', () => {
    expect(safeJsonParse('<html>oops</html>')).toBeUndefined();
    expect(safeJsonParse('')).toBeUndefined();
  });
  it('unwraps a { result } envelope', () =>
    expect(unwrapResult({ result: { x: 1 } })).toEqual({ x: 1 }));
  it('passes through when there is no envelope', () =>
    expect(unwrapResult({ x: 1 })).toEqual({ x: 1 }));
  it('asToken only accepts non-empty strings', () => {
    expect(asToken('t')).toBe('t');
    expect(asToken('')).toBeUndefined();
    expect(asToken(5)).toBeUndefined();
  });
});
