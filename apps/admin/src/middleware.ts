// Auth Middleware - Redirect unauthenticated users to login or landing
// Also enforces minimum-role requirements for sensitive routes at the edge.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/landing',
  '/unauthorized',
  '/api/auth',
  '/api/v2/auth/',
  '/_vercel',
  '/_next',
  '/favicon.ico',
  '/fonts',
];

// Route prefix → minimum required role(s).
// user_role is a non-httpOnly cookie set during login alongside auth_token.
// Backend guards remain the authoritative enforcement layer; this is a UX-layer guard.
const ROLE_PROTECTED_ROUTES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/settings',   roles: ['ADMIN'] },
  { prefix: '/financials', roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/reports',    roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/billing',    roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/renewals',   roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/messages',   roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/owners',     roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/admin',      roles: ['ADMIN'] },
  { prefix: '/users',      roles: ['ADMIN'] },
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path));
}

function hasRequiredRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole.toUpperCase());
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token
  const authToken = request.cookies.get('auth_token')?.value;

  // A user-profile cookie or caller-provided Authorization header is not sufficient for route access; require our httpOnly session cookie.
  if (!authToken) {
    // Check return user cookie
    const returnUserCookie = request.cookies.get('keyring_return_visit');

    if (!returnUserCookie) {
      // First-time user - show landing page
      const landingUrl = new URL('/landing', request.url);
      return NextResponse.redirect(landingUrl);
    }

    // Return user without auth - redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection (UX layer).
  // user_role is a non-httpOnly cookie set by the login proxy alongside auth_token.
  const userRole = request.cookies.get('user_role')?.value;
  for (const guard of ROLE_PROTECTED_ROUTES) {
    if (pathname.startsWith(guard.prefix)) {
      if (!hasRequiredRole(userRole, guard.roles)) {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('required', guard.roles.join(','));
        return NextResponse.redirect(unauthorizedUrl);
      }
      break;
    }
  }

  // Token-present requests may proceed; backend API calls still enforce JWT validity and role/org guards.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
