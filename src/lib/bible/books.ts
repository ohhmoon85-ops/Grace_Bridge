import type { AppLocale } from '@/types/database';

export type Testament = 'old' | 'new';

export interface BibleBook {
  id: string; // 안정적 키 (영문 약어)
  testament: Testament;
  names: Record<AppLocale, string>;
}

// [id, testament, ko, en, fr, es, de]
type Row = [string, Testament, string, string, string, string, string];

const ROWS: Row[] = [
  // ── 구약 (Old Testament) ──
  ['genesis', 'old', '창세기', 'Genesis', 'Genèse', 'Génesis', '1. Mose'],
  ['exodus', 'old', '출애굽기', 'Exodus', 'Exode', 'Éxodo', '2. Mose'],
  ['leviticus', 'old', '레위기', 'Leviticus', 'Lévitique', 'Levítico', '3. Mose'],
  ['numbers', 'old', '민수기', 'Numbers', 'Nombres', 'Números', '4. Mose'],
  ['deuteronomy', 'old', '신명기', 'Deuteronomy', 'Deutéronome', 'Deuteronomio', '5. Mose'],
  ['joshua', 'old', '여호수아', 'Joshua', 'Josué', 'Josué', 'Josua'],
  ['judges', 'old', '사사기', 'Judges', 'Juges', 'Jueces', 'Richter'],
  ['ruth', 'old', '룻기', 'Ruth', 'Ruth', 'Rut', 'Rut'],
  ['1samuel', 'old', '사무엘상', '1 Samuel', '1 Samuel', '1 Samuel', '1. Samuel'],
  ['2samuel', 'old', '사무엘하', '2 Samuel', '2 Samuel', '2 Samuel', '2. Samuel'],
  ['1kings', 'old', '열왕기상', '1 Kings', '1 Rois', '1 Reyes', '1. Könige'],
  ['2kings', 'old', '열왕기하', '2 Kings', '2 Rois', '2 Reyes', '2. Könige'],
  ['1chronicles', 'old', '역대상', '1 Chronicles', '1 Chroniques', '1 Crónicas', '1. Chronik'],
  ['2chronicles', 'old', '역대하', '2 Chronicles', '2 Chroniques', '2 Crónicas', '2. Chronik'],
  ['ezra', 'old', '에스라', 'Ezra', 'Esdras', 'Esdras', 'Esra'],
  ['nehemiah', 'old', '느헤미야', 'Nehemiah', 'Néhémie', 'Nehemías', 'Nehemia'],
  ['esther', 'old', '에스더', 'Esther', 'Esther', 'Ester', 'Ester'],
  ['job', 'old', '욥기', 'Job', 'Job', 'Job', 'Hiob'],
  ['psalms', 'old', '시편', 'Psalms', 'Psaumes', 'Salmos', 'Psalmen'],
  ['proverbs', 'old', '잠언', 'Proverbs', 'Proverbes', 'Proverbios', 'Sprüche'],
  ['ecclesiastes', 'old', '전도서', 'Ecclesiastes', 'Ecclésiaste', 'Eclesiastés', 'Prediger'],
  ['songofsongs', 'old', '아가', 'Song of Songs', 'Cantique des cantiques', 'Cantares', 'Hoheslied'],
  ['isaiah', 'old', '이사야', 'Isaiah', 'Ésaïe', 'Isaías', 'Jesaja'],
  ['jeremiah', 'old', '예레미야', 'Jeremiah', 'Jérémie', 'Jeremías', 'Jeremia'],
  ['lamentations', 'old', '예레미야애가', 'Lamentations', 'Lamentations', 'Lamentaciones', 'Klagelieder'],
  ['ezekiel', 'old', '에스겔', 'Ezekiel', 'Ézéchiel', 'Ezequiel', 'Hesekiel'],
  ['daniel', 'old', '다니엘', 'Daniel', 'Daniel', 'Daniel', 'Daniel'],
  ['hosea', 'old', '호세아', 'Hosea', 'Osée', 'Oseas', 'Hosea'],
  ['joel', 'old', '요엘', 'Joel', 'Joël', 'Joel', 'Joel'],
  ['amos', 'old', '아모스', 'Amos', 'Amos', 'Amós', 'Amos'],
  ['obadiah', 'old', '오바댜', 'Obadiah', 'Abdias', 'Abdías', 'Obadja'],
  ['jonah', 'old', '요나', 'Jonah', 'Jonas', 'Jonás', 'Jona'],
  ['micah', 'old', '미가', 'Micah', 'Michée', 'Miqueas', 'Micha'],
  ['nahum', 'old', '나훔', 'Nahum', 'Nahum', 'Nahúm', 'Nahum'],
  ['habakkuk', 'old', '하박국', 'Habakkuk', 'Habacuc', 'Habacuc', 'Habakuk'],
  ['zephaniah', 'old', '스바냐', 'Zephaniah', 'Sophonie', 'Sofonías', 'Zefanja'],
  ['haggai', 'old', '학개', 'Haggai', 'Aggée', 'Hageo', 'Haggai'],
  ['zechariah', 'old', '스가랴', 'Zechariah', 'Zacharie', 'Zacarías', 'Sacharja'],
  ['malachi', 'old', '말라기', 'Malachi', 'Malachie', 'Malaquías', 'Maleachi'],
  // ── 신약 (New Testament) ──
  ['matthew', 'new', '마태복음', 'Matthew', 'Matthieu', 'Mateo', 'Matthäus'],
  ['mark', 'new', '마가복음', 'Mark', 'Marc', 'Marcos', 'Markus'],
  ['luke', 'new', '누가복음', 'Luke', 'Luc', 'Lucas', 'Lukas'],
  ['john', 'new', '요한복음', 'John', 'Jean', 'Juan', 'Johannes'],
  ['acts', 'new', '사도행전', 'Acts', 'Actes', 'Hechos', 'Apostelgeschichte'],
  ['romans', 'new', '로마서', 'Romans', 'Romains', 'Romanos', 'Römer'],
  ['1corinthians', 'new', '고린도전서', '1 Corinthians', '1 Corinthiens', '1 Corintios', '1. Korinther'],
  ['2corinthians', 'new', '고린도후서', '2 Corinthians', '2 Corinthiens', '2 Corintios', '2. Korinther'],
  ['galatians', 'new', '갈라디아서', 'Galatians', 'Galates', 'Gálatas', 'Galater'],
  ['ephesians', 'new', '에베소서', 'Ephesians', 'Éphésiens', 'Efesios', 'Epheser'],
  ['philippians', 'new', '빌립보서', 'Philippians', 'Philippiens', 'Filipenses', 'Philipper'],
  ['colossians', 'new', '골로새서', 'Colossians', 'Colossiens', 'Colosenses', 'Kolosser'],
  ['1thessalonians', 'new', '데살로니가전서', '1 Thessalonians', '1 Thessaloniciens', '1 Tesalonicenses', '1. Thessalonicher'],
  ['2thessalonians', 'new', '데살로니가후서', '2 Thessalonians', '2 Thessaloniciens', '2 Tesalonicenses', '2. Thessalonicher'],
  ['1timothy', 'new', '디모데전서', '1 Timothy', '1 Timothée', '1 Timoteo', '1. Timotheus'],
  ['2timothy', 'new', '디모데후서', '2 Timothy', '2 Timothée', '2 Timoteo', '2. Timotheus'],
  ['titus', 'new', '디도서', 'Titus', 'Tite', 'Tito', 'Titus'],
  ['philemon', 'new', '빌레몬서', 'Philemon', 'Philémon', 'Filemón', 'Philemon'],
  ['hebrews', 'new', '히브리서', 'Hebrews', 'Hébreux', 'Hebreos', 'Hebräer'],
  ['james', 'new', '야고보서', 'James', 'Jacques', 'Santiago', 'Jakobus'],
  ['1peter', 'new', '베드로전서', '1 Peter', '1 Pierre', '1 Pedro', '1. Petrus'],
  ['2peter', 'new', '베드로후서', '2 Peter', '2 Pierre', '2 Pedro', '2. Petrus'],
  ['1john', 'new', '요한일서', '1 John', '1 Jean', '1 Juan', '1. Johannes'],
  ['2john', 'new', '요한이서', '2 John', '2 Jean', '2 Juan', '2. Johannes'],
  ['3john', 'new', '요한삼서', '3 John', '3 Jean', '3 Juan', '3. Johannes'],
  ['jude', 'new', '유다서', 'Jude', 'Jude', 'Judas', 'Judas'],
  ['revelation', 'new', '요한계시록', 'Revelation', 'Apocalypse', 'Apocalipsis', 'Offenbarung'],
];

export const BIBLE_BOOKS: BibleBook[] = ROWS.map(([id, testament, ko, en, fr, es, de]) => ({
  id,
  testament,
  names: { ko, en, fr, es, de },
}));

export const OLD_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === 'old');
export const NEW_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === 'new');

export function bookName(id: string | null | undefined, locale: AppLocale): string {
  if (!id) return '';
  const book = BIBLE_BOOKS.find((b) => b.id === id);
  return book?.names[locale] ?? book?.names.ko ?? id;
}

export function getBook(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}
