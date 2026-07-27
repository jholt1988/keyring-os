// Auth Middleware — Tenant Portal
// Redirects unauthenticated users to login or landing.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  '/legal',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth_token')?.value;

  // Keep authenticated users out of auth/marketing pages.
  if (authToken && (pathname === '/landing' || pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

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

    const returnUserCookie = request.cookies.get('keyring_return_visit');

    if (!returnUserCookie && pathname === '/') {
      const landingUrl = new URL('/landing', request.url);
      return markReturnVisit(NextResponse.redirect(landingUrl));
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
    return markReturnVisit(NextResponse.redirect(loginUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
