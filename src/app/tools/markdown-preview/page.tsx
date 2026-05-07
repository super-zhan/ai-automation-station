'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inList = false;
  let inBlockquote = false;

  const flushList = () => {
    if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      htmlLines.push('</blockquote>');
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks (```)
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        htmlLines.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushBlockquote();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line.trim())) {
      flushList();
      flushBlockquote();
      htmlLines.push('<hr />');
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      flushBlockquote();
      htmlLines.push('');
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      flushBlockquote();
      const level = headerMatch[1].length;
      const content = renderInline(escapeHtml(headerMatch[2]));
      htmlLines.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      if (!inBlockquote) {
        flushList();
        htmlLines.push('<blockquote>');
        inBlockquote = true;
      }
      htmlLines.push(`<p>${renderInline(escapeHtml(bqMatch[1]))}</p>`);
      continue;
    } else {
      flushBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      htmlLines.push(`<li>${renderInline(escapeHtml(ulMatch[1]))}</li>`);
      continue;
    } else {
      flushList();
    }

    // Regular paragraph
    htmlLines.push(`<p>${renderInline(escapeHtml(line))}</p>`);
  }

  flushList();
  flushBlockquote();

  // Close unclosed code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    htmlLines.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
  }

  return htmlLines.join('\n');
}

function renderInline(text: string): string {
  // Inline code (must be done before bold/italic to avoid conflicts)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Bold **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic *text*
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Bold with __ __
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

  return text;
}

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(`# Markdown 预览

## 快速开始

这是一个 **实时** Markdown 编辑器，支持以下语法：

### 文本样式

- **粗体文字**
- *斜体文字*
- \`行内代码\`
- [链接示例](https://example.com)

### 代码块

\`\`\`
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 引用

> 这是一段引用文字
> 可以有多行

---

### 列表

- 项目一
- 项目二
- 项目三

---

*由 AI 自动化平台提供*`);

  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回工具
      </Link>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Markdown 预览</h1>
        <p className="text-[var(--text-muted)]">实时 Markdown 编辑器，左侧编写、右侧预览，无需任何外部依赖。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2 block">Markdown 编辑</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在此编写 Markdown..."
            className="flex-1 min-h-[400px] p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--text-muted)]"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2 block">预览效果</label>
          <div
            className="flex-1 min-h-[400px] p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] overflow-y-auto prose prose-sm max-w-none
              [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-0
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3
              [&_p]:mb-2 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
              [&_li]:leading-relaxed
              [&_code]:bg-[var(--bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
              [&_pre]:bg-[var(--bg)] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:mb-3 [&_pre]:overflow-x-auto
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none
              [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:mb-3 [&_blockquote]:text-[var(--text-muted)] [&_blockquote]:italic
              [&_blockquote_p]:mb-0.5
              [&_a]:text-[var(--primary)] [&_a]:underline [&_a:hover]:brightness-110
              [&_hr]:border-t [&_hr]:border-[var(--border)] [&_hr]:my-6
              [&_strong]:font-bold
              [&_em]:italic
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
