import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

function getPathnameWithoutLocale(pathname: string): string {
  const locales = routing.locales;
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.replace(`/${locale}`, '') || '/';
    }
  }
  return pathname;
}

const protectedRoutes = ['/profile'];
const authRoutes = ['/login', '/register'];

export default async function middleware(request: NextRequest) {
  // ensure decoded pathname for proper locale detection
  const pathname = decodeURIComponent(request.nextUrl.pathname);
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const token = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!token;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  // Debug (safe to remove once verified)
  try {
    // eslint-disable-next-line no-console
    console.log('[middleware] pathname=', pathname, 'pathnameWithoutLocale=', pathnameWithoutLocale, 'isProtected=', isProtectedRoute, 'isAuthRoute=', isAuthRoute, 'isAuthenticated=', isAuthenticated);
  } catch (e) {
    // ignore in restricted runtimes
  }

  // Always allow auth pages to render (prevents middleware from redirecting/404ing them)
  if (isAuthRoute) {
    return intlMiddleware(request);
  }

  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|en/auth/callback|ar/auth/callback|.*\\..*).*)',
  ],
};
