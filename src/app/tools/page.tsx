import Link from 'next/link';
import { FileSpreadsheet, FileText, ArrowRight } from 'lucide-react';

export const metadata = {
  title: '在线工具 - AI 自动化工作站',
  description: '免费的 AI 在线工具：Excel 智能处理、PDF 提取、数据清洗。上传即处理，无需安装。',
};

const tools = [
  {
    title: 'Excel 智能处理器',
    description: '上传 Excel 文件，AI 自动完成数据清洗、格式转换、批量合并。支持 .xlsx, .xls, .csv。',
    icon: FileSpreadsheet,
    href: '/tools/excel-processor',
    features: ['数据清洗去重', '格式批量转换', '多表合并', '公式自动生成'],
  },
  {
    title: 'PDF 文本提取器',
    description: '从 PDF 文件中提取文本内容、表格数据。支持批量上传，一次性处理多个文件。',
    icon: FileText,
    href: '/tools/pdf-extractor',
    features: ['文本提取', '表格识别', '批量处理', '元数据读取'],
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">在线工具</h1>
        <p className="text-[var(--text-muted)]">上传文件，AI 自动处理。完全免费，无需注册。</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tools.map(tool => (
          <Link
            key={tool.href}
            href={tool.href}
            className="p-6 rounded-xl border border-[var(--border)] card-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
              <tool.icon className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors">
              {tool.title}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">{tool.description}</p>
            <ul className="flex flex-wrap gap-2 mb-4">
              {tool.features.map(f => (
                <li key={f} className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-muted)] text-[var(--text-muted)]">
                  {f}
                </li>
              ))}
            </ul>
            <span className="text-sm text-[var(--primary)] inline-flex items-center gap-1 font-medium">
              立即使用 <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
