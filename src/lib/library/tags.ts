import type { AppLocale } from '@/types/database';

// 콘텐츠 용도 태그. 값(id)은 언어 무관 안정 키, 라벨은 5개 언어.
export interface PurposeTag {
  id: string;
  labels: Record<AppLocale, string>;
}

const L = (
  ko: string,
  en: string,
  fr: string,
  es: string,
  de: string
): Record<AppLocale, string> => ({ ko, en, fr, es, de });

export const PURPOSE_TAGS: PurposeTag[] = [
  { id: 'sermon-aid', labels: L('설교 보조', 'Sermon aid', 'Aide à la prédication', 'Apoyo al sermón', 'Predigthilfe') },
  { id: 'bible-study', labels: L('성경공부용', 'Bible study', 'Étude biblique', 'Estudio bíblico', 'Bibelstudium') },
  { id: 'new-family', labels: L('새가족 교육', 'New believers', 'Nouveaux venus', 'Nuevos creyentes', 'Neue Gläubige') },
  { id: 'small-group', labels: L('소그룹 인도', 'Small group', 'Petit groupe', 'Grupo pequeño', 'Kleingruppe') },
  { id: 'sunday-school', labels: L('주일학교', 'Sunday school', 'École du dimanche', 'Escuela dominical', 'Sonntagsschule') },
];

export const PURPOSE_TAG_IDS = PURPOSE_TAGS.map((t) => t.id) as [string, ...string[]];

export function purposeLabel(id: string, locale: AppLocale): string {
  const tag = PURPOSE_TAGS.find((t) => t.id === id);
  return tag?.labels[locale] ?? tag?.labels.ko ?? id;
}
