import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import type { AppLocale, Content } from '@/types/database';
import { bookName } from '@/lib/bible/books';
import SlideViewer from '@/components/library/SlideViewer';
import YouTubeEmbed from '@/components/library/YouTubeEmbed';
import BookmarkButton from '@/components/library/BookmarkButton';

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('contents')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) {
    notFound();
  }
  const content = data as Content;

  // 조회수 증가 (실패해도 무시)
  await supabase.rpc('increment_view_count', { content_id: id });

  const t = await getTranslations('Library');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/library"
        className="mb-4 inline-block text-sm font-medium text-brand-600"
      >
        ← {t('backToLibrary')}
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {content.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {content.book && (
              <span>{bookName(content.book, locale as AppLocale)}</span>
            )}
            <span>{content.language.toUpperCase()}</span>
            <span>
              👁 {content.view_count + 1} {t('views')}
            </span>
            {content.audience === 'pastor' && (
              <span className="rounded bg-brand-600 px-1.5 py-0.5 text-white">
                {t('forPastors')}
              </span>
            )}
          </div>
        </div>
        <BookmarkButton contentId={content.id} isLoggedIn={!!user} />
      </div>

      {content.description && (
        <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {content.description}
        </p>
      )}

      {content.type === 'slide' && content.slide_json && (
        <SlideViewer data={content.slide_json} />
      )}

      {content.type === 'video' && (
        <div>
          <YouTubeEmbed url={content.video_url} />
          {content.video_url && (
            <a
              href={content.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-brand-600"
            >
              {t('watchOnYoutube')} ↗
            </a>
          )}
        </div>
      )}

      {content.type === 'pdf' && content.file_url && (
        <a
          href={content.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-10 text-base font-semibold text-brand-600 dark:border-gray-700 dark:bg-gray-900"
        >
          📄 {t('openPdf')} ↗
        </a>
      )}
    </div>
  );
}
