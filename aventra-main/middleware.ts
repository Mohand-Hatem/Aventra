import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from 'next/server'

export default createMiddleware(routing);


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|en/auth/callback|ar/auth/callback|.*\\..*).*)',
  ],
};


