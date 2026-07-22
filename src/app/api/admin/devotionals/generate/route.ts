import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin';
import { anthropic, SERMON_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  verse_ref: z.string().min(1).max(120),
  language: z.enum(['ko', 'en', 'fr', 'es', 'de']),
});

const LANG_NAME: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
};

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  const { verse_ref, language } = parsed.data;

  const prompt = `Write a short daily devotional in ${LANG_NAME[language]} based on ${verse_ref}.

- 120-200 words. Warm, pastoral, encouraging.
- Mainstream Protestant interpretation; no denominational bias, no politics.
- Do not quote long passages verbatim; a short reference is fine.
- Format as Markdown. Start with a bold heading line, then the reflection.
Return only the devotional text (Markdown), nothing else.`;

  try {
    const msg = await anthropic.messages.create({
      model: SERMON_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const textBlock = msg.content.find((b) => b.type === 'text');
    const body = textBlock && 'text' in textBlock ? textBlock.text : '';
    return NextResponse.json({ body_md: body.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
