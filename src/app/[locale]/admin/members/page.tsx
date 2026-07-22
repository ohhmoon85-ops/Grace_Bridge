import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { Profile } from '@/types/database';
import MembersTable from '@/components/admin/MembersTable';

export default async function AdminMembersPage() {
  if (!hasSupabaseEnv()) {
    return <p className="text-sm text-gray-500">환경변수를 설정해 주세요.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('approved', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        회원 관리
      </h2>
      <MembersTable initial={(data as Profile[]) ?? []} />
    </div>
  );
}
