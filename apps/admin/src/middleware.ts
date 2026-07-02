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
  { prefix: '/settings',   roles: ['ADMIN', 'PROPERTY_MANAGER', 'LEASING_AGENT', 'BOOKKEEPER'] },
  { prefix: '/financials', roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/reports',    roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/billing',    roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/leases',     roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/renewals',   roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/applications', roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/marketing',  roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/payments',   roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/tenants',    roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/messages',   roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/portfolio', roles: ['ADMIN', 'PROPERTY_MANAGER'] },
  { prefix: '/maintenance',roles: ['ADMIN', 'PROPERTY_MANAGER'] },
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
  const authToken = request.cookies.get('auth_token')?.value;

  // Keep authenticated users out of auth/marketing pages.
  if (authToken && (pathname === '/landing' || pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // A user-profile cookie or caller-provided Authorization header is not sufficient for route access; require our httpOnly session cookie.
  if (!authToken) {
    const markReturnVisit = (response: NextResponse) => {
      response.cookies.set('keyring_return_visit', '1', {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        secure: request.nextUrl.protocol === 'https:',
        maxAge: 60 * 60 * 24 * 365,
      });
      return response;
    };

    // Check return user cookie
    const returnUserCookie = request.cookies.get('keyring_return_visit');

    if (!returnUserCookie && pathname === '/') {
      // First-time user - show landing page
      const landingUrl = new URL('/landing', request.url);
      return markReturnVisit(NextResponse.redirect(landingUrl));
    }

    // Unauthenticated user - redirect to login (do not route protected endpoints through landing).
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
    return markReturnVisit(NextResponse.redirect(loginUrl));
  }

  // Role-based route protection (UX layer).
  // user_role is a non-httpOnly cookie set by the login proxy alongside auth_token.
  const userRole = request.cookies.get('user_role')?.value;
  for (const guard of ROLE_PROTECTED_ROUTES) {
    if (pathname.startsWith(guard.prefix)) {
      // Fail open if role cookie is temporarily missing/stale; backend remains authoritative.
      if (userRole && !hasRequiredRole(userRole, guard.roles)) {
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
