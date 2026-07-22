import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Landing');
  const c = await getTranslations('Common');

  const features = [
    {
      icon: '✍️',
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      href: '/sermon',
    },
    {
      icon: '📚',
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      href: '/library',
    },
    {
      icon: '🌍',
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      href: '/library',
    },
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

      {/* Features */}
      <section className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-3 text-3xl" aria-hidden>
              {f.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {f.desc}
            </p>
          </Link>
        ))}
      </section>

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
