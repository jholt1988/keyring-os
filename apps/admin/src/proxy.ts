// Auth Middleware - Redirect unauthenticated users to login or landing
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/landing',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/v2/auth/login',
  '/api/v2/auth/refresh',
  '/_vercel',
  '/_next',
  '/favicon.ico',
  '/fonts',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
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

  // Token-present requests may proceed; backend API calls still enforce JWT validity and role/org guards.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};