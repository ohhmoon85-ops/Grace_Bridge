'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Markdown from '@/components/Markdown';
import { exportText, exportDocx, exportPdf } from '@/lib/sermon/export';

export default function SavedEditor({
  id,
  initialTitle,
  initialContent,
}: {
  id: string;
  initialTitle: string;
  initialContent: string;
}) {
  const t = useTranslations('Sermon');
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/sermon/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content_md: content }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  async function del() {
    if (!confirm(t('deleteConfirm'))) return;
    const res = await fetch(`/api/sermon/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/sermon/saved');
  }

  function copy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => router.push('/sermon/saved')}
          className="tap-target rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          ← {t('savedSermons')}
        </button>
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
          disabled={saving}
          className="tap-target rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saved ? t('saved') : saving ? t('saving') : t('save')}
        </button>
        <button
          onClick={del}
          className="tap-target rounded-lg px-3 py-2 text-sm font-medium text-red-500"
        >
          {t('delete')}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">{t('export')}:</span>
        <button
          onClick={() => exportDocx('sermon', title, content)}
          className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
        >
          {t('exportDocx')}
        </button>
        <button
          onClick={() => exportPdf(title, content)}
          className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
        >
          {t('exportPdf')}
        </button>
        <button
          onClick={() => exportText('sermon', content)}
          className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-700"
        >
          {t('exportText')}
        </button>
      </div>

      {editMode && (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 w-full rounded-xl border border-gray-300 px-4 py-3 text-base font-semibold dark:border-gray-700 dark:bg-transparent"
        />
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        {editMode ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60vh] w-full resize-y bg-transparent text-sm leading-relaxed focus:outline-none"
          />
        ) : (
          <Markdown content={content} />
        )}
      </div>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
        ⚠️ {t('disclaimer')}
      </p>
    </div>
  );
}
