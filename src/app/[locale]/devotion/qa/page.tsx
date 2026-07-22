import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentProfile } from '@/lib/auth';
import BibleQA from '@/components/qa/BibleQA';

export default async function BibleQAPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  const t = await getTranslations('QA');
  const c = await getTranslations('Common');

  if (!profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="mb-4 text-5xl" aria-hidden>
          💬
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          {t('loginRequired')}
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white"
        >
          {c('signIn')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <Link
          href="/devotion"
          className="text-sm font-medium text-brand-600"
        >
          ← {t('title')}
        </Link>
      </div>
      <BibleQA />
    </div>
  );
}
