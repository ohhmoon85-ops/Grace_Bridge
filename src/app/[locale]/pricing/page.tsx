import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PRICING } from '@/config/pricing';

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pricing');

  const rows = [
    { label: t('rowSermon'), free: t('freeSermon'), std: t('stdSermon') },
    { label: t('rowResources'), free: t('freeResources'), std: t('stdResources') },
    { label: t('rowSaved'), free: t('freeSaved'), std: t('stdSaved') },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* 무료 체험 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('planFree')}
          </h2>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            ₩0
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {rows.map((r) => (
              <li key={r.label} className="flex justify-between gap-3">
                <span>{r.label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {r.free}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 스탠다드 */}
        <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-6 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('planStandard')}
          </h2>
          {PRICING.standardPriceLabel ? (
            <>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {PRICING.standardPriceLabel}{' '}
                <span className="text-sm font-normal text-gray-500">
                  {t('perMonth')}
                </span>
              </p>
              <span className="mt-1 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-gold/20 dark:text-gold-soft">
                {t('launchSpecial')}
              </span>
            </>
          ) : (
            <p className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              {t('comingSoon')}
            </p>
          )}
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {rows.map((r) => (
              <li key={r.label} className="flex justify-between gap-3">
                <span>{r.label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  {r.std}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="tap-target mt-6 flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t('cta')}
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        {t('ctaNote')}
      </p>
    </div>
  );
}
