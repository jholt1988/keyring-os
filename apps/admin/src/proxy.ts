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
  const authToken = request.cookies.get('auth_token')?.value 
    || request.cookies.get('accessToken')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '');

  const userStr = request.cookies.get('user')?.value;
  const hasUser = userStr ? true : false;

  // If no token or user, check if first-time visitor
  if (!authToken && !hasUser) {
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

  // Authenticated - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};