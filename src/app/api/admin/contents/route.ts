import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';
import { contentSchema, normalizeContent } from '@/lib/content/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;

  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contents')
    .insert({ ...normalizeContent(parsed.data), created_by: guard.profile.id })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
