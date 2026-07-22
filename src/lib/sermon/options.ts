import type { AppLocale } from '@/types/database';

// 설교 입력 폼의 선택지 데이터. 라벨은 5개 언어로 제공됩니다.
// 값(id)은 언어와 무관한 안정적 키이며, AI 프롬프트에도 이 의미가 전달됩니다.

export interface Option {
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

/** 1. 절기/상황 */
export const OCCASIONS: Option[] = [
  { id: 'new-year', labels: L('신년', 'New Year', 'Nouvel An', 'Año Nuevo', 'Neujahr') },
  { id: 'lent', labels: L('사순절', 'Lent', 'Carême', 'Cuaresma', 'Fastenzeit') },
  { id: 'easter', labels: L('부활절', 'Easter', 'Pâques', 'Pascua', 'Ostern') },
  { id: 'pentecost', labels: L('성령강림절', 'Pentecost', 'Pentecôte', 'Pentecostés', 'Pfingsten') },
  { id: 'thanksgiving', labels: L('추수감사절', 'Thanksgiving', 'Action de grâce', 'Acción de Gracias', 'Erntedankfest') },
  { id: 'advent', labels: L('대림절', 'Advent', 'Avent', 'Adviento', 'Advent') },
  { id: 'christmas', labels: L('성탄절', 'Christmas', 'Noël', 'Navidad', 'Weihnachten') },
  { id: 'revival', labels: L('부흥회', 'Revival', 'Réveil', 'Avivamiento', 'Erweckung') },
  { id: 'mission', labels: L('선교', 'Mission', 'Mission', 'Misión', 'Mission') },
  { id: 'general', labels: L('일반 주일', 'General Sunday', 'Dimanche ordinaire', 'Domingo ordinario', 'Gewöhnlicher Sonntag') },
];

/** 2. 예배/모임 종류 */
export const SERVICE_TYPES: Option[] = [
  { id: 'sunday-main', labels: L('주일 낮예배', 'Sunday Morning', 'Culte du dimanche matin', 'Culto dominical matutino', 'Sonntags-Hauptgottesdienst') },
  { id: 'sunday-evening', labels: L('주일 오후예배', 'Sunday Evening', 'Culte du dimanche soir', 'Culto dominical vespertino', 'Sonntagabendgottesdienst') },
  { id: 'dawn', labels: L('새벽기도', 'Dawn Prayer', 'Prière de l\'aube', 'Oración del alba', 'Frühgebet') },
  { id: 'youth', labels: L('청년부', 'Youth Group', 'Groupe de jeunes', 'Grupo de jóvenes', 'Jugendgruppe') },
  { id: 'senior', labels: L('장년부', 'Senior Group', 'Groupe d\'adultes', 'Grupo de adultos mayores', 'Erwachsenengruppe') },
  { id: 'district', labels: L('구역예배', 'District Meeting', 'Réunion de quartier', 'Reunión de distrito', 'Bezirksgottesdienst') },
  { id: 'ordination', labels: L('임직식', 'Ordination', 'Ordination', 'Ordenación', 'Ordination') },
  { id: 'wedding', labels: L('결혼식', 'Wedding', 'Mariage', 'Boda', 'Hochzeit') },
  { id: 'funeral', labels: L('장례 예배', 'Funeral', 'Funérailles', 'Funeral', 'Trauerfeier') },
  { id: 'weekday', labels: L('평일 예배', 'Weekday Service', 'Culte en semaine', 'Culto entre semana', 'Wochengottesdienst') },
];

/** 3-1. 대상 연령대 */
export const AGE_GROUPS: Option[] = [
  { id: 'infant', labels: L('영유아', 'Infants', 'Tout-petits', 'Bebés', 'Kleinkinder') },
  { id: 'child', labels: L('어린이', 'Children', 'Enfants', 'Niños', 'Kinder') },
  { id: 'youth', labels: L('청소년', 'Teens', 'Adolescents', 'Adolescentes', 'Jugendliche') },
  { id: 'young-adult', labels: L('청년', 'Young Adults', 'Jeunes adultes', 'Jóvenes adultos', 'Junge Erwachsene') },
  { id: 'adult', labels: L('장년', 'Adults', 'Adultes', 'Adultos', 'Erwachsene') },
  { id: 'all-ages', labels: L('전 연령', 'All Ages', 'Tous âges', 'Todas las edades', 'Alle Altersgruppen') },
];

/** 3-2. 규모 */
export const CONGREGATION_SIZES: Option[] = [
  { id: 'small', labels: L('소그룹', 'Small', 'Petit', 'Pequeño', 'Klein') },
  { id: 'medium', labels: L('중간', 'Medium', 'Moyen', 'Mediano', 'Mittel') },
  { id: 'large', labels: L('대규모', 'Large', 'Grand', 'Grande', 'Groß') },
];

/** 3-3. 신앙 성숙도 */
export const MATURITY: Option[] = [
  { id: 'seekers', labels: L('이제 믿음을 시작', 'New Seekers', 'Nouveaux venus', 'Nuevos en la fe', 'Suchende') },
  { id: 'believers', labels: L('기존 신자 중심', 'Established Believers', 'Croyants confirmés', 'Creyentes establecidos', 'Gläubige') },
  { id: 'mixed', labels: L('혼합', 'Mixed', 'Mixte', 'Mixto', 'Gemischt') },
];

/** 4. 분량 (분) — 한국어 기준 분당 약 250~300자 */
export const LENGTHS: Option[] = [
  { id: '10', labels: L('10분', '10 min', '10 min', '10 min', '10 Min') },
  { id: '20', labels: L('20분', '20 min', '20 min', '20 min', '20 Min') },
  { id: '30', labels: L('30분', '30 min', '30 min', '30 min', '30 Min') },
  { id: '40', labels: L('40분', '40 min', '40 min', '40 min', '40 Min') },
];

/** 6. 설교 스타일 */
export const STYLES: Option[] = [
  { id: 'expository', labels: L('강해 설교', 'Expository', 'Homilétique', 'Expositiva', 'Auslegend') },
  { id: 'topical', labels: L('주제 설교', 'Topical', 'Thématique', 'Temática', 'Thematisch') },
  { id: 'textual', labels: L('본문 설교', 'Textual', 'Textuelle', 'Textual', 'Textuell') },
  { id: 'narrative', labels: L('이야기식 설교', 'Narrative', 'Narrative', 'Narrativa', 'Erzählend') },
];

/** 출력 언어 */
export const OUTPUT_LANGUAGES: Option[] = [
  { id: 'ko', labels: L('한국어', 'Korean', 'Coréen', 'Coreano', 'Koreanisch') },
  { id: 'en', labels: L('영어', 'English', 'Anglais', 'Inglés', 'Englisch') },
  { id: 'fr', labels: L('프랑스어', 'French', 'Français', 'Francés', 'Französisch') },
  { id: 'es', labels: L('스페인어', 'Spanish', 'Espagnol', 'Español', 'Spanisch') },
  { id: 'de', labels: L('독일어', 'German', 'Allemand', 'Alemán', 'Deutsch') },
];

export function labelFor(option: Option | undefined, locale: AppLocale): string {
  return option?.labels[locale] ?? option?.labels.ko ?? '';
}

export function findLabel(
  list: Option[],
  id: string | undefined,
  locale: AppLocale
): string {
  if (!id) return '';
  return labelFor(list.find((o) => o.id === id), locale);
}

/** AI 프롬프트에 넣을 영어 의미(언어 무관 설명용) */
export function optionMeaning(list: Option[], id: string | undefined): string {
  if (!id) return '';
  return list.find((o) => o.id === id)?.labels.en ?? id;
}
