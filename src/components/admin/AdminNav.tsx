'use client';

import { Link, usePathname } from '@/i18n/navigation';

const TABS = [
  { href: '/admin', label: '대시보드', exact: true },
  { href: '/admin/members', label: '회원' },
  { href: '/admin/contents', label: '콘텐츠' },
  { href: '/admin/slides', label: 'AI 슬라이드' },
  { href: '/admin/devotionals', label: '묵상' },
  { href: '/admin/announcements', label: '공지' },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 -mx-4 overflow-x-auto border-b border-gray-200 px-4 dark:border-gray-800">
      <ul className="flex min-w-max gap-1">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`inline-block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                  active
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
