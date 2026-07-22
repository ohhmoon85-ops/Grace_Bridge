import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getCurrentProfile, effectiveRole } from '@/lib/auth';
import Header from '@/components/Header';
import MobileTabBar from '@/components/MobileTabBar';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}`])
  );
  return {
    metadataBase: new URL(base),
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      siteName: 'GraceBridge',
      locale,
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const profile = await getCurrentProfile();
  const role = effectiveRole(profile);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          // 하이드레이션 전에 테마를 적용해 깜빡임(FOUC)을 방지합니다.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header
              role={role}
              displayName={profile?.display_name ?? null}
            />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <MobileTabBar role={role} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
