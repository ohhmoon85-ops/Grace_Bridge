import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentProfile, effectiveRole } from '@/lib/auth';
import SermonStudio from '@/components/sermon/SermonStudio';

export default async function SermonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  const role = effectiveRole(profile);

  if (role === 'guest') {
    const t = await getTranslations('Sermon');
    const c = await getTranslations('Common');
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="mb-4 text-5xl" aria-hidden>
          ✍️
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

  const canFull = role === 'pastor' || role === 'admin';
  return <SermonStudio canFull={canFull} />;
}
