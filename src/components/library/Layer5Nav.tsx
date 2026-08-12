'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { AppLocale } from '@/types/database';
import { LAYERS } from '@/lib/library/structure';

export default function Layer5Nav() {
  const t = useTranslations('Library');
  const locale = useLocale() as AppLocale;
  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {t('structureTitle')}
      </p>
      <ol className="flex flex-wrap gap-1.5">
        {LAYERS.map((l, i) => (
          <li
            key={l.id}
            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
          >
            {i + 1}. {l.labels[locale]}
          </li>
        ))}
      </ol>
    </div>
  );
}
