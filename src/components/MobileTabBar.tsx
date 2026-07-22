'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { UserRole } from '@/types/database';

export default function MobileTabBar({ role }: { role: UserRole | 'guest' }) {
  const t = useTranslations('Nav');
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: t('home'), icon: '🏠' },
    { href: '/sermon', label: t('sermon'), icon: '✍️' },
    { href: '/library', label: t('library'), icon: '📚' },
    { href: '/devotion', label: t('devotion'), icon: '🙏' },
    { href: '/profile', label: t('profile'), icon: '👤' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-950/95"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((tab) => {
          const active =
            tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`tap-target flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active
                    ? 'text-brand-600'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
