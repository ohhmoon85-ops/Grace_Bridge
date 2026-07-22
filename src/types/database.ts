// Application-level TypeScript types mirroring the Supabase schema.
// See supabase/schema.sql for the canonical definitions.

export type UserRole = 'admin' | 'pastor' | 'member' | 'guest';
export type ContentType = 'slide' | 'video' | 'pdf';
export type DevotionalStatus = 'draft' | 'approved' | 'published';
export type AppLocale = 'ko' | 'en' | 'fr' | 'es' | 'de';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  church_name: string | null;
  position: string | null;
  locale: AppLocale;
  approved: boolean;
  created_at: string;
}

export interface Sermon {
  id: string;
  user_id: string;
  title: string;
  inputs_json: Record<string, unknown>;
  content_md: string;
  language: AppLocale;
  created_at: string;
  updated_at: string;
}

export interface SlideData {
  design: 'classic' | 'modern' | 'warm';
  slides: Array<{
    title: string;
    body: string;
    note?: string;
  }>;
}

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description: string | null;
  book: string | null;
  language: AppLocale;
  audience: 'pastor' | 'all';
  slide_json: SlideData | null;
  video_url: string | null;
  file_url: string | null;
  published: boolean;
  view_count: number;
  created_by: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

export interface Devotional {
  id: string;
  date: string;
  verse_ref: string;
  body_md: string;
  language: AppLocale;
  status: DevotionalStatus;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body_md: string;
  language: AppLocale;
  published_at: string | null;
}

export interface UsageLog {
  id: string;
  user_id: string | null;
  action: string;
  meta_json: Record<string, unknown>;
  created_at: string;
}
