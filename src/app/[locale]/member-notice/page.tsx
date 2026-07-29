import { getTranslations, setRequestLocale } from 'next-intl/server';
import { signOutAction } from '../auth-actions';

export default async function MemberNoticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('MemberNotice');

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="mb-4 text-5xl" aria-hidden>
        🕊️
      </div>
      <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {t('body')}
      </p>
      <form action={signOutAction}>
        <button
          type="submit"
          className="tap-target rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {t('signOut')}
        </button>
      </form>
    </div>
  );
}
