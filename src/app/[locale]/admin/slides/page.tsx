'use client';

import { useState } from 'react';
import ContentForm from '@/components/admin/ContentForm';
import { BIBLE_BOOKS, getBook } from '@/lib/bible/books';
import type { ContentInput } from '@/lib/content/schema';

type Slide = { title: string; body: string; note?: string };
type Mode = 'A' | 'B';

const AUDIENCE_OPTIONS = [
  { id: 'adult', label: '성인 일반' },
  { id: 'newbeliever', label: '새가족·초신자' },
  { id: 'youth', label: '청소년' },
] as const;

export default function AdminSlidesPage() {
  const [mode, setMode] = useState<Mode>('A');
  const [book, setBook] = useState('genesis');
  const [audience, setAudience] = useState<'adult' | 'newbeliever' | 'youth'>('adult');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState('ko');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<Slide[] | null>(null);

  async function generate() {
    setError('');
    if (mode === 'B' && !topic.trim()) {
      setError('주제를 입력하세요.');
      return;
    }
    setLoading(true);
    setGenerated(null);
    try {
      const res = await fetch('/api/admin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, book, audience, topic, count, language }),
      });
      const json = await res.json();
      if (res.ok && Array.isArray(json.slides)) {
        setGenerated(json.slides);
      } else {
        setError('생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch {
      setError('생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const input =
    'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base dark:border-gray-700 dark:bg-transparent';
  const labelC = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200';

  if (generated) {
    const title =
      mode === 'A'
        ? `${getBook(book)?.names.ko ?? ''} 한눈에 보기`
        : topic;
    const initial: Partial<ContentInput> = {
      type: 'slide',
      title,
      book: mode === 'A' ? book : '',
      language: language as ContentInput['language'],
      audience: 'all',
      slide_json: { design: 'modern', slides: generated },
    };
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            생성된 슬라이드 검수·편집
          </h2>
          <button
            onClick={() => setGenerated(null)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
          >
            ← 다시 생성
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          5층 구조(한눈에 보기 · 역사적 배경 · 성경 흐름 · 신학적 핵심 · 적용과 나눔)로
          생성되었습니다. 검토·수정 후 <b>게시</b>하면 검수 표기와 함께 자료실에
          등록됩니다.
        </p>
        <ContentForm initial={initial} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
        AI 슬라이드 생성기
      </h2>
      <p className="mb-5 text-sm text-gray-500">
        성경 책별(5층 구조) 또는 공통 주제 자료의 초안을 생성합니다. 생성물은
        반드시 검수·편집 후 게시됩니다.
      </p>

      {/* 모드 선택 */}
      <div className="mb-5 grid grid-cols-2 gap-2">
        {(
          [
            { id: 'A', label: '성경 책별 자료', desc: '한 권 통독 개관 (5층 구조)' },
            { id: 'B', label: '공통 주제 자료', desc: '신구약 중간사 등 주제' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-xl border p-3 text-left transition ${
              mode === m.id
                ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/30'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              {m.label}
            </span>
            <span className="block text-xs text-gray-500">{m.desc}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {mode === 'A' ? (
          <>
            <div>
              <label className={labelC}>성경 (책)</label>
              <select
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className={input}
              >
                {BIBLE_BOOKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.names.ko}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelC}>대상 수준</label>
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as 'adult' | 'newbeliever' | 'youth')
                }
                className={input}
              >
                {AUDIENCE_OPTIONS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className={labelC}>주제</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 신구약 중간사, 성찬과 세례 정리, 성경 연대표"
              className={input}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelC}>매수 {mode === 'A' && '(권장 8~12)'}</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={input}
            >
              {[8, 10, 12, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}장
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelC}>언어</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={input}
            >
              {['ko', 'en', 'fr', 'es', 'de'].map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? '생성 중...' : '초안 생성'}
        </button>
      </div>
    </div>
  );
}
