import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'ro', 'ru'];
const defaultLocale = 'en';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Do not rewrite or redirect API routes, admin panel, or static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/logadmin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale (e.g. / -> /en, /prices -> /en/prices)
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico).*)',
  ],
};
