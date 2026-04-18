// Auth Middleware - Redirect unauthenticated users to login
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
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

export function middleware(request: NextRequest) {
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

  // If no token or user, redirect to login
  if (!authToken && !hasUser) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated - allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};