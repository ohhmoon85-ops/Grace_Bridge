'use client';

import { useState } from 'react';
import ContentForm from '@/components/admin/ContentForm';
import type { ContentInput } from '@/lib/content/schema';

type Slide = { title: string; body: string; note?: string };

export default function AdminSlidesPage() {
  const [scripture, setScripture] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [count, setCount] = useState(8);
  const [language, setLanguage] = useState('ko');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<Slide[] | null>(null);

  async function generate() {
    setError('');
    if (!scripture.trim() || !topic.trim()) {
      setError('성경 구절과 주제를 입력하세요.');
      return;
    }
    setLoading(true);
    setGenerated(null);
    try {
      const res = await fetch('/api/admin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scripture, topic, audience, count, language }),
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
    const initial: Partial<ContentInput> = {
      type: 'slide',
      title: topic,
      book: '',
      language: language as ContentInput['language'],
      audience: 'all',
      slide_json: { design: 'modern', slides: generated },
    };
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            생성된 슬라이드 편집
          </h2>
          <button
            onClick={() => setGenerated(null)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
          >
            ← 다시 생성
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          내용을 검토·수정한 뒤 저장하면 라이브러리에 등록됩니다.
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
        성경 구절과 주제를 입력하면 슬라이드 초안을 자동으로 생성합니다.
      </p>

      <div className="space-y-4">
        <div>
          <label className={labelC}>성경 구절</label>
          <input
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            placeholder="예: 요한복음 3:16, 시편 23편"
            className={input}
          />
        </div>
        <div>
          <label className={labelC}>주제</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 하나님의 조건 없는 사랑"
            className={input}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelC}>대상 (선택)</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="예: 청년부"
              className={input}
            />
          </div>
          <div>
            <label className={labelC}>매수</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={input}
            >
              {[5, 8, 10, 12, 15, 20].map((n) => (
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
          {loading ? '생성 중...' : '슬라이드 생성'}
        </button>
      </div>
    </div>
  );
}
