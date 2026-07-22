'use client';

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { AppLocale } from '@/types/database';
import Markdown from '@/components/Markdown';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export default function BibleQA() {
  const t = useTranslations('QA');
  const locale = useLocale() as AppLocale;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setError('');
    setInput('');

    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setStreaming(true);
    scrollToBottom();

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale, messages: next }),
      });
      if (res.status === 429) {
        setError(t('limitReached'));
        setMessages(next);
        setStreaming(false);
        return;
      }
      if (!res.ok || !res.body) {
        setError(t('error'));
        setMessages(next);
        setStreaming(false);
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
            setMessages([...next, { role: 'assistant', content: acc }]);
            scrollToBottom();
          } else if (event === 'error') {
            setError(t('error'));
          }
        }
      }
    } catch {
      setError(t('error'));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-2xl flex-col px-4 py-4">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto pb-4"
      >
        {messages.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
            {t('empty')}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
              }`}
            >
              {m.role === 'assistant' ? (
                m.content ? (
                  <Markdown content={m.content} />
                ) : (
                  <span className="animate-pulse text-gray-400">
                    {t('thinking')}
                  </span>
                )
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <p className="mb-2 text-center text-[11px] text-gray-400">
        {t('disclaimer')}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('placeholder')}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base dark:border-gray-700 dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="tap-target rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t('send')}
        </button>
      </form>
    </div>
  );
}
