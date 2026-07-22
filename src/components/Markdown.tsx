'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 마크다운을 안전하게 렌더링합니다. react-markdown은 기본적으로 raw HTML을
// 렌더링하지 않으므로 XSS에 안전합니다.
export default function Markdown({ content }: { content: string }) {
  return (
    <div className="md-body text-gray-800 dark:text-gray-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
