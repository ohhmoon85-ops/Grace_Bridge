'use client';

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/types/database';
import {
  OCCASIONS,
  SERVICE_TYPES,
  AGE_GROUPS,
  CONGREGATION_SIZES,
  MATURITY,
  LENGTHS,
  STYLES,
  OUTPUT_LANGUAGES,
  labelFor,
  type Option,
} from '@/lib/sermon/options';
import Markdown from '@/components/Markdown';
import { exportText, exportDocx, exportPdf } from '@/lib/sermon/export';

interface ScriptureItem {
  book: string;
  ref: string;
  custom: string;
}

type Payload = {
  occasion: string;
  occasionCustom: string;
  serviceType: string;
  ageGroup: string;
  size: string;
  maturity: string;
  length: '10' | '20' | '30' | '40';
  scriptures: { book: string; ref: string; custom?: string }[];
  style: string;
  extras: string;
  outputLanguage: AppLocale;
  refine?: 'tone' | 'concise' | 'different';
  summaryMode?: boolean;
};

const STEP_COUNT = 6;

function extractTitle(md: string): string {
  const lines = md.split('\n');
  let inTitleSection = false;
  for (const line of lines) {
    if (/^##\s/.test(line)) {
      inTitleSection = /제목|title|titre|título|titel/i.test(line);
      continue;
    }
    if (inTitleSection) {
      const m = line.match(/^\s*[-*\d.]+\s*(.+)/);
      if (m) return m[1].replace(/[*_`]/g, '').trim().slice(0, 200);
    }
  }
  const h = lines.find((l) => l.trim() && !l.startsWith('#'));
  return (h ?? '').replace(/[*_`#]/g, '').trim().slice(0, 200);
}

export default function SermonStudio({ canFull }: { canFull: boolean }) {
  const t = useTranslations('Sermon');
  const c = useTranslations('Common');
  const locale = useLocale() as AppLocale;

  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState('');
  const [occasionCustom, setOccasionCustom] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [size, setSize] = useState('');
  const [maturity, setMaturity] = useState('');
  const [length, setLength] = useState<'10' | '20' | '30' | '40'>('20');
  const [scriptures, setScriptures] = useState<ScriptureItem[]>([]);
  const [draftScripture, setDraftScripture] = useState<ScriptureItem>({
    book: '',
    ref: '',
    custom: '',
  });
  const [style, setStyle] = useState('');
  const [extras, setExtras] = useState('');
  const [outputLanguage, setOutputLanguage] = useState<AppLocale>(locale);

  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const lastPayload = useRef<Payload | null>(null);

  function addScripture() {
    if (!draftScripture.book && !draftScripture.custom.trim()) return;
    setScriptures((prev) => [...prev, draftScripture]);
    setDraftScripture({ book: '', ref: '', custom: '' });
  }

  function buildPayload(refine?: Payload['refine']): Payload {
    return {
      occasion,
      occasionCustom,
      serviceType,
      ageGroup,
      size,
      maturity,
      length,
      scriptures: scriptures.map((s) => ({
        book: s.book,
        ref: s.ref,
        custom: s.custom || undefined,
      })),
      style,
      extras,
      outputLanguage,
      summaryMode: !canFull,
      refine,
    };
  }

  async function generate(refine?: Payload['refine']) {
    if (scriptures.length === 0) {
      setError(t('needScripture'));
      return;
    }
    setError('');
    setOutput('');
    setSavedId(null);
    setGenerating(true);
    setEditMode(false);

    const payload = buildPayload(refine);
    lastPayload.current = payload;
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/sermon/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (res.status === 429) {
        setError(t('limitReached'));
        setGenerating(false);
        return;
      }
      if (res.status === 401) {
        setError(t('loginRequired'));
        setGenerating(false);
        return;
      }
      if (!res.ok || !res.body) {
        setError(t('generateError'));
        setGenerating(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() ?? '';
        for (const block of blocks) {
          let event = 'message';
          let data = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) data += line.slice(5).trim();
          }
          if (!data) continue;
          const parsed = JSON.parse(data);
          if (event === 'delta' && parsed.text) {
            acc += parsed.text;
            setOutput(acc);
          } else if (event === 'error') {
            setError(t('generateError'));
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError(t('generateError'));
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setGenerating(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/sermon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: extractTitle(output),
          inputs_json: lastPayload.current ?? {},
          content_md: output,
          language: outputLanguage,
        }),
      });
      const json = await res.json();
      if (res.ok) setSavedId(json.id);
    } finally {
      setSaving(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // 결과 화면
  if (output || generating) {
    const title = extractTitle(output) || t('untitled');
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setOutput('');
              setError('');
            }}
            className="tap-target rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
          >
            ← {t('newSermon')}
          </button>
          {generating ? (
            <button
              onClick={stop}
              className="tap-target rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
            >
              {t('stop')}
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditMode((v) => !v)}
                className="tap-target rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
              >
                {editMode ? t('preview') : t('edit')}
              </button>
              <button
                onClick={copy}
                className="tap-target rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
              >
                {copied ? t('copied') : t('copy')}
              </button>
              <button
                onClick={save}
                disabled={saving || !!savedId}
                className="tap-target rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savedId ? t('saved') : saving ? t('saving') : t('save')}
              </button>
            </>
          )}
        </div>

        {!generating && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">{t('export')}:</span>
            <button
              onClick={() => exportDocx('sermon', title, output)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
            >
              {t('exportDocx')}
            </button>
            <button
              onClick={() => exportPdf(title, output)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
            >
              {t('exportPdf')}
            </button>
            <button
              onClick={() => exportText('sermon', output)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
            >
              {t('exportText')}
            </button>
            {savedId && (
              <Link
                href={`/sermon/saved/${savedId}`}
                className="rounded-lg border border-brand-300 px-2.5 py-1.5 text-xs text-brand-600"
              >
                {t('open')} →
              </Link>
            )}
          </div>
        )}

        {!generating && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">{t('regenerate')}:</span>
            {(['tone', 'concise', 'different'] as const).map((r) => (
              <button
                key={r}
                onClick={() => generate(r)}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs dark:border-gray-700"
              >
                {r === 'tone'
                  ? t('regenTone')
                  : r === 'concise'
                    ? t('regenConcise')
                    : t('regenDifferent')}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          {editMode ? (
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="min-h-[60vh] w-full resize-y bg-transparent text-sm leading-relaxed focus:outline-none"
            />
          ) : (
            <Markdown content={output || '...'} />
          )}
          {generating && (
            <span className="mt-2 inline-block animate-pulse text-brand-600">
              ▌
            </span>
          )}
        </div>

        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          ⚠️ {t('disclaimer')}
        </p>
      </div>
    );
  }

  // 입력 마법사
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <Link
          href="/sermon/saved"
          className="text-sm font-medium text-brand-600"
        >
          {t('savedSermons')}
        </Link>
      </div>
      {!canFull && (
        <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
          {t('pastorOnly')}
        </p>
      )}

      {/* 진행 표시 */}
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="min-h-[320px]">
        {step === 0 && (
          <StepBlock title={t('occasionLabel')}>
            <OptionGrid
              options={OCCASIONS}
              value={occasion}
              onChange={setOccasion}
              locale={locale}
            />
            <input
              value={occasionCustom}
              onChange={(e) => setOccasionCustom(e.target.value)}
              placeholder={t('occasionCustom')}
              className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-base dark:border-gray-700 dark:bg-transparent"
            />
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock title={t('serviceLabel')}>
            <OptionGrid
              options={SERVICE_TYPES}
              value={serviceType}
              onChange={setServiceType}
              locale={locale}
            />
          </StepBlock>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <StepBlock title={t('ageLabel')}>
              <OptionGrid
                options={AGE_GROUPS}
                value={ageGroup}
                onChange={setAgeGroup}
                locale={locale}
              />
            </StepBlock>
            <StepBlock title={t('sizeLabel')}>
              <OptionGrid
                options={CONGREGATION_SIZES}
                value={size}
                onChange={setSize}
                locale={locale}
              />
            </StepBlock>
            <StepBlock title={t('maturityLabel')}>
              <OptionGrid
                options={MATURITY}
                value={maturity}
                onChange={setMaturity}
                locale={locale}
              />
            </StepBlock>
          </div>
        )}

        {step === 3 && (
          <StepBlock title={t('lengthLabel')}>
            <OptionGrid
              options={LENGTHS}
              value={length}
              onChange={(v) => setLength(v as '10' | '20' | '30' | '40')}
              locale={locale}
            />
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock title={t('scriptureLabel')}>
            <div className="flex gap-2">
              <input
                value={draftScripture.book}
                onChange={(e) =>
                  setDraftScripture((d) => ({ ...d, book: e.target.value }))
                }
                placeholder={t('scriptureBook')}
                className="w-2/5 rounded-xl border border-gray-300 px-3 py-3 text-base dark:border-gray-700 dark:bg-transparent"
              />
              <input
                value={draftScripture.ref}
                onChange={(e) =>
                  setDraftScripture((d) => ({ ...d, ref: e.target.value }))
                }
                placeholder={t('scriptureRef')}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-3 text-base dark:border-gray-700 dark:bg-transparent"
              />
            </div>
            <input
              value={draftScripture.custom}
              onChange={(e) =>
                setDraftScripture((d) => ({ ...d, custom: e.target.value }))
              }
              placeholder={t('scriptureCustom')}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 text-base dark:border-gray-700 dark:bg-transparent"
            />
            <button
              onClick={addScripture}
              className="tap-target mt-2 w-full rounded-xl border border-brand-300 py-2.5 text-sm font-semibold text-brand-600"
            >
              + {t('addScripture')}
            </button>
            {scriptures.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-xs text-gray-500">
                  {t('scriptureAdded')}
                </p>
                <ul className="space-y-1">
                  {scriptures.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800"
                    >
                      <span>{s.custom || `${s.book} ${s.ref}`}</span>
                      <button
                        onClick={() =>
                          setScriptures((prev) =>
                            prev.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </StepBlock>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <StepBlock title={t('styleLabel')}>
              <OptionGrid
                options={STYLES}
                value={style}
                onChange={setStyle}
                locale={locale}
              />
            </StepBlock>
            <StepBlock title={t('outputLangLabel')}>
              <OptionGrid
                options={OUTPUT_LANGUAGES}
                value={outputLanguage}
                onChange={(v) => setOutputLanguage(v as AppLocale)}
                locale={locale}
              />
            </StepBlock>
            <StepBlock title={t('extrasLabel')}>
              <textarea
                value={extras}
                onChange={(e) => setExtras(e.target.value)}
                placeholder={t('extrasPlaceholder')}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-3 text-base dark:border-gray-700 dark:bg-transparent"
              />
            </StepBlock>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="tap-target rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold disabled:opacity-40 dark:border-gray-700"
        >
          {c('back')}
        </button>
        {step < STEP_COUNT - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1))}
            className="tap-target flex-1 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
          >
            {c('next')}
          </button>
        ) : (
          <button
            onClick={() => generate()}
            className="tap-target flex-1 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
          >
            {t('generate')}
          </button>
        )}
      </div>
    </div>
  );
}

function StepBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      {children}
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
  locale,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  locale: AppLocale;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`tap-target rounded-xl border px-3 py-3 text-sm font-medium transition ${
            value === o.id
              ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
              : 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200'
          }`}
        >
          {labelFor(o, locale)}
        </button>
      ))}
    </div>
  );
}
