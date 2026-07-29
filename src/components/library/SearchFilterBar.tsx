'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { locales } from '@/i18n/routing';
import { PURPOSE_TAGS } from '@/lib/library/tags';
import type { AppLocale } from '@/types/database';

interface Props {
  q: string;
  lang: string;
  type: string;
  purpose: string;
}

export default function SearchFilterBar({ q, lang, type, purpose }: Props) {
  const t = useTranslations('Library');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [query, setQuery] = useState(q);

  function apply(next: Partial<Props>) {
    const merged = { q: query, lang, type, purpose, ...next };
    const params: Record<string, string> = {};
    if (merged.q) params.q = merged.q;
    if (merged.lang) params.lang = merged.lang;
    if (merged.type) params.type = merged.type;
    if (merged.purpose) params.purpose = merged.purpose;
    router.push({ pathname: '/library', query: params });
  }

  const selectClass =
    'rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700';

  return (
    <div className="mb-5 space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({});
        }}
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-base dark:border-gray-700 dark:bg-transparent"
        />
        <button
          type="submit"
          className="tap-target rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          🔍
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <select
          value={purpose}
          onChange={(e) => apply({ purpose: e.target.value })}
          className={selectClass}
          aria-label={t('filterPurpose')}
        >
          <option value="">{t('filterPurpose')}: {t('all')}</option>
          {PURPOSE_TAGS.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.labels[locale]}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => apply({ type: e.target.value })}
          className={selectClass}
          aria-label={t('filterType')}
        >
          <option value="">{t('filterType')}: {t('all')}</option>
          <option value="slide">{t('typeSlide')}</option>
          <option value="video">{t('typeVideo')}</option>
          <option value="pdf">{t('typePdf')}</option>
        </select>

        <select
          value={lang}
          onChange={(e) => apply({ lang: e.target.value })}
          className={selectClass}
          aria-label={t('filterLanguage')}
        >
          <option value="">{t('filterLanguage')}: {t('all')}</option>
          {locales.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
