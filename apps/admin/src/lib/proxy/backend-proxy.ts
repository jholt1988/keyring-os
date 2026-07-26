import { NextResponse } from 'next/server';

/**
 * Shared building blocks for the admin BFF proxy routes (`/api/v2`, `/api/auth`,
 * `/api/backend`). Centralizing these means a security or reliability fix (error
 * masking, request timeout, base-URL handling, cookie flags) is made once and
 * applies to every proxy route, instead of being copy-pasted (and drifting)
 * across them.
 */

export const AUTH_COOKIE = 'auth_token';
export const REFRESH_COOKIE = 'refresh_token';
// non-httpOnly: readable by middleware for UX-layer role guards
export const ROLE_COOKIE = 'user_role';
export const ONE_DAY_SECONDS = 60 * 60 * 24;
export const THIRTY_DAYS_SECONDS = ONE_DAY_SECONDS * 30;
export const BACKEND_TIMEOUT_MS = 10_000;

/**
 * Evaluated at call time (not module load) so error verbosity always reflects
 * the current NODE_ENV. Production must never leak upstream error details.
 */
export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/** Upstream failure reason in dev; a generic message in production. */
export function maskError(error: unknown, fallback = 'Backend unreachable'): string {
  return isDev() && error instanceof Error ? error.message : fallback;
}

/** Normalize a configured base URL so it ends with `/api` (stripping `/v2`). */
export function normalizeApiBase(configured: string): string {
  const trimmed = configured.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v2')) return trimmed.slice(0, -3);
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

/**
 * Backend base for the session-cookie proxies (`/api/v2`, `/api/auth`). Throws
 * in production when unconfigured; falls back to localhost in dev.
 */
export function getBackendBase(): string {
  const configured =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'API_URL, NEXT_PUBLIC_API_URL, or NEXT_PUBLIC_API_BASE_URL must be configured in production',
      );
    }
    return 'http://localhost:3001/api';
  }
  return normalizeApiBase(configured);
}

/**
 * Backend base for the operator/copilot proxy (`/api/backend`) — prefers
 * OPERATOR_API_BASE_URL, then falls back to the shared API env vars.
 */
export function getOperatorApiBase(): string {
  const configured =
    process.env.OPERATOR_API_BASE_URL ??
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';
  return normalizeApiBase(configured);
}

/** Copy only the content-type header from an upstream response. */
export function copyResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  return headers;
}

/**
 * Parse a JSON string without throwing. Returns undefined when the body is
 * empty or not valid JSON, so a malformed backend response can never crash the
 * proxy with an unhandled exception.
 */
export function safeJsonParse(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export interface AuthTokenPayload {
  access_token?: unknown;
  accessToken?: unknown;
  refresh_token?: unknown;
  refreshToken?: unknown;
  result?: unknown;
}

/** Unwrap an optional `{ result: {...} }` envelope used by some backend routes. */
export function unwrapResult(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const obj = payload as { result?: unknown };
  if (obj.result && typeof obj.result === 'object') return obj.result as Record<string, unknown>;
  return obj as Record<string, unknown>;
}

export function asToken(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function resolveUserRole(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;

  const obj = payload as {
    role?: unknown;
    roles?: unknown;
    user?: { role?: unknown; roles?: unknown };
  };

  // 1. Direct role at root
  if (typeof obj.role === 'string' && obj.role.trim()) return obj.role;

  // 2. Direct roles[] at root
  if (Array.isArray(obj.roles)) {
    const firstRole = obj.roles.find((value) => typeof value === 'string' && value.trim());
    if (typeof firstRole === 'string') return firstRole;
  }

  // 3. Nested user role
  const user = obj.user;
  if (user && typeof user === 'object') {
    if (typeof user.role === 'string' && user.role.trim()) return user.role;
    if (Array.isArray(user.roles)) {
      const firstRole = user.roles.find((value) => typeof value === 'string' && value.trim());
      if (typeof firstRole === 'string') return firstRole;
    }
  }

  return undefined;
}

export function setSessionCookie(
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number,
  secure: boolean,
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}
