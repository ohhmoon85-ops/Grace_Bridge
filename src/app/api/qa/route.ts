import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentProfile } from '@/lib/auth';
import { anthropic, SERMON_MODEL } from '@/lib/anthropic';
import { checkDailyLimit, logUsage } from '@/lib/sermon/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_QA_LIMIT = 30;

const schema = z.object({
  language: z.enum(['ko', 'en', 'fr', 'es', 'de']),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(30),
});

const LANG_NAME: Record<string, string> = {
  ko: 'Korean',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
};

function systemPrompt(lang: string): string {
  return `You are a warm, knowledgeable assistant that answers questions about the Bible for lay believers, in the mainstream tradition of the Protestant church.

Rules:
- Answer clearly and pastorally, grounded in Scripture. Reference chapter:verse where helpful, but do not quote long passages verbatim.
- Stay within mainstream evangelical/Reformed Protestant interpretation. Do not attack or favor any particular denomination.
- For questions that are politically divisive, sharply contested between denominations, or that concern a personal crisis (grief, abuse, self-harm, major life decisions), do NOT give a definitive ruling. Gently acknowledge the question and recommend that they speak with their pastor for personal counsel.
- Keep answers concise and readable.
- Write entirely in ${LANG_NAME[lang] ?? 'the requested language'}.`;
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const limit = await checkDailyLimit(profile.id, 'bible_qa', DAILY_QA_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  await logUsage(profile.id, 'bible_qa', { language: parsed.data.language });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };
      try {
        const messageStream = anthropic.messages.stream({
          model: SERMON_MODEL,
          max_tokens: 2000,
          system: systemPrompt(parsed.data.language),
          messages: parsed.data.messages,
        });
        messageStream.on('text', (text: string) => send('delta', { text }));
        await messageStream.finalMessage();
        send('done', {});
      } catch (err) {
        const message = err instanceof Error ? err.message : 'failed';
        send('error', { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
