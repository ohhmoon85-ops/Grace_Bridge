import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { getCurrentProfile } from '@/lib/auth';
import type { Announcement } from '@/types/database';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 기존 일반 성도 계정은 목회자 전용 개편 안내 페이지로 유도
  const profile = await getCurrentProfile();
  if (profile?.role === 'member') {
    redirect({ href: '/member-notice', locale });
  }
  const t = await getTranslations('Landing');
  const c = await getTranslations('Common');
  const a = await getTranslations('Announcements');

  let announcements: Announcement[] = [];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('grace_bridge_announcements')
      .select('*')
      .eq('language', locale)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(3);
    announcements = (data as Announcement[]) ?? [];
  }

  // 목회자 전용 단일 기능 소개
  const features = [
    {
      icon: '✍️',
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      href: '/sermon',
    },
    {
      icon: '📚',
      title: t('featureResourcesTitle'),
      desc: t('featureResourcesDesc'),
      href: '/library',
    },
    {
      icon: '📁',
      title: t('featureSavedTitle'),
      desc: t('featureSavedDesc'),
      href: '/sermon/saved',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-14 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-brand-800 dark:bg-gold/20 dark:text-gold-soft">
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

      {/* Features — 목회자 전용 단일 섹션 */}
      <section className="pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* Trust line */}
      <section className="mb-10">
        <p className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {t('trustLine')}
        </p>
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
        <div className="rounded-2xl border border-dashed border-gold bg-paper-dim p-5 text-sm leading-relaxed text-ink dark:border-gold/40 dark:bg-gray-900 dark:text-gray-200">
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
