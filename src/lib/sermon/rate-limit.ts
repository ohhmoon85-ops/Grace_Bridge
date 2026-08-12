import { createAdminClient } from '@/lib/supabase/admin';
import { PRICING } from '@/config/pricing';
import type { Profile } from '@/types/database';

// 성도 요약 미리보기 1일 한도 (미승인 목회자/성도)
export const DAILY_LIMITS = {
  memberSummary: 3,
} as const;

function startOfTodayISO(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
}

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();
}

async function countUsage(
  userId: string,
  action: string,
  sinceISO?: string
): Promise<number> {
  const admin = createAdminClient();
  let query = admin
    .from('grace_bridge_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action);
  if (sinceISO) query = query.gte('created_at', sinceISO);
  const { count } = await query;
  return count ?? 0;
}

/**
 * 오늘 사용량(요약 미리보기 등) 확인.
 */
export async function checkDailyLimit(
  userId: string,
  action: string,
  limit: number
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const used = await countUsage(userId, action, startOfTodayISO());
  return { allowed: used < limit, used, remaining: Math.max(0, limit - used) };
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  period: 'month' | 'total' | 'none';
}

/**
 * 설교 전문 생성 쿼터.
 *  - admin: 무제한
 *  - standard 플랜: 이번 달 30편 (PRICING.standard.sermonPerMonth)
 *  - free 플랜: 총 3편 (PRICING.free.sermonTotal)
 */
export async function checkSermonQuota(profile: Profile): Promise<QuotaResult> {
  if (profile.role === 'admin') {
    return { allowed: true, used: 0, remaining: Infinity, limit: Infinity, period: 'none' };
  }

  const plan = profile.plan ?? 'free';
  if (plan === 'standard') {
    const limit = PRICING.standard.sermonPerMonth;
    const used = await countUsage(profile.id, 'sermon_full', startOfMonthISO());
    return {
      allowed: used < limit,
      used,
      remaining: Math.max(0, limit - used),
      limit,
      period: 'month',
    };
  }

  // free: 총 누적(평생) 기준
  const limit = PRICING.free.sermonTotal;
  const used = await countUsage(profile.id, 'sermon_full');
  return {
    allowed: used < limit,
    used,
    remaining: Math.max(0, limit - used),
    limit,
    period: 'total',
  };
}

export async function logUsage(
  userId: string,
  action: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  const admin = createAdminClient();
  await admin.from('grace_bridge_usage_logs').insert({
    user_id: userId,
    action,
    meta_json: meta,
  });
}
