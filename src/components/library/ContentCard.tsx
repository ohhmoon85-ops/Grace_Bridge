'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Content, AppLocale } from '@/types/database';
import { bookName } from '@/lib/bible/books';
import { youtubeThumb } from '@/lib/youtube';

const TYPE_ICON: Record<string, string> = {
  slide: '🖼️',
  video: '🎬',
  pdf: '📄',
};

export default function ContentCard({ content }: { content: Content }) {
  const t = useTranslations('Library');
  const locale = useLocale() as AppLocale;
  const thumb = content.type === 'video' ? youtubeThumb(content.video_url) : null;

  const typeLabel =
    content.type === 'slide'
      ? t('typeSlide')
      : content.type === 'video'
        ? t('typeVideo')
        : t('typePdf');

  return (
    <Link
      href={`/library/content/${content.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative flex aspect-video items-center justify-center bg-gray-100 dark:bg-gray-800">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl" aria-hidden>
            {TYPE_ICON[content.type]}
          </span>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {typeLabel}
        </span>
        {content.audience === 'pastor' && (
          <span className="absolute right-2 top-2 rounded-md bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white">
            {t('forPastors')}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-gray-900 dark:text-white">
          {content.title}
        </h3>
        {content.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
            {content.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          {content.book && <span>{bookName(content.book, locale)}</span>}
          {content.book && <span>·</span>}
          <span>{content.language.toUpperCase()}</span>
          <span className="ml-auto">
            👁 {content.view_count} {t('views')}
          </span>
        </div>
      </div>
    </Link>
  );
}
