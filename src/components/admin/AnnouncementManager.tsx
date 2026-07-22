'use client';

import { useState } from 'react';
import type { Announcement } from '@/types/database';

type Lang = 'en' | 'fr' | 'es' | 'de';
type Trans = Record<Lang, { title: string; body_md: string }>;

const LANGS: Lang[] = ['en', 'fr', 'es', 'de'];

export default function AnnouncementManager({
  initial,
}: {
  initial: Announcement[];
}) {
  const [rows, setRows] = useState(initial);
  const [koTitle, setKoTitle] = useState('');
  const [koBody, setKoBody] = useState('');
  const [trans, setTrans] = useState<Trans | null>(null);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  async function translate() {
    if (!koTitle.trim() || !koBody.trim()) {
      setError('한국어 제목과 본문을 입력하세요.');
      return;
    }
    setError('');
    setTranslating(true);
    const res = await fetch('/api/admin/announcements/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: koTitle, body_md: koBody }),
    });
    setTranslating(false);
    const json = await res.json();
    if (res.ok && json.translations) setTrans(json.translations);
    else setError('번역에 실패했습니다.');
  }

  async function save(publish: boolean) {
    if (!koTitle.trim() || !koBody.trim()) {
      setError('한국어 제목과 본문을 입력하세요.');
      return;
    }
    setError('');
    setSaving(true);
    const items = [
      { language: 'ko' as const, title: koTitle, body_md: koBody },
      ...(trans
        ? LANGS.map((l) => ({
            language: l,
            title: trans[l].title,
            body_md: trans[l].body_md,
          }))
        : []),
    ];
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, publish }),
    });
    setSaving(false);
    if (res.ok) {
      window.location.reload();
    } else {
      setError('저장에 실패했습니다.');
    }
  }

  async function del(id: string) {
    if (!confirm('이 공지를 삭제할까요?')) return;
    setBusy(id);
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
    setBusy(null);
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateTrans(l: Lang, field: 'title' | 'body_md', value: string) {
    setTrans((prev) =>
      prev ? { ...prev, [l]: { ...prev[l], [field]: value } } : prev
    );
  }

  const input =
    'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base dark:border-gray-700 dark:bg-transparent';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          새 공지 (한국어로 작성 후 AI 번역)
        </h3>
        <input
          value={koTitle}
          onChange={(e) => setKoTitle(e.target.value)}
          placeholder="제목 (한국어)"
          className={`${input} mb-2`}
        />
        <textarea
          value={koBody}
          onChange={(e) => setKoBody(e.target.value)}
          placeholder="본문 (마크다운)"
          rows={4}
          className={input}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={translate}
            disabled={translating}
            className="rounded-lg border border-brand-300 px-3 py-2 text-sm font-medium text-brand-600 disabled:opacity-60"
          >
            {translating ? '번역 중...' : '✨ AI 번역 (4개 언어)'}
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-gray-700"
          >
            임시저장
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? '저장 중...' : '게시'}
          </button>
        </div>

        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {trans && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-gray-500">
              번역 결과 (수정 가능) — 게시 시 5개 언어로 등록됩니다.
            </p>
            {LANGS.map((l) => (
              <div
                key={l}
                className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"
              >
                <span className="mb-1 block text-xs font-semibold uppercase text-gray-400">
                  {l}
                </span>
                <input
                  value={trans[l].title}
                  onChange={(e) => updateTrans(l, 'title', e.target.value)}
                  className={`${input} mb-2`}
                />
                <textarea
                  value={trans[l].body_md}
                  onChange={(e) => updateTrans(l, 'body_md', e.target.value)}
                  rows={3}
                  className={input}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 목록 */}
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            등록된 공지가 없습니다.
          </p>
        ) : (
          rows.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900 dark:text-white">
                  {a.title}
                </p>
                <p className="text-xs text-gray-500">
                  {a.language.toUpperCase()} ·{' '}
                  {a.published_at ? '게시됨' : '임시저장'}
                </p>
              </div>
              <button
                onClick={() => del(a.id)}
                disabled={busy === a.id}
                className="rounded-lg px-2.5 py-1.5 text-xs text-red-500"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
