import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect, Link } from '@/i18n/navigation';
import { getCurrentProfile } from '@/lib/auth';
import SavedList from '@/components/sermon/SavedList';

export default async function SavedSermonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: '/login', locale });
  }

  const t = await getTranslations('Sermon');

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('savedSermons')}
        </h1>
        <Link
          href="/sermon"
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
        >
          + {t('newSermon')}
        </Link>
      </div>
      <SavedList />
    </div>
  );
}
