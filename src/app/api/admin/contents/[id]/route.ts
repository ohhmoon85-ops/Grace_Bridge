import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';
import { contentSchema, normalizeContent } from '@/lib/content/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 전체 수정 또는 게시 상태만 토글 (published 단독 전송 허용)
const patchSchema = z.union([
  contentSchema,
  z.object({ published: z.boolean() }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const updates =
    'type' in parsed.data
      ? normalizeContent(parsed.data)
      : { published: parsed.data.published };

  const supabase = await createClient();
  const { error } = await supabase.from('contents').update(updates).eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;
  const { id } = await params;

  const supabase = await createClient();
  const { error } = await supabase.from('contents').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
