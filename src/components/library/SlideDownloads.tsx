'use client';

import { useTranslations } from 'next-intl';
import type { SlideData } from '@/types/database';
import { exportSlidesPdf, exportSlidesHandout } from '@/lib/sermon/export';

export default function SlideDownloads({
  title,
  data,
}: {
  title: string;
  data: SlideData;
}) {
  const t = useTranslations('Library');
  const slides = data.slides ?? [];
  if (slides.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        onClick={() => exportSlidesPdf(title, slides)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
      >
        ⬇ {t('downloadSlidesPdf')}
      </button>
      <button
        onClick={() => exportSlidesHandout(title, slides)}
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
      >
        ⬇ {t('downloadHandout')}
      </button>
    </div>
  );
}
