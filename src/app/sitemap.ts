import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const PATHS = ['', '/sermon', '/library', '/devotion', '/login', '/signup'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }
  return entries;
}
