'use client';

import { useTranslations } from 'next-intl';
import type { SlideData } from '@/types/database';
import { exportSlidesPdf, exportSlidesHandout } from '@/lib/sermon/export';
import { DEFAULT_REVIEWER } from '@/lib/content/schema';

export default function SlideDownloads({
  title,
  data,
  reviewedBy,
  reviewedAt,
}: {
  title: string;
  data: SlideData;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}) {
  const t = useTranslations('Library');
  const slides = data.slides ?? [];
  if (slides.length === 0) return null;

  // PDF 푸터: 검수 표기 (검수일이 있으면)
  let footer: string | undefined;
  if (reviewedAt) {
    const d = new Date(reviewedAt);
    const date = `${d.getFullYear()}.${d.getMonth() + 1}`;
    const name =
      !reviewedBy || reviewedBy === DEFAULT_REVIEWER
        ? t('reviewerDefault')
        : reviewedBy;
    footer = t('reviewed', { name, date });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => exportSlidesPdf(title, slides, footer)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
      >
        ⬇ {t('downloadSlidesPdf')}
      </button>
      <button
        onClick={() => exportSlidesHandout(title, slides, footer)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
      >
        ⬇ {t('downloadHandout')}
      </button>
    </div>
  );
}
