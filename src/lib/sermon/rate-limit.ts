import { createAdminClient } from '@/lib/supabase/admin';

// 역할별 1일 생성 한도 (문서 8. 보안·품질 요구사항)
export const DAILY_LIMITS = {
  pastorFull: 10, // 목회자: 설교 전문 1일 10회
  memberSummary: 3, // 성도: 요약 미리보기 1일 3회
} as const;

function startOfTodayISO(): string {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return start.toISOString();
}

/**
 * 오늘 사용량을 확인합니다. 한도를 넘지 않았으면 allowed=true.
 * 로그 기록은 별도의 logUsage 로 수행합니다.
 */
export async function checkDailyLimit(
  userId: string,
  action: string,
  limit: number
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const admin = createAdminClient();
  const { count } = await admin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', startOfTodayISO());

  const used = count ?? 0;
  return {
    allowed: used < limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

export async function logUsage(
  userId: string,
  action: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  const admin = createAdminClient();
  await admin.from('usage_logs').insert({
    user_id: userId,
    action,
    meta_json: meta,
  });
}
