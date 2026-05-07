'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileSpreadsheet, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExcelProcessorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; downloadUrl?: string } | null>(null);
  const [mode, setMode] = useState('clean');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'))) {
      setFile(f);
      setResult(null);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);

    try {
      const res = await fetch('/api/process-excel', { method: 'POST', body: formData });
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
          <FileSpreadsheet className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Excel 智能处理器</h1>
        <p className="text-[var(--text-muted)]">上传 Excel 文件，AI 自动完成数据清洗、格式转换。支持 .xlsx, .xls, .csv。</p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">处理模式</label>
        <div className="flex gap-2">
          {[
            { value: 'clean', label: '数据清洗' },
            { value: 'convert', label: '格式转换' },
            { value: 'merge', label: '合并工作表' },
          ].map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                mode === m.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => document.getElementById('excel-input')?.click()}
        className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
      >
        <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4" />
        <p className="font-medium mb-1">
          {file ? file.name : '拖拽文件到此处，或点击选择'}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB`
            : '支持 .xlsx, .xls, .csv 格式'}
        </p>
        <input
          id="excel-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={e => {
            setFile(e.target.files?.[0] || null);
            setResult(null);
          }}
        />
      </div>

      {file && !processing && !result && (
        <button
          onClick={handleUpload}
          className="mt-6 w-full py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          开始处理
        </button>
      )}

      {processing && (
        <div className="mt-6 p-6 rounded-xl border border-[var(--border)] text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">正在处理你的文件...</p>
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
            <div>
              <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '处理完成' : '处理失败'}
              </p>
              <p className={`text-sm mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.message}
              </p>
              {result.downloadUrl && (
                <a
                  href={result.downloadUrl}
                  download
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  <Download className="w-4 h-4" /> 下载处理后的文件
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
