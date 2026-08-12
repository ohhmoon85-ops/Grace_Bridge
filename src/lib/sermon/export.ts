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

type SlideItem = { title: string; body: string; note?: string };

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const SLIDE_FONT =
  "'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',sans-serif";

function openPrintWindow(html: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.setTimeout(() => win.print(), 400);
}

/** 슬라이드 발표용 PDF (16:9, 한 장에 슬라이드 하나) */
export function exportSlidesPdf(
  title: string,
  slides: SlideItem[],
  footer?: string
) {
  const foot = footer
    ? `<div class="foot">${escHtml(footer)} · GraceBridge</div>`
    : `<div class="foot">GraceBridge</div>`;
  const pages = slides
    .map(
      (s) => `<section class="slide">
        <h2>${escHtml(s.title)}</h2>
        <p>${escHtml(s.body)}</p>
        ${foot}
      </section>`
    )
    .join('\n');

  openPrintWindow(`<!doctype html><html><head><meta charset="utf-8">
    <title>${escHtml(title)}</title>
    <style>
      @page { size: 1280px 720px; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: ${SLIDE_FONT}; }
      .slide {
        position: relative;
        width: 1280px; height: 720px; padding: 90px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; page-break-after: always;
        background: #1b358a; color: #fff;
      }
      .slide h2 { font-size: 52px; margin: 0 0 28px; }
      .slide p { font-size: 32px; line-height: 1.5; margin: 0; max-width: 1000px; white-space: pre-wrap; }
      .foot { position: absolute; bottom: 28px; left: 0; right: 0; text-align: center;
        font-size: 18px; color: rgba(255,255,255,0.7); }
    </style></head><body>${pages}</body></html>`);
}

/** 인쇄용 유인물 PDF (A4 세로, 페이지당 슬라이드 2장 + 메모 칸) */
export function exportSlidesHandout(
  title: string,
  slides: SlideItem[],
  footer?: string
) {
  const items = slides
    .map(
      (s, i) => `<div class="item">
        <div class="num">${i + 1}</div>
        <div class="content">
          <h3>${escHtml(s.title)}</h3>
          <p>${escHtml(s.body)}</p>
          ${s.note ? `<p class="note">📝 ${escHtml(s.note)}</p>` : ''}
        </div>
        <div class="memo">
          <span class="memo-label">메모</span>
          <div class="lines"></div>
        </div>
      </div>`
    )
    .join('\n');

  openPrintWindow(`<!doctype html><html><head><meta charset="utf-8">
    <title>${escHtml(title)} — 유인물</title>
    <style>
      @page { size: A4 portrait; margin: 14mm; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: ${SLIDE_FONT}; color: #1D2440; }
      h1 { font-size: 18px; margin: 0 0 10mm; }
      .item {
        display: flex; gap: 8px; height: 122mm; break-inside: avoid;
        border: 1px solid #DAD6C8; border-radius: 6px; padding: 8mm; margin-bottom: 6mm;
      }
      .num { font-weight: 700; color: #B8912E; min-width: 20px; }
      .content { flex: 1; }
      .content h3 { font-size: 15px; margin: 0 0 6px; }
      .content p { font-size: 12.5px; line-height: 1.6; margin: 0 0 6px; white-space: pre-wrap; }
      .content .note { color: #6b5544; font-size: 11px; }
      .memo { width: 46%; border-left: 1px dashed #DAD6C8; padding-left: 6mm; }
      .memo-label { font-size: 10px; color: #999; }
      .lines { margin-top: 6px; height: 88mm;
        background-image: repeating-linear-gradient(#fff 0, #fff 9mm, #E5E2D6 9mm, #E5E2D6 9.3mm); }
      .doc-foot { margin-top: 4mm; padding-top: 3mm; border-top: 1px solid #DAD6C8;
        text-align: center; font-size: 10px; color: #999; }
    </style></head><body>
    <h1>${escHtml(title)}</h1>
    ${items}
    <div class="doc-foot">${footer ? escHtml(footer) + ' · ' : ''}GraceBridge</div>
    </body></html>`);
}
