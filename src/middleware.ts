import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Refresh Supabase auth session cookies, then run i18n routing.
  const { response } = await updateSession(request);
  const intlResponse = intlMiddleware(request);

  // Carry over any refreshed auth cookies onto the i18n response.
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  // Skip Next.js internals, API routes, and static assets.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
