import { NextResponse } from 'next/server';
import { getCurrentProfile } from './auth';
import type { Profile } from '@/types/database';

/**
 * API Route Handler 용 관리자 인증 가드.
 * 관리자가 아니면 NextResponse(403/401)를 반환하고, 관리자면 profile을 반환합니다.
 */
export async function requireAdminApi(): Promise<
  { profile: Profile } | { response: NextResponse }
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  if (profile.role !== 'admin') {
    return { response: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { profile };
}
