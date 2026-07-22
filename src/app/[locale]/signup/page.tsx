'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import GoogleButton from '@/components/GoogleButton';

type Role = 'pastor' | 'member';

export default function SignupPage() {
  const t = useTranslations('Auth');
  const c = useTranslations('Common');
  const e = useTranslations('Errors');
  const locale = useLocale();

  const [role, setRole] = useState<Role>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}`,
        data: {
          display_name: displayName,
          role,
          church_name: role === 'pastor' ? churchName : null,
          position: role === 'pastor' ? position : null,
          locale,
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message || e('generic'));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-4xl" aria-hidden>
          ✉️
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {t('signupSuccess')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t('checkEmail')}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {c('signIn')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {t('signupTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role selector */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('roleSelect')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(['member', 'pastor'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`tap-target rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === r
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
                    : 'border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {r === 'pastor' ? t('rolePastor') : t('roleMember')}
              </button>
            ))}
          </div>
        </div>

        <Field label={t('displayName')}>
          <input
            type="text"
            required
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            className="input"
            autoComplete="name"
          />
        </Field>

        {role === 'pastor' && (
          <>
            <Field label={t('churchName')}>
              <input
                type="text"
                required
                value={churchName}
                onChange={(ev) => setChurchName(ev.target.value)}
                className="input"
              />
            </Field>
            <Field label={t('position')}>
              <input
                type="text"
                value={position}
                onChange={(ev) => setPosition(ev.target.value)}
                className="input"
              />
            </Field>
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
              {t('pastorNote')}
            </p>
          </>
        )}

        <Field label={t('email')}>
          <input
            type="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="input"
            autoComplete="email"
          />
        </Field>
        <Field label={t('password')}>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="input"
            autoComplete="new-password"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tap-target w-full rounded-xl bg-brand-600 px-4 py-3 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? c('loading') : c('signUp')}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs uppercase text-gray-400">
          {t('orContinueWith')}
        </span>
        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>
      <GoogleButton label={t('googleSignIn')} locale={locale} />

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-semibold text-brand-600">
          {c('signIn')}
        </Link>
      </p>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(209 213 219);
          padding: 0.75rem 1rem;
          font-size: 16px;
          background: transparent;
          min-height: 44px;
        }
        .input:focus { outline: 2px solid rgb(51 118 246); outline-offset: 1px; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
      {children}
    </label>
  );
}
