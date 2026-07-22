import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabaseEnv } from './env';

/**
 * Refreshes the Supabase auth session on each request and returns the
 * response carrying updated auth cookies. Called from src/middleware.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 환경변수 미설정 시(예: 배포 초기) 크래시 대신 그대로 진행합니다.
  if (!hasSupabaseEnv()) {
    return { response, user: null };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touch the user to trigger a token refresh when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
