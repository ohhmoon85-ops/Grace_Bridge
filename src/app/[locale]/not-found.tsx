import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const c = await getTranslations('Common');
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 text-5xl" aria-hidden>
        🕊️
      </div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        404
      </h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        페이지를 찾을 수 없습니다 · Page not found
      </p>
      <Link
        href="/"
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
      >
        {c('appName')}
      </Link>
    </div>
  );
}
