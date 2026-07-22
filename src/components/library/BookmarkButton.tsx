'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export default function BookmarkButton({
  contentId,
  isLoggedIn,
}: {
  contentId: string;
  isLoggedIn: boolean;
}) {
  const t = useTranslations('Library');
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((d) => setBookmarked((d.ids ?? []).includes(contentId)))
      .catch(() => {});
  }, [contentId, isLoggedIn]);

  async function toggle() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setBusy(true);
    const method = bookmarked ? 'DELETE' : 'POST';
    const res = await fetch('/api/bookmarks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: contentId }),
    });
    setBusy(false);
    if (res.ok) setBookmarked((v) => !v);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`tap-target flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
        bookmarked
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
          : 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200'
      }`}
    >
      <span aria-hidden>{bookmarked ? '★' : '☆'}</span>
      {bookmarked ? t('bookmarked') : t('bookmark')}
    </button>
  );
}
