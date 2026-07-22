'use client';

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  download(blob, `${filename}.txt`);
}

export async function exportDocx(
  filename: string,
  title: string,
  content: string
) {
  const children: Paragraph[] = [];
  if (title) {
    children.push(
      new Paragraph({ text: title, heading: HeadingLevel.TITLE })
    );
  }

  for (const raw of content.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      children.push(new Paragraph({ children: [] }));
      continue;
    }
    if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: line.slice(4),
          heading: HeadingLevel.HEADING_3,
        })
      );
    } else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: line.slice(3),
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else if (line.startsWith('# ')) {
      children.push(
        new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 })
      );
    } else if (/^[-*]\s+/.test(line)) {
      children.push(
        new Paragraph({
          text: line.replace(/^[-*]\s+/, ''),
          bullet: { level: 0 },
        })
      );
    } else {
      children.push(
        new Paragraph({ children: [new TextRun(line.replace(/^#+\s*/, ''))] })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, `${filename}.docx`);
}

/**
 * PDF는 브라우저 인쇄(다른 이름으로 저장 → PDF) 흐름을 사용합니다.
 * 시스템 폰트를 사용하므로 한국어를 포함한 5개 언어 모두 안전하게 출력됩니다.
 */
export function exportPdf(title: string, content: string) {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const bodyHtml = content
    .split('\n')
    .map((raw) => {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) return '<div style="height:8px"></div>';
      if (line.startsWith('## '))
        return `<h2>${esc(line.slice(3))}</h2>`;
      if (line.startsWith('### '))
        return `<h3>${esc(line.slice(4))}</h3>`;
      if (/^[-*]\s+/.test(line))
        return `<li>${esc(line.replace(/^[-*]\s+/, ''))}</li>`;
      return `<p>${esc(line.replace(/^#+\s*/, ''))}</p>`;
    })
    .join('\n');

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
    <title>${esc(title)}</title>
    <style>
      body { font-family: 'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',sans-serif; padding: 32px; line-height: 1.7; color:#111; }
      h1 { font-size: 22px; margin: 0 0 16px; }
      h2 { font-size: 17px; margin: 20px 0 8px; border-bottom:1px solid #ddd; padding-bottom:4px; }
      h3 { font-size: 15px; margin: 14px 0 6px; }
      p { margin: 6px 0; }
      li { margin: 4px 0 4px 20px; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>${esc(title)}</h1>
    ${bodyHtml}
    </body></html>`);
  win.document.close();
  win.focus();
  win.setTimeout(() => win.print(), 300);
}
