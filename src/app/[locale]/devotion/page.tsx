import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { Devotional } from '@/types/database';
import Markdown from '@/components/Markdown';

export default async function DevotionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Devotion');

  let devotionals: Devotional[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('devotionals')
      .select('*')
      .eq('status', 'published')
      .eq('language', locale)
      .lte('date', today)
      .order('date', { ascending: false })
      .limit(8);
    devotionals = (data as Devotional[]) ?? [];
  }

  const today = devotionals[0];
  const recent = devotionals.slice(1);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <Link
          href="/devotion/qa"
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
        >
          💬 {t('askBible')}
        </Link>
      </div>

      {!today ? (
        <p className="rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500 dark:border-gray-800">
          {t('notReady')}
        </p>
      ) : (
        <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            {t('verseOfDay')} · {today.date}
          </p>
          <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {today.verse_ref}
          </p>
          <Markdown content={today.body_md} />
        </article>
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('recent')}
          </h2>
          <ul className="space-y-2">
            {recent.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-xs text-gray-400">{d.date}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {d.verse_ref}
                </p>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                  {d.body_md.replace(/[#*_>`]/g, '')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
