import { defineRouting } from 'next-intl/routing';

export const locales = ['ko', 'en', 'fr', 'es', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});
