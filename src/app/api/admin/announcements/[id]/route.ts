import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;
  const { id } = await params;

  const supabase = await createClient();
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
