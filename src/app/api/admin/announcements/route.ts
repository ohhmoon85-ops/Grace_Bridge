import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  items: z
    .array(
      z.object({
        language: z.enum(['ko', 'en', 'fr', 'es', 'de']),
        title: z.string().min(1).max(300),
        body_md: z.string().max(10000),
      })
    )
    .min(1)
    .max(5),
  publish: z.boolean().default(false),
});

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const publishedAt = parsed.data.publish ? new Date().toISOString() : null;
  const rows = parsed.data.items.map((it) => ({
    language: it.language,
    title: it.title,
    body_md: it.body_md,
    published_at: publishedAt,
  }));

  const supabase = await createClient();
  const { error } = await supabase.from('announcements').insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
