import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin';
import { anthropic, SERMON_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  title: z.string().min(1).max(300),
  body_md: z.string().max(10000),
});

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const prompt = `Translate the following Korean church announcement into English, French, Spanish, and German.
Keep the meaning natural and appropriate for a church context. Preserve Markdown.

TITLE (Korean): ${parsed.data.title}
BODY (Korean):
${parsed.data.body_md}

Return ONLY valid JSON (no code fences) with this exact shape:
{"en":{"title":"...","body_md":"..."},"fr":{"title":"...","body_md":"..."},"es":{"title":"...","body_md":"..."},"de":{"title":"...","body_md":"..."}}`;

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
    return NextResponse.json({ translations: JSON.parse(slice) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
