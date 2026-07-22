import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { Devotional } from '@/types/database';
import DevotionalManager from '@/components/admin/DevotionalManager';

export default async function AdminDevotionalsPage() {
  if (!hasSupabaseEnv()) {
    return <p className="text-sm text-gray-500">환경변수를 설정해 주세요.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from('devotionals')
    .select('*')
    .order('date', { ascending: false })
    .limit(60);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        묵상 관리
      </h2>
      <DevotionalManager initial={(data as Devotional[]) ?? []} />
    </div>
  );
}
