import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { AppLocale, Content } from '@/types/database';
import { getBook } from '@/lib/bible/books';
import ContentCard from '@/components/library/ContentCard';

export default async function BookContentsPage({
  params,
}: {
  params: Promise<{ locale: string; book: string }>;
}) {
  const { locale, book } = await params;
  setRequestLocale(locale);

  const bibleBook = getBook(book);
  if (!bibleBook) {
    notFound();
  }

  const t = await getTranslations('Library');
  let contents: Content[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('contents')
      .select('*')
      .eq('published', true)
      .eq('book', book)
      .order('created_at', { ascending: false });
    contents = (data as Content[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/library"
        className="mb-4 inline-block text-sm font-medium text-brand-600"
      >
        ← {t('backToLibrary')}
      </Link>
      <h1 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">
        {bibleBook!.names[locale as AppLocale]}
      </h1>

      {contents.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          {t('noContentInBook')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      )}
    </div>
  );
}
