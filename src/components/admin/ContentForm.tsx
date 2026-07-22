'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { BIBLE_BOOKS } from '@/lib/bible/books';
import type { ContentInput } from '@/lib/content/schema';
import type { SlideData } from '@/types/database';

type Slide = { title: string; body: string; note?: string };

export default function ContentForm({
  id,
  initial,
}: {
  id?: string;
  initial?: Partial<ContentInput>;
}) {
  const router = useRouter();

  const [type, setType] = useState<'slide' | 'video' | 'pdf'>(
    initial?.type ?? 'slide'
  );
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [book, setBook] = useState(initial?.book ?? '');
  const [language, setLanguage] = useState<string>(initial?.language ?? 'ko');
  const [audience, setAudience] = useState<'all' | 'pastor'>(
    initial?.audience ?? 'all'
  );
  const [published, setPublished] = useState(initial?.published ?? false);
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? '');
  const [fileUrl, setFileUrl] = useState(initial?.file_url ?? '');
  const [design, setDesign] = useState<SlideData['design']>(
    initial?.slide_json?.design ?? 'modern'
  );
  const [slides, setSlides] = useState<Slide[]>(
    initial?.slide_json?.slides ?? [{ title: '', body: '', note: '' }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateSlide(i: number, patch: Partial<Slide>) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function addSlide() {
    setSlides((prev) => [...prev, { title: '', body: '', note: '' }]);
  }
  function removeSlide(i: number) {
    setSlides((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setError('');
    if (!title.trim()) {
      setError('제목을 입력하세요.');
      return;
    }
    setSaving(true);
    const payload: ContentInput = {
      type,
      title,
      description,
      book,
      language: language as ContentInput['language'],
      audience,
      published,
      video_url: videoUrl,
      file_url: fileUrl,
      slide_json:
        type === 'slide'
          ? { design, slides: slides.filter((s) => s.title || s.body) }
          : null,
    };

    const res = await fetch(
      id ? `/api/admin/contents/${id}` : '/api/admin/contents',
      {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (res.ok) {
      router.push('/admin/contents');
      router.refresh();
    } else {
      setError('저장에 실패했습니다.');
    }
  }

  const input =
    'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base dark:border-gray-700 dark:bg-transparent';
  const labelC = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelC}>유형</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className={input}
          >
            <option value="slide">슬라이드</option>
            <option value="video">영상</option>
            <option value="pdf">PDF</option>
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
        <div>
          <label className={labelC}>대상</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as 'all' | 'pastor')}
            className={input}
          >
            <option value="all">전체 공개</option>
            <option value="pastor">목회자용</option>
          </select>
        </div>
        <div>
          <label className={labelC}>성경 (선택)</label>
          <select
            value={book}
            onChange={(e) => setBook(e.target.value)}
            className={input}
          >
            <option value="">-</option>
            {BIBLE_BOOKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.names.ko}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelC}>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
      </div>
      <div>
        <label className={labelC}>설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={input}
        />
      </div>

      {type === 'video' && (
        <div>
          <label className={labelC}>YouTube URL</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/..."
            className={input}
          />
        </div>
      )}

      {type === 'pdf' && (
        <div>
          <label className={labelC}>PDF 파일 URL</label>
          <input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://.../file.pdf"
            className={input}
          />
        </div>
      )}

      {type === 'slide' && (
        <div className="space-y-3">
          <div>
            <label className={labelC}>디자인 테마</label>
            <select
              value={design}
              onChange={(e) => setDesign(e.target.value as SlideData['design'])}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="warm">Warm</option>
            </select>
          </div>
          {slides.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 p-3 dark:border-gray-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  슬라이드 {i + 1}
                </span>
                <button
                  onClick={() => removeSlide(i)}
                  className="text-xs text-red-500"
                >
                  삭제
                </button>
              </div>
              <input
                value={s.title}
                onChange={(e) => updateSlide(i, { title: e.target.value })}
                placeholder="제목"
                className={`${input} mb-2`}
              />
              <textarea
                value={s.body}
                onChange={(e) => updateSlide(i, { body: e.target.value })}
                placeholder="본문"
                rows={2}
                className={`${input} mb-2`}
              />
              <input
                value={s.note ?? ''}
                onChange={(e) => updateSlide(i, { note: e.target.value })}
                placeholder="발표자 노트 (선택)"
                className={input}
              />
            </div>
          ))}
          <button
            onClick={addSlide}
            className="w-full rounded-xl border border-brand-300 py-2.5 text-sm font-semibold text-brand-600"
          >
            + 슬라이드 추가
          </button>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        게시 (published)
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={() => router.push('/admin/contents')}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium dark:border-gray-700"
        >
          취소
        </button>
      </div>
    </div>
  );
}
