import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { Announcement } from '@/types/database';
import AnnouncementManager from '@/components/admin/AnnouncementManager';

export default async function AdminAnnouncementsPage() {
  if (!hasSupabaseEnv()) {
    return <p className="text-sm text-gray-500">환경변수를 설정해 주세요.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('id', { ascending: false })
    .limit(60);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        공지사항 관리
      </h2>
      <AnnouncementManager initial={(data as Announcement[]) ?? []} />
    </div>
  );
}
