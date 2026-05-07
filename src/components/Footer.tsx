import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-muted)] mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <Zap className="w-5 h-5 text-[var(--primary)]" />
              <span className="gradient-text">AI 自动化工作站</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)]">
              用 AI 释放你的生产力。在线工具、自动化脚本、效率指南。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">工具</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link href="/tools/excel-processor" className="hover:text-[var(--text)]">Excel 处理器</Link>
              <Link href="/tools/pdf-extractor" className="hover:text-[var(--text)]">PDF 提取器</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">内容</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link href="/blog" className="hover:text-[var(--text)]">博客</Link>
              <Link href="/pricing" className="hover:text-[var(--text)]">定价</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">关于</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <a href="#" className="hover:text-[var(--text)]">项目介绍</a>
              <a href="#" className="hover:text-[var(--text)]">联系我们</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] mt-8 pt-6 text-center text-xs text-[var(--text-muted)]">
          © 2026 AI 自动化工作站. 用 AI 赋能效率.
        </div>
      </div>
    </footer>
  );
}
