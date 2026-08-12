import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { getCurrentProfile, effectiveRole } from '@/lib/auth';
import type { AppLocale, Content } from '@/types/database';
import {
  OLD_TESTAMENT,
  NEW_TESTAMENT,
  type BibleBook,
} from '@/lib/bible/books';
import { COMMON_SLOTS } from '@/lib/library/structure';
import SearchFilterBar from '@/components/library/SearchFilterBar';
import ContentCard from '@/components/library/ContentCard';

const OLD_IDS = OLD_TESTAMENT.map((b) => b.id);
const NEW_IDS = NEW_TESTAMENT.map((b) => b.id);

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
  const purpose = typeof sp.purpose === 'string' ? sp.purpose : '';
  const scope = typeof sp.scope === 'string' ? sp.scope : ''; // whole | old | new
  const hasFilter = Boolean(q || lang || type || purpose);
  const showResults = hasFilter || Boolean(scope);

  const t = await getTranslations('Library');
  const profile = await getCurrentProfile();
  const isAdmin = effectiveRole(profile) === 'admin';

  let results: Content[] = [];
  if (showResults && hasSupabaseEnv()) {
    const supabase = await createClient();
    let query = supabase
      .from('grace_bridge_contents')
      .select('*')
      .eq('published', true);
    if (lang) query = query.eq('language', lang);
    if (type) query = query.eq('type', type);
    if (purpose) query = query.contains('purpose_tags', [purpose]);
    if (scope === 'whole') query = query.is('book', null);
    else if (scope === 'old') query = query.in('book', OLD_IDS);
    else if (scope === 'new') query = query.in('book', NEW_IDS);
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

  // 기본(브라우징) 화면에서 어떤 책에 게시 자료가 있는지 조회 → 나머지는 '준비 중'
  const availableBooks = new Set<string>();
  if (!showResults && hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('grace_bridge_contents')
      .select('book')
      .eq('published', true)
      .not('book', 'is', null);
    (data ?? []).forEach((r: { book: string | null }) => {
      if (r.book) availableBooks.add(r.book);
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        {isAdmin && (
          <Link
            href="/admin/contents/new"
            className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + {t('addResource')}
          </Link>
        )}
      </div>
      <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
        {t('subtitle')}
      </p>

      {/* 성경 전체 / 구약 / 신약 배너 */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Banner
          href="whole"
          icon="📖"
          title={t('wholeBible')}
          desc={t('wholeBibleDesc')}
          active={scope === 'whole'}
        />
        <Banner
          href="old"
          icon="📜"
          title={t('oldTestament')}
          desc="Genesis — Malachi"
          active={scope === 'old'}
        />
        <Banner
          href="new"
          icon="✝️"
          title={t('newTestament')}
          desc="Matthew — Revelation"
          active={scope === 'new'}
        />
      </div>

      <SearchFilterBar q={q} lang={lang} type={type} purpose={purpose} />

      {showResults ? (
        <>
          {scope && (
            <Link
              href="/library"
              className="mb-3 inline-block text-sm font-medium text-brand-600"
            >
              ← {t('backToLibrary')}
            </Link>
          )}
          {results.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-500">
              {t('noResults')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((c) => (
                <ContentCard key={c.id} content={c} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {/* 공통 자료 (성경 전체) */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {t('commonResources')}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {COMMON_SLOTS.map((slot) => (
                <div
                  key={slot.id}
                  className="rounded-xl border border-dashed border-gray-300 bg-paper-dim px-3 py-3 text-center dark:border-gray-700 dark:bg-gray-900"
                  title={t('comingSoonNotice')}
                >
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {slot.labels[locale as AppLocale]}
                  </span>
                  <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800">
                    {t('preparing')}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <Testament
            title={t('oldTestament')}
            books={OLD_TESTAMENT}
            locale={locale as AppLocale}
            available={availableBooks}
            preparingLabel={t('preparing')}
            comingSoon={t('comingSoonNotice')}
          />
          <Testament
            title={t('newTestament')}
            books={NEW_TESTAMENT}
            locale={locale as AppLocale}
            available={availableBooks}
            preparingLabel={t('preparing')}
            comingSoon={t('comingSoonNotice')}
          />
        </div>
      )}
    </div>
  );
}

function Banner({
  href,
  icon,
  title,
  desc,
  active,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  active: boolean;
}) {
  return (
    <Link
      href={{ pathname: '/library', query: { scope: href } }}
      className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:border-brand-300 hover:shadow-sm ${
        active
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block font-semibold text-gray-900 dark:text-white">
          {title}
        </span>
        <span className="block text-xs text-gray-500">{desc}</span>
      </span>
    </Link>
  );
}

function Testament({
  title,
  books,
  locale,
  available,
  preparingLabel,
  comingSoon,
}: {
  title: string;
  books: BibleBook[];
  locale: AppLocale;
  available: Set<string>;
  preparingLabel: string;
  comingSoon: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {books.map((b) => {
          const ready = available.has(b.id);
          if (ready) {
            return (
              <Link
                key={b.id}
                href={`/library/book/${b.id}`}
                className="tap-target flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {b.names[locale]}
              </Link>
            );
          }
          return (
            <div
              key={b.id}
              title={comingSoon}
              className="tap-target flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm font-medium text-gray-400 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-600"
            >
              {b.names[locale]}
              <span className="mt-0.5 text-[10px] text-gray-400">
                {preparingLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
