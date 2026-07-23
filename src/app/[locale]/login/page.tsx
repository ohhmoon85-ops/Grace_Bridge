'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const c = useTranslations('Common');
  const e = useTranslations('Errors');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(evt: React.FormEvent) {
    evt.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(e('invalidCredentials'));
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {t('loginTitle')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="input"
            autoComplete="current-password"
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
          {loading ? c('loading') : c('signIn')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
        {t('noAccount')}{' '}
        <Link href="/signup" className="font-semibold text-brand-600">
          {c('signUp')}
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
