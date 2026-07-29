'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';

const POSITION_KEYS = [
  'positionSenior',
  'positionAssociate',
  'positionMinister',
  'positionMissionary',
  'positionLay',
  'positionOther',
] as const;

export default function SignupPage() {
  const t = useTranslations('Auth');
  const c = useTranslations('Common');
  const e = useTranslations('Errors');
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [position, setPosition] = useState<string>(POSITION_KEYS[0]);
  const [country, setCountry] = useState('');
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
          app_name: 'grace-bridge',
          display_name: displayName,
          // 목회자 전용 서비스 — 항상 pastor 로 가입, 관리자 승인 전 pending
          role: 'pastor',
          church_name: churchName,
          position: t(position),
          country,
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
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        {t('signupTitle')}
      </h1>
      <p className="mb-6 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
        {t('pastorSignupNote')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <select
            value={position}
            onChange={(ev) => setPosition(ev.target.value)}
            className="input"
          >
            {POSITION_KEYS.map((k) => (
              <option key={k} value={k}>
                {t(k)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t('country')}>
          <input
            type="text"
            value={country}
            onChange={(ev) => setCountry(ev.target.value)}
            className="input"
            autoComplete="country-name"
          />
        </Field>

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
