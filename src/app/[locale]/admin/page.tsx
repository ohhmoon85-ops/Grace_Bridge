import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { Link } from '@/i18n/navigation';

export default async function AdminDashboard() {
  if (!hasSupabaseEnv()) {
    return (
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        Supabase 환경변수가 설정되지 않았습니다. 배포 환경변수를 등록해 주세요.
      </p>
    );
  }

  const supabase = await createClient();

  const [
    totalMembers,
    pastors,
    pending,
    totalContents,
    publishedContents,
    sermonCount,
    pendingDevotionals,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'pastor'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'pastor')
      .eq('approved', false),
    supabase.from('contents').select('*', { count: 'exact', head: true }),
    supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
      .eq('published', true),
    supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .in('action', ['sermon_full', 'sermon_summary']),
    supabase
      .from('devotionals')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'published'),
  ]);

  // 언어별 사용자 분포
  const { data: localeRows } = await supabase.from('profiles').select('locale');
  const localeDist: Record<string, number> = {};
  (localeRows ?? []).forEach((r: { locale: string }) => {
    localeDist[r.locale] = (localeDist[r.locale] ?? 0) + 1;
  });

  // 인기 콘텐츠
  const { data: popular } = await supabase
    .from('contents')
    .select('id, title, view_count')
    .order('view_count', { ascending: false })
    .limit(5);

  const stats = [
    { label: '총 회원', value: totalMembers.count ?? 0 },
    { label: '목회자', value: pastors.count ?? 0 },
    {
      label: '승인 대기',
      value: pending.count ?? 0,
      href: '/admin/members',
      highlight: (pending.count ?? 0) > 0,
    },
    { label: '전체 콘텐츠', value: totalContents.count ?? 0 },
    { label: '게시 콘텐츠', value: publishedContents.count ?? 0 },
    { label: '설교 생성', value: sermonCount.count ?? 0 },
    {
      label: '묵상 승인 대기',
      value: pendingDevotionals.count ?? 0,
      href: '/admin/devotionals',
      highlight: (pendingDevotionals.count ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <div
              className={`rounded-2xl border p-4 ${
                s.highlight
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
              }`}
            >
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {s.value}
              </p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          언어별 사용자 분포
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          {Object.keys(localeDist).length === 0 ? (
            <p className="text-sm text-gray-500">데이터 없음</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(localeDist).map(([loc, cnt]) => {
                const total = localeRows?.length || 1;
                const pct = Math.round((cnt / total) * 100);
                return (
                  <li key={loc} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-medium uppercase text-gray-500">
                      {loc}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs text-gray-500">
                      {cnt}명 ({pct}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          인기 콘텐츠
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {!popular || popular.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">데이터 없음</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {popular.map((c: { id: string; title: string; view_count: number }) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="truncate text-gray-800 dark:text-gray-100">
                    {c.title}
                  </span>
                  <span className="ml-3 shrink-0 text-gray-500">
                    👁 {c.view_count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
