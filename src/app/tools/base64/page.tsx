'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image, Copy, Check } from 'lucide-react';

function utf8ToBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));
}

function base64ToUtf8(base64: string): string {
  try {
    const bytes = atob(base64);
    return decodeURIComponent(
      bytes.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    throw new Error('无效的 Base64 编码');
  }
}

export default function Base64Page() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encode = () => {
    setError('');
    setCopied(false);
    if (!input.trim()) {
      setError('请输入要编码的文本');
      setOutput('');
      return;
    }
    try {
      setOutput(utf8ToBase64(input));
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  };

  const decode = () => {
    setError('');
    setCopied(false);
    if (!input.trim()) {
      setError('请输入要解码的 Base64 字符串');
      setOutput('');
      return;
    }
    try {
      setOutput(base64ToUtf8(input.trim()));
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
      encode();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回工具
      </Link>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <Image className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Base64 编码/解码</h1>
        <p className="text-[var(--text-muted)]">将文本与 Base64 编码互相转换。支持中文和 UTF-8 字符。</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">输入内容</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); setOutput(''); setCopied(false); }}
            onKeyDown={handleKeyDown}
            placeholder="输入要编码或解码的文本..."
            className="w-full h-40 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-colors placeholder:text-[var(--text-muted)]"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={encode}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            编码
          </button>
          <button
            onClick={decode}
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            解码
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">错误</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}

        {(output || error) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">输出结果</label>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full h-40 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] text-sm font-mono resize-y cursor-default focus:outline-none"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
