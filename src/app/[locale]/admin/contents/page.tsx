import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { Link } from '@/i18n/navigation';
import type { Content } from '@/types/database';
import ContentList from '@/components/admin/ContentList';

export default async function AdminContentsPage() {
  if (!hasSupabaseEnv()) {
    return <p className="text-sm text-gray-500">환경변수를 설정해 주세요.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from('contents')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          콘텐츠 관리
        </h2>
        <Link
          href="/admin/contents/new"
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
        >
          + 새 콘텐츠
        </Link>
      </div>
      <ContentList initial={(data as Content[]) ?? []} />
    </div>
  );
}
