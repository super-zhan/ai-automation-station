'use client';

import Link from 'next/link';
import { FileSpreadsheet, FileText, Code, ImageIcon, FileType, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function ToolsPage() {
  const { t } = useTranslation();

  const tools = [
    {
      titleKey: 'tools.excel',
      descKey: 'tools.excelDesc',
      icon: FileSpreadsheet,
      href: '/tools/excel-processor',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      titleKey: 'tools.pdf',
      descKey: 'tools.pdfDesc',
      icon: FileText,
      href: '/tools/pdf-extractor',
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
    {
      titleKey: 'tools.json',
      descKey: 'tools.jsonDesc',
      icon: Code,
      href: '/tools/json-formatter',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      titleKey: 'tools.base64',
      descKey: 'tools.base64Desc',
      icon: ImageIcon,
      href: '/tools/base64',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      titleKey: 'tools.markdown',
      descKey: 'tools.markdownDesc',
      icon: FileType,
      href: '/tools/markdown-preview',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-4">{t('tools.title')}</h1>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          {t('tools.sub')}
        </p>
      </div>

      {/* Tool Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" style={{ color: tool.color.includes('green') ? '#22c55e' : tool.color.includes('red') ? '#ef4444' : tool.color.includes('blue') ? '#3b82f6' : tool.color.includes('purple') ? '#8b5cf6' : '#f59e0b' }} />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors">{t(tool.titleKey)}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{t(tool.descKey)}</p>
              <div className="flex items-center gap-1 mt-4 text-sm font-medium text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
                {t('tools.start')} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Trust Badge */}
      <div className="mt-16 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-8">
        <p>{t('tools.badge')}</p>
      </div>
    </div>
  );
}
