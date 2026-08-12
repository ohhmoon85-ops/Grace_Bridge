import { NextResponse } from 'next/server';
import { getCurrentProfile, effectiveRole } from '@/lib/auth';
import { anthropic, SERMON_MODEL } from '@/lib/anthropic';
import { sermonInputSchema } from '@/lib/sermon/schema';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/sermon/prompt';
import {
  checkDailyLimit,
  checkSermonQuota,
  logUsage,
  DAILY_LIMITS,
} from '@/lib/sermon/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. 인증
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const role = effectiveRole(profile);

  // 2. 입력 검증
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = sermonInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // 3. 역할에 따른 모드 결정 (성도/미승인 목회자는 요약 모드만)
  const isPastorOrAdmin = role === 'pastor' || role === 'admin';
  const summaryMode = isPastorOrAdmin ? input.summaryMode ?? false : true;
  input.summaryMode = summaryMode;

  const action = summaryMode ? 'sermon_summary' : 'sermon_full';

  // 4. 사용량 제한
  //  - 요약(미승인/성도): 1일 3회
  //  - 설교 전문: 플랜별 쿼터 (free 총 3편 / standard 월 30편 / admin 무제한)
  let remaining = 0;
  if (summaryMode) {
    const check = await checkDailyLimit(
      profile.id,
      action,
      DAILY_LIMITS.memberSummary
    );
    if (!check.allowed) {
      return NextResponse.json({ error: 'rate_limited', remaining: 0 }, { status: 429 });
    }
    remaining = check.remaining;
  } else {
    const quota = await checkSermonQuota(profile);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', remaining: 0, period: quota.period },
        { status: 429 }
      );
    }
    remaining = quota.remaining;
  }

  // 5. 프롬프트 구성
  const system = buildSystemPrompt(input.outputLanguage);
  const user = buildUserPrompt(input);

  // 6. 사용 로그 기록
  await logUsage(profile.id, action, {
    language: input.outputLanguage,
    length: input.length,
    style: input.style,
  });

  // 7. 스트리밍 응답 (SSE)
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
          max_tokens: 20000,
          system,
          messages: [{ role: 'user', content: user }],
        });

        messageStream.on('text', (text: string) => {
          send('delta', { text });
        });

        await messageStream.finalMessage();
        send('done', { remaining: Math.max(0, remaining - 1) });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'generation_failed';
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
