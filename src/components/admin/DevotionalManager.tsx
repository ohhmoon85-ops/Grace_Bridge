'use client';

import { useState } from 'react';
import type { Devotional } from '@/types/database';

const STATUS_LABEL: Record<string, string> = {
  draft: '초안',
  approved: '승인됨',
  published: '게시됨',
};
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800',
  approved: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

export default function DevotionalManager({
  initial,
}: {
  initial: Devotional[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [rows, setRows] = useState(initial);

  const [date, setDate] = useState(today);
  const [verseRef, setVerseRef] = useState('');
  const [language, setLanguage] = useState('ko');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'draft' | 'approved' | 'published'>('draft');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function aiDraft() {
    if (!verseRef.trim()) {
      setError('성경 구절을 입력하세요.');
      return;
    }
    setError('');
    setAiLoading(true);
    const res = await fetch('/api/admin/devotionals/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verse_ref: verseRef, language }),
    });
    setAiLoading(false);
    const json = await res.json();
    if (res.ok) setBody(json.body_md ?? '');
    else setError('AI 생성에 실패했습니다.');
  }

  async function create() {
    if (!verseRef.trim() || !body.trim()) {
      setError('성경 구절과 본문을 입력하세요.');
      return;
    }
    setError('');
    setSaving(true);
    const res = await fetch('/api/admin/devotionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        verse_ref: verseRef,
        body_md: body,
        language,
        status,
      }),
    });
    setSaving(false);
    const json = await res.json();
    if (res.ok) {
      setRows((prev) => [
        {
          id: json.id,
          date,
          verse_ref: verseRef,
          body_md: body,
          language: language as Devotional['language'],
          status,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setVerseRef('');
      setBody('');
      setStatus('draft');
    } else {
      setError('저장에 실패했습니다.');
    }
  }

  async function changeStatus(id: string, next: Devotional['status']) {
    setBusy(id);
    const res = await fetch(`/api/admin/devotionals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setBusy(null);
    if (res.ok)
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: next } : r))
      );
  }

  async function del(id: string) {
    if (!confirm('이 묵상글을 삭제할까요?')) return;
    setBusy(id);
    const res = await fetch(`/api/admin/devotionals/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const input =
    'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base dark:border-gray-700 dark:bg-transparent';

  return (
    <div className="space-y-6">
      {/* 작성 폼 */}
      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          새 묵상글
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={input}
          />
          <input
            value={verseRef}
            onChange={(e) => setVerseRef(e.target.value)}
            placeholder="성경 구절 (예: 시편 23:1)"
            className={`${input} col-span-2`}
          />
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
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={aiDraft}
            disabled={aiLoading}
            className="rounded-lg border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-600 disabled:opacity-60"
          >
            {aiLoading ? '생성 중...' : '✨ AI 초안'}
          </button>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as 'draft' | 'approved' | 'published')
            }
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-transparent"
          >
            <option value="draft">초안</option>
            <option value="approved">승인됨</option>
            <option value="published">게시됨</option>
          </select>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="묵상 본문 (마크다운)"
          rows={5}
          className={`${input} mt-3`}
        />
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
        <button
          onClick={create}
          disabled={saving}
          className="mt-3 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* 목록 */}
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            등록된 묵상글이 없습니다.
          </p>
        ) : (
          rows.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {d.date} · {d.verse_ref}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {d.language.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${STATUS_STYLE[d.status]}`}
                  >
                    {STATUS_LABEL[d.status]}
                  </span>
                  {d.status !== 'approved' && d.status !== 'published' && (
                    <button
                      onClick={() => changeStatus(d.id, 'approved')}
                      disabled={busy === d.id}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
                    >
                      승인
                    </button>
                  )}
                  {d.status !== 'published' && (
                    <button
                      onClick={() => changeStatus(d.id, 'published')}
                      disabled={busy === d.id}
                      className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                    >
                      게시
                    </button>
                  )}
                  <button
                    onClick={() => del(d.id)}
                    disabled={busy === d.id}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                {d.body_md}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
