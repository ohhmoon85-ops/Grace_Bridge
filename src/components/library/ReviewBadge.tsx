'use client';

import { useTranslations } from 'next-intl';
import { DEFAULT_REVIEWER } from '@/lib/content/schema';

export default function ReviewBadge({
  reviewedBy,
  reviewedAt,
  className = '',
}: {
  reviewedBy: string | null;
  reviewedAt: string | null;
  className?: string;
}) {
  const t = useTranslations('Library');
  if (!reviewedAt) return null;

  const d = new Date(reviewedAt);
  const date = `${d.getFullYear()}.${d.getMonth() + 1}`;
  const name =
    !reviewedBy || reviewedBy === DEFAULT_REVIEWER
      ? t('reviewerDefault')
      : reviewedBy;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-gold px-2.5 py-0.5 text-[11px] font-medium text-gold ${className}`}
      title="검수 완료"
    >
      <span aria-hidden>🔖</span>
      {t('reviewed', { name, date })}
    </span>
  );
}
