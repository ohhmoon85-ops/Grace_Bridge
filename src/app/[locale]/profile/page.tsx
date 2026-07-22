import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { signOutAction } from '../auth-actions';

export default async function ProfilePage({
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

  const t = await getTranslations('Auth');
  const c = await getTranslations('Common');
  const roles = await getTranslations('Roles');

  const p = profile!;
  const roleLabel =
    p.role === 'pastor' && !p.approved
      ? `${roles('pastor')} (승인 대기)`
      : roles(p.role);

  const rows = [
    { label: t('displayName'), value: p.display_name || '-' },
    { label: t('email'), value: p.email },
    { label: roles('member'), value: roleLabel },
    ...(p.church_name ? [{ label: t('churchName'), value: p.church_name }] : []),
    ...(p.position ? [{ label: t('position'), value: p.position }] : []),
  ];

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl dark:bg-brand-900/40">
          👤
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {p.display_name || p.email}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabel}</p>
        </div>
      </div>

      <dl className="divide-y divide-gray-200 rounded-2xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-4 py-3"
          >
            <dt className="text-sm text-gray-500 dark:text-gray-400">
              {r.label}
            </dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      {p.role === 'pastor' && !p.approved && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {t('pastorNote')}
        </p>
      )}

      <form action={signOutAction} className="mt-8">
        <button
          type="submit"
          className="tap-target w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {c('signOut')}
        </button>
      </form>
    </div>
  );
}
