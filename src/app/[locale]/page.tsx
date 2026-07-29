import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { FEATURES } from '@/lib/features';
import type { Announcement } from '@/types/database';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Landing');
  const c = await getTranslations('Common');
  const a = await getTranslations('Announcements');

  let announcements: Announcement[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('language', locale)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(3);
    announcements = (data as Announcement[]) ?? [];
  }

  const pastorFeatures = [
    {
      icon: '✍️',
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      href: '/sermon',
    },
  ];

  const memberFeatures = [
    {
      icon: '📚',
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      href: '/library',
    },
    ...(FEATURES.DEVOTIONAL
      ? [
          {
            icon: '🙏',
            title: t('featureDevotionTitle'),
            desc: t('featureDevotionDesc'),
            href: '/devotion',
          },
        ]
      : []),
    ...(FEATURES.BIBLE_QNA
      ? [
          {
            icon: '💬',
            title: t('featureQATitle'),
            desc: t('featureQADesc'),
            href: '/devotion/qa',
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-14 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {t('heroTagline')}
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl dark:text-white">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-300">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="tap-target flex w-full items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700 sm:w-auto"
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href="/library"
              className="tap-target flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features — 대상별 분리 */}
      <section className="pb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
          {t('pastorTools')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pastorFeatures.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      <section className="pb-12">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('memberTools')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberFeatures.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            📢 {a('title')}
          </h2>
          <ul className="space-y-2">
            {announcements.map((ann) => (
              <li
                key={ann.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {ann.title}
                </p>
                <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                  {ann.body_md.replace(/[#*_>`]/g, '')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimer */}
      <section className="mb-14">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <span className="mr-1" aria-hidden>
            ⚠️
          </span>
          {t('disclaimer')}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-3 text-3xl" aria-hidden>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {desc}
      </p>
    </Link>
  );
}
