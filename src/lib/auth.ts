import { createClient } from './supabase/server';
import { hasSupabaseEnv } from './supabase/env';
import type { Profile } from '@/types/database';

/**
 * Returns the authenticated user's profile, or null if not signed in.
 * Use in Server Components / Route Handlers.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (profile as Profile) ?? null;
}

/**
 * Effective role, accounting for pastor-approval gating.
 * A pastor who is not yet approved is treated as a member.
 */
export function effectiveRole(profile: Profile | null): Profile['role'] | 'guest' {
  if (!profile) return 'guest';
  if (profile.role === 'pastor' && !profile.approved) return 'member';
  return profile.role;
}
