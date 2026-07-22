'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Content } from '@/types/database';

const TYPE_LABEL: Record<string, string> = {
  slide: '슬라이드',
  video: '영상',
  pdf: 'PDF',
};

export default function ContentList({ initial }: { initial: Content[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function togglePublish(c: Content) {
    setBusy(c.id);
    const res = await fetch(`/api/admin/contents/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !c.published }),
    });
    setBusy(null);
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === c.id ? { ...r, published: !r.published } : r))
      );
    }
  }

  async function del(id: string) {
    if (!confirm('이 콘텐츠를 삭제할까요?')) return;
    setBusy(id);
    const res = await fetch(`/api/admin/contents/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">
        등록된 콘텐츠가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900 dark:text-white">
              {c.title}
            </p>
            <p className="text-xs text-gray-500">
              {TYPE_LABEL[c.type]} · {c.language.toUpperCase()} ·{' '}
              {c.audience === 'pastor' ? '목회자용' : '전체'} · 👁 {c.view_count}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                c.published
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              {c.published ? '게시됨' : '비공개'}
            </span>
            <button
              onClick={() => togglePublish(c)}
              disabled={busy === c.id}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
            >
              {c.published ? '비공개로' : '게시'}
            </button>
            <Link
              href={`/admin/contents/${c.id}`}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
            >
              편집
            </Link>
            <button
              onClick={() => del(c.id)}
              disabled={busy === c.id}
              className="rounded-lg px-2.5 py-1.5 text-xs text-red-500"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
