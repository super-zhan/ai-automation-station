'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function PdfExtractorPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; content?: string } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFiles(e.dataTransfer.files);
    setResult(null);
  }, []);

  const handleExtract = async () => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    setResult(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/process-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: '处理失败，请重试' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回工具
      </Link>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">PDF 文本提取器</h1>
        <p className="text-[var(--text-muted)]">从 PDF 文件中提取文本内容和表格数据，支持批量处理。</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => document.getElementById('pdf-input')?.click()}
        className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
      >
        <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="font-medium mb-1">
          {files && files.length > 0
            ? `已选择 ${files.length} 个文件`
            : '拖拽 PDF 文件到此处，或点击选择'}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          支持批量上传，一次最多 10 个文件
        </p>
        <input
          id="pdf-input"
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => {
            setFiles(e.target.files);
            setResult(null);
          }}
        />
      </div>

      {files && files.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-[var(--text-muted)] mb-2">已选文件：</p>
          <ul className="text-sm space-y-1">
            {Array.from(files).map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                {f.name} ({(f.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {files && files.length > 0 && !processing && !result && (
        <button
          onClick={handleExtract}
          className="mt-6 w-full py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          提取文本
        </button>
      )}

      {processing && (
        <div className="mt-6 p-6 rounded-xl border border-[var(--border)] text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">正在提取文本...</p>
        </div>
      )}

      {result && (
        <div className={`mt-6 p-6 rounded-xl border ${
          result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            )}
            <div className="w-full">
              <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '提取完成' : '提取失败'}
              </p>
              <p className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.message}
              </p>
              {result.content && (
                <pre className="mt-3 p-4 rounded-lg bg-[var(--bg-muted)] text-xs max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {result.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
