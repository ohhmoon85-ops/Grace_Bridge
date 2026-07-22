import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { UserRole } from '@/types/database';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { signOutAction } from '@/app/[locale]/auth-actions';

export default async function Header({
  role,
  displayName,
}: {
  role: UserRole | 'guest';
  displayName: string | null;
}) {
  const t = await getTranslations('Common');
  const isGuest = role === 'guest';

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🕊️
          </span>
          <span className="text-lg font-bold text-brand-700 dark:text-brand-300">
            {t('appName')}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <DesktopLinks role={role} />
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
          {isGuest ? (
            <Link
              href="/login"
              className="tap-target flex items-center rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t('signIn')}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-[8rem] truncate text-sm text-gray-600 sm:inline dark:text-gray-300">
                {displayName || ''}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="tap-target rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t('signOut')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

async function DesktopLinks({ role }: { role: UserRole | 'guest' }) {
  const t = await getTranslations('Nav');
  const links = [
    { href: '/sermon', label: t('sermon') },
    { href: '/library', label: t('library') },
    { href: '/devotion', label: t('devotion') },
  ];
  return (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {l.label}
        </Link>
      ))}
      {role === 'admin' && (
        <Link
          href="/admin"
          className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-gray-800"
        >
          {t('admin')}
        </Link>
      )}
    </>
  );
}
