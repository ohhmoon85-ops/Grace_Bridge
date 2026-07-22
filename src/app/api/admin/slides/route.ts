import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin';
import { anthropic, SERMON_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  scripture: z.string().max(200),
  topic: z.string().max(300),
  audience: z.string().max(60).optional().default(''),
  count: z.number().int().min(5).max(20),
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
  const { scripture, topic, audience, count, language } = parsed.data;

  const prompt = `Create a ${count}-slide teaching presentation for a church audience.

- Scripture: ${scripture}
- Topic: ${topic}
${audience ? `- Audience: ${audience}` : ''}
- Write all content in ${LANG_NAME[language]}.

Rules:
- Keep each slide focused and readable (a short title + 1-3 sentences of body).
- Stay within mainstream Protestant interpretation; avoid denominational bias and political content.
- Do not quote long Scripture passages verbatim; summarize and reference instead.

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{"slides":[{"title":"...","body":"...","note":"...(optional speaker note)"}]}`;

  try {
    const msg = await anthropic.messages.create({
      model: SERMON_MODEL,
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === 'text');
    const raw = textBlock && 'text' in textBlock ? textBlock.text : '';
    const jsonStr = raw.replace(/```json|```/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    const slice = start >= 0 ? jsonStr.slice(start, end + 1) : jsonStr;
    const parsedJson = JSON.parse(slice);

    return NextResponse.json({ slides: parsedJson.slides ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
