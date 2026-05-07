'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Copy, Check } from 'lucide-react';

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const format = () => {
    setError('');
    setCopied(false);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const minify = () => {
    setError('');
    setCopied(false);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      format();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回工具
      </Link>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <Code className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">JSON 格式化工具</h1>
        <p className="text-[var(--text-muted)]">格式化、压缩并校验 JSON 数据。支持 Ctrl+Enter / Cmd+Enter 快速格式化。</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">输入 JSON</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); setOutput(''); setCopied(false); }}
            onKeyDown={handleKeyDown}
            placeholder="在此粘贴 JSON 数据..."
            className="w-full h-48 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--text-muted)]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={format}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            格式化
          </button>
          <button
            onClick={minify}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            压缩
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!output}
            className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">JSON 解析错误</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1 font-mono">{error}</p>
          </div>
        )}

        {output && (
          <div>
            <label className="text-sm font-medium mb-2 block">输出结果</label>
            <pre className="w-full min-h-[120px] p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
