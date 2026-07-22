'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SlideData } from '@/types/database';

const THEMES: Record<
  string,
  { wrap: string; title: string; body: string }
> = {
  classic: {
    wrap: 'bg-white text-gray-900',
    title: 'text-gray-900 font-serif',
    body: 'text-gray-700',
  },
  modern: {
    wrap: 'bg-gradient-to-br from-brand-700 to-brand-900 text-white',
    title: 'text-white',
    body: 'text-brand-50',
  },
  warm: {
    wrap: 'bg-[#fdf6ec] text-[#5b4636]',
    title: 'text-[#8a5a2b]',
    body: 'text-[#6b5544]',
  },
};

export default function SlideViewer({ data }: { data: SlideData }) {
  const t = useTranslations('Library');
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const slides = data.slides ?? [];
  const theme = THEMES[data.design] ?? THEMES.classic;
  const total = slides.length;
  const slide = slides[index];

  function go(delta: number) {
    setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  function fullscreen() {
    containerRef.current?.requestFullscreen?.();
  }

  if (total === 0) return null;

  return (
    <div>
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center ${theme.wrap}`}
      >
        <h2 className={`mb-4 text-2xl font-bold md:text-3xl ${theme.title}`}>
          {slide.title}
        </h2>
        <p
          className={`max-w-2xl whitespace-pre-wrap text-base leading-relaxed md:text-lg ${theme.body}`}
        >
          {slide.body}
        </p>
        <span className="absolute bottom-3 right-4 text-xs opacity-70">
          {t('slideProgress', { current: index + 1, total })}
        </span>
      </div>

      {slide.note && (
        <p className="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {slide.note}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="tap-target rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-gray-700"
        >
          ← {t('prev')}
        </button>
        <button
          onClick={fullscreen}
          className="tap-target rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700"
        >
          ⛶ {t('fullscreen')}
        </button>
        <button
          onClick={() => go(1)}
          disabled={index === total - 1}
          className="tap-target rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-gray-700"
        >
          {t('next')} →
        </button>
      </div>
    </div>
  );
}
