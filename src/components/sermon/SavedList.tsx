'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface SermonRow {
  id: string;
  title: string;
  language: string;
  updated_at: string;
}

export default function SavedList() {
  const t = useTranslations('Sermon');
  const c = useTranslations('Common');
  const [rows, setRows] = useState<SermonRow[] | null>(null);

  useEffect(() => {
    fetch('/api/sermon')
      .then((r) => r.json())
      .then((d) => setRows(d.sermons ?? []))
      .catch(() => setRows([]));
  }, []);

  async function del(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    const res = await fetch(`/api/sermon/${id}`, { method: 'DELETE' });
    if (res.ok) setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
  }

  if (rows === null) {
    return <p className="py-10 text-center text-sm text-gray-500">{c('loading')}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-gray-500">
        {t('savedEmpty')}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <Link href={`/sermon/saved/${r.id}`} className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900 dark:text-white">
              {r.title || t('untitled')}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {new Date(r.updated_at).toLocaleDateString()} · {r.language.toUpperCase()}
            </p>
          </Link>
          <button
            onClick={() => del(r.id)}
            className="ml-3 shrink-0 rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-red-500"
          >
            {t('delete')}
          </button>
        </li>
      ))}
    </ul>
  );
}
