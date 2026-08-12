import { z } from 'zod';
import { PURPOSE_TAG_IDS } from '@/lib/library/tags';

export const slideSchema = z.object({
  title: z.string().max(200),
  body: z.string().max(3000),
  note: z.string().max(1000).optional(),
});

export const slideDataSchema = z.object({
  design: z.enum(['classic', 'modern', 'warm']),
  slides: z.array(slideSchema).max(30),
});

export const contentSchema = z.object({
  type: z.enum(['slide', 'video', 'pdf']),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().default(''),
  book: z.string().max(60).optional().default(''),
  language: z.enum(['ko', 'en', 'fr', 'es', 'de']),
  audience: z.enum(['all', 'pastor']),
  purpose_tags: z.array(z.enum(PURPOSE_TAG_IDS)).max(5).optional().default([]),
  usage_tip: z.string().max(500).optional().default(''),
  slide_json: slideDataSchema.nullable().optional(),
  video_url: z.string().max(500).optional().default(''),
  file_url: z.string().max(500).optional().default(''),
  reviewed_by: z.string().max(120).optional().default(''),
  published: z.boolean().default(false),
});

/** 검수자 기본값 */
export const DEFAULT_REVIEWER = '이성규 목사';

export type ContentInput = z.infer<typeof contentSchema>;

/** DB 저장용: 빈 문자열은 null로 정규화 */
export function normalizeContent(input: ContentInput) {
  return {
    type: input.type,
    title: input.title,
    description: input.description || null,
    book: input.book || null,
    language: input.language,
    audience: input.audience,
    purpose_tags: input.purpose_tags ?? [],
    usage_tip: input.usage_tip || null,
    slide_json: input.type === 'slide' ? (input.slide_json ?? null) : null,
    video_url: input.type === 'video' ? input.video_url || null : null,
    file_url: input.type === 'pdf' ? input.file_url || null : null,
    reviewed_by: input.reviewed_by?.trim() || DEFAULT_REVIEWER,
    published: input.published,
  };
}
