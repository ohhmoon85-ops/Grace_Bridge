import type { SermonInput } from './schema';
import {
  OCCASIONS,
  SERVICE_TYPES,
  AGE_GROUPS,
  CONGREGATION_SIZES,
  MATURITY,
  STYLES,
  optionMeaning,
} from './options';

const LANGUAGE_NAMES: Record<string, string> = {
  ko: 'Korean (한국어)',
  en: 'English',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  de: 'German (Deutsch)',
};

// 인용 시 표기 기준이 되는 표준 역본
const BIBLE_VERSIONS: Record<string, string> = {
  ko: '개역개정',
  en: 'NIV or ESV',
  fr: 'Louis Segond',
  es: 'Reina-Valera',
  de: 'Luther Bibel',
};

// 분당 대략 단어/글자 수 → 총 목표 분량
function lengthGuidance(length: string, lang: string): string {
  const minutes = Number(length);
  if (lang === 'ko') {
    const chars = minutes * 275;
    return `약 ${minutes}분 분량 (한국어 기준 약 ${chars.toLocaleString()}자, 분당 250~300자 기준)`;
  }
  const words = minutes * 130;
  return `about ${minutes} minutes (~${words.toLocaleString()} words, ~130 words/min)`;
}

export function buildSystemPrompt(lang: string): string {
  const version = BIBLE_VERSIONS[lang] ?? 'a standard translation';
  return `You are a careful, seasoned assistant that helps Christian pastors prepare sermons. You write in the mainstream tradition of the Korean Protestant church while remaining broadly ecumenical.

Follow these rules strictly:

1. SCRIPTURE
- When citing Scripture, follow the notation/wording conventions of ${version} for the output language.
- To avoid copyright problems, DO NOT quote long passages verbatim. Prefer to summarize and reference chapter:verse, and keep any direct quotation short (a phrase or a single verse). Paraphrase longer passages in your own words.

2. THEOLOGICAL POSTURE
- Stay within mainstream evangelical/Reformed Protestant interpretation. Avoid fringe or extreme interpretations.
- Do NOT attack, disparage, or single out any particular denomination or church. Do NOT praise or promote any one denomination over others.
- Avoid partisan political provocation or endorsing political parties/figures.

3. ILLUSTRATIONS (매우 중요)
- Include AT LEAST TWO concrete real-life illustrations/examples: one historical, one everyday, and where helpful one applicational.
- For real, named people, use ONLY well-known, verifiable facts. If a story's source is uncertain or you are not confident it is factual, clearly mark it as a "가상의 예화 / fictional illustration" (in the output language) instead of presenting it as fact.

4. TONE
- Warm, pastoral, encouraging. Suitable to be read aloud from the pulpit.

5. OUTPUT LANGUAGE
- Write the ENTIRE response in ${LANGUAGE_NAMES[lang] ?? 'the requested language'}.

Always produce clean Markdown with the exact section headings requested by the user.`;
}

function refineInstruction(refine?: string): string {
  switch (refine) {
    case 'tone':
      return '\n\nREVISION: Regenerate with a warmer, gentler pastoral tone.';
    case 'concise':
      return '\n\nREVISION: Regenerate more concisely — tighten the prose while keeping the structure.';
    case 'different':
      return '\n\nREVISION: Regenerate using different illustrations/examples than a typical first draft.';
    default:
      return '';
  }
}

export function buildUserPrompt(input: SermonInput): string {
  const lang = input.outputLanguage;
  const scriptures = input.scriptures
    .map((s) => {
      if (s.custom && s.custom.trim()) return s.custom.trim();
      return `${s.book} ${s.ref}`.trim();
    })
    .filter(Boolean)
    .join('; ');

  const occasion =
    input.occasionCustom?.trim() ||
    optionMeaning(OCCASIONS, input.occasion);

  const sections = input.summaryMode
    ? `Produce a SHORT SUMMARY PREVIEW only (this is for a lay member preview, not a full sermon). Use these Markdown sections:
## 제목 후보 (Title options)
- three candidate titles
## 개요 (Outline)
- introduction, 2 main points, conclusion — one line each
## 핵심 메시지 (Key message)
- one short paragraph`
    : `Produce a COMPLETE sermon draft with these Markdown sections, in this order:
## 제목 후보 (Title options)
- exactly three candidate titles as a bullet list
## 개요 (Outline)
- introduction → 2-3 main points → conclusion
## 설교 본문 (Full sermon)
- the full manuscript, matching the requested length
## 예화 (Illustrations)
- at least two illustrations (mark fictional ones clearly)
## 적용 질문 (Application questions)
- exactly three questions suitable for small-group discussion
## 마침 기도 (Closing prayer)
- a short closing prayer
## 요약 (One-page summary)
- a concise A5 one-page summary of the sermon`;

  return `Please prepare a sermon based on the following.

- Occasion/Season: ${occasion}
- Service/Gathering: ${optionMeaning(SERVICE_TYPES, input.serviceType)}
- Audience age group: ${optionMeaning(AGE_GROUPS, input.ageGroup)}
- Congregation size: ${optionMeaning(CONGREGATION_SIZES, input.size)}
- Spiritual maturity: ${optionMeaning(MATURITY, input.maturity)}
- Length: ${lengthGuidance(input.length, lang)}
- Scripture passage(s): ${scriptures}
- Sermon style: ${optionMeaning(STYLES, input.style)}
${input.extras?.trim() ? `- Additional requests: ${input.extras.trim()}` : ''}

${sections}

Keep the section HEADINGS exactly as given (the "## ..." lines), but write all content in ${LANGUAGE_NAMES[lang]}.${refineInstruction(input.refine)}`;
}
