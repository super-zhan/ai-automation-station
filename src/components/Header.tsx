'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: '首页' },
    { href: '/tools', label: '在线工具' },
    { href: '/blog', label: '博客' },
    { href: '/pricing', label: '定价' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="w-5 h-5 text-[var(--primary)]" />
          <span className="gradient-text">AI 自动化工作站</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              {l.label}
            </Link>
          ))}
          <a href="/tools/excel-processor" className="text-sm px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors">
            立即使用
          </a>
        </nav>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
          <div className="flex flex-col p-4 gap-3">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] py-2">
                {l.label}
              </Link>
            ))}
            <a href="/tools/excel-processor" className="text-center text-sm px-4 py-2 rounded-lg bg-[var(--primary)] text-white">
              立即使用
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
