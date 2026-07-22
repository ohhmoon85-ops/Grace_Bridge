'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ThemeToggle() {
  const t = useTranslations('Theme');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t('light') : t('dark')}
      title={dark ? t('light') : t('dark')}
      className="tap-target flex items-center justify-center rounded-lg px-2.5 py-2 text-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <span aria-hidden>{dark ? '☀️' : '🌙'}</span>
    </button>
  );
}
