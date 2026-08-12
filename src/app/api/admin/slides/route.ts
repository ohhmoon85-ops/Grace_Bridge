import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminApi } from '@/lib/admin';
import { anthropic, SERMON_MODEL } from '@/lib/anthropic';
import { getBook } from '@/lib/bible/books';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  mode: z.enum(['A', 'B']),
  book: z.string().max(60).optional().default(''),
  audience: z.enum(['adult', 'newbeliever', 'youth']).optional().default('adult'),
  topic: z.string().max(300).optional().default(''),
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
const BIBLE_VERSION: Record<string, string> = {
  ko: '개역개정',
  en: 'ESV',
  fr: 'Louis Segond',
  es: 'Reina-Valera',
  de: 'Lutherbibel',
};
const AUDIENCE_DESC: Record<string, string> = {
  adult: 'general adult believers',
  newbeliever: 'new believers and seekers (use very plain language, explain every term)',
  youth: 'teenagers (concrete, relatable language)',
};

// 공통 품질 규칙
function qualityRules(lang: string): string {
  return `Quality rules:
- Plain sentences a new adult believer can understand. When a technical term is unavoidable, add a short gloss in parentheses.
- Mainstream Protestant evangelical perspective. For matters disputed between denominations, describe neutrally without taking sides.
- Treat dates, place names, and personal names conservatively; where scholarship disagrees on a date, mark it "약/approx.".
- Cite Scripture by chapter:verse; keep any direct quotation to one verse or less.
- Use the standard ${BIBLE_VERSION[lang]} notation for the output language.
- Write ALL slide text in ${LANG_NAME[lang]}.`;
}

// 모드 A: 성경 책별 자료 — 5층 구조
function buildModeAPrompt(bookEn: string, audience: string, count: number, lang: string): string {
  return `Create a ${count}-slide teaching resource that gives a whole-book overview of the biblical book of ${bookEn}, for ${AUDIENCE_DESC[audience]}.

The slides MUST follow this exact 5-layer structure (distribute the ${count} slides across the layers as noted):

[Layer 1] At a glance (1-2 slides)
  - author, time of writing, audience/recipients, purpose, ONE key verse (with chapter:verse), and a one-line summary of the whole structure.
[Layer 2] Historical background (2-3 slides)
  - the empire/political situation of the time, the situation of Israel (or the early church community), the geographical setting, and the customs/culture needed to understand the text.
[Layer 3] Flow of the book (2-3 slides)
  - summarize the whole flow as 8-10 story-unit "beats", NOT a chapter-by-chapter list.
[Layer 4] Theological core & connection to Christ (1-2 slides)
  - where this book sits in the whole history of redemption, and its connection point to Jesus Christ.
[Layer 5] Application today + discussion questions (1 slide)
  - exactly three discussion questions usable right away in a small group.

${qualityRules(lang)}

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{"slides":[{"title":"...","body":"...","note":"...(optional speaker note)"}]}
Give each slide a clear title; the first word/phrase of each layer's first slide should make the layer obvious (e.g. "한눈에 보기", "역사적 배경", ...).`;
}

// 모드 B: 공통 주제 자료
function buildModeBPrompt(topic: string, count: number, lang: string): string {
  return `Create a ${count}-slide teaching resource on the following cross-cutting biblical topic (not a single Bible book):

Topic: ${topic}

Organize it clearly (overview → key points → summary/application) with a discussion section of three questions at the end.

${qualityRules(lang)}

Return ONLY valid JSON (no markdown, no code fences) with this exact shape:
{"slides":[{"title":"...","body":"...","note":"...(optional speaker note)"}]}`;
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if ('response' in guard) return guard.response;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }
  const { mode, book, audience, topic, count, language } = parsed.data;

  let prompt: string;
  if (mode === 'A') {
    const bookEn = getBook(book)?.names.en;
    if (!bookEn) {
      return NextResponse.json({ error: 'invalid_book' }, { status: 400 });
    }
    prompt = buildModeAPrompt(bookEn, audience, count, language);
  } else {
    if (!topic.trim()) {
      return NextResponse.json({ error: 'invalid_topic' }, { status: 400 });
    }
    prompt = buildModeBPrompt(topic, count, language);
  }

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
