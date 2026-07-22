import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentProfile } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    redirect({ href: '/', locale });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          🛠️
        </span>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          관리자
        </h1>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
