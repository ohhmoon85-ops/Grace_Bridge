import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { AppLocale, Content } from '@/types/database';
import {
  OLD_TESTAMENT,
  NEW_TESTAMENT,
  type BibleBook,
} from '@/lib/bible/books';
import SearchFilterBar from '@/components/library/SearchFilterBar';
import ContentCard from '@/components/library/ContentCard';

export default async function LibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const q = typeof sp.q === 'string' ? sp.q : '';
  const lang = typeof sp.lang === 'string' ? sp.lang : '';
  const type = typeof sp.type === 'string' ? sp.type : '';
  const audience = typeof sp.audience === 'string' ? sp.audience : '';
  const hasFilter = Boolean(q || lang || type || audience);

  const t = await getTranslations('Library');

  let results: Content[] = [];
  if (hasFilter && hasSupabaseEnv()) {
    const supabase = await createClient();
    let query = supabase
      .from('contents')
      .select('*')
      .eq('published', true);
    if (lang) query = query.eq('language', lang);
    if (type) query = query.eq('type', type);
    if (audience) query = query.eq('audience', audience);
    if (q) {
      const safe = q.replace(/[,()%]/g, ' ').trim();
      if (safe)
        query = query.or(
          `title.ilike.%${safe}%,description.ilike.%${safe}%,book.ilike.%${safe}%`
        );
    }
    const { data } = await query.order('created_at', { ascending: false });
    results = (data as Content[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>
      <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
        {t('subtitle')}
      </p>

      <SearchFilterBar q={q} lang={lang} type={type} audience={audience} />

      {hasFilter ? (
        results.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            {t('noResults')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c) => (
              <ContentCard key={c.id} content={c} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6">
          <Testament
            title={t('oldTestament')}
            books={OLD_TESTAMENT}
            locale={locale as AppLocale}
          />
          <Testament
            title={t('newTestament')}
            books={NEW_TESTAMENT}
            locale={locale as AppLocale}
          />
        </div>
      )}
    </div>
  );
}

function Testament({
  title,
  books,
  locale,
}: {
  title: string;
  books: BibleBook[];
  locale: AppLocale;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {books.map((b) => (
          <Link
            key={b.id}
            href={`/library/book/${b.id}`}
            className="tap-target flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {b.names[locale]}
          </Link>
        ))}
      </div>
    </section>
  );
}
