import type { AppLocale } from '@/types/database';

const L = (
  ko: string,
  en: string,
  fr: string,
  es: string,
  de: string
): Record<AppLocale, string> => ({ ko, en, fr, es, de });

// 성경 책별 자료의 5층 구조 목차
export const LAYERS: { id: string; labels: Record<AppLocale, string> }[] = [
  { id: 'glance', labels: L('한눈에 보기', 'At a glance', 'En un coup d’œil', 'De un vistazo', 'Auf einen Blick') },
  { id: 'history', labels: L('역사적 배경', 'Historical background', 'Contexte historique', 'Contexto histórico', 'Historischer Hintergrund') },
  { id: 'flow', labels: L('성경 흐름', 'Flow of the book', 'Déroulement du livre', 'Recorrido del libro', 'Verlauf des Buches') },
  { id: 'theology', labels: L('신학적 핵심', 'Theological core', 'Cœur théologique', 'Núcleo teológico', 'Theologischer Kern') },
  { id: 'application', labels: L('적용과 나눔', 'Application & sharing', 'Application et partage', 'Aplicación y diálogo', 'Anwendung & Austausch') },
];

// 공통 자료(성경 전체) 예정 슬롯
export const COMMON_SLOTS: { id: string; labels: Record<AppLocale, string> }[] = [
  { id: 'timeline', labels: L('성경 전체 연대표', 'Whole-Bible timeline', 'Chronologie biblique', 'Cronología bíblica', 'Bibel-Zeitleiste') },
  { id: 'intertestament', labels: L('신구약 중간사', 'Intertestamental period', 'Période intertestamentaire', 'Período intertestamentario', 'Zwischentestamentliche Zeit') },
  { id: 'sacraments', labels: L('성찬과 세례 정리', 'Communion & baptism', 'Cène et baptême', 'Cena y bautismo', 'Abendmahl & Taufe') },
  { id: 'people', labels: L('성경 인물 지도', 'Bible people map', 'Carte des personnages', 'Mapa de personajes', 'Bibel-Personenkarte') },
  { id: 'covenant', labels: L('언약사·통사', 'Covenant history overview', 'Histoire de l’alliance', 'Historia del pacto', 'Bundesgeschichte') },
];
