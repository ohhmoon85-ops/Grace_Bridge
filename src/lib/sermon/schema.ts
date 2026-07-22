import { z } from 'zod';

export const scriptureRefSchema = z.object({
  book: z.string().max(60),
  ref: z.string().max(60),
  custom: z.string().max(200).optional(),
});

export const sermonInputSchema = z.object({
  occasion: z.string().max(60),
  occasionCustom: z.string().max(200).optional().default(''),
  serviceType: z.string().max(60),
  ageGroup: z.string().max(60),
  size: z.string().max(60),
  maturity: z.string().max(60),
  length: z.enum(['10', '20', '30', '40']),
  scriptures: z.array(scriptureRefSchema).min(1).max(6),
  style: z.string().max(60),
  extras: z.string().max(1000).optional().default(''),
  outputLanguage: z.enum(['ko', 'en', 'fr', 'es', 'de']),
  // 재생성 지시 (선택)
  refine: z.enum(['tone', 'concise', 'different']).optional(),
  // 성도(member) 미리보기: 요약 모드
  summaryMode: z.boolean().optional().default(false),
});

export type SermonInput = z.infer<typeof sermonInputSchema>;
export type ScriptureRef = z.infer<typeof scriptureRefSchema>;
