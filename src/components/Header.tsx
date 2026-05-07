'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/lib/i18n';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useTranslation();

  useEffect(() => setMounted(true), []);

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/tools', label: t('nav.tools') },
    { href: '/blog', label: t('nav.blog') },
    { href: '/pricing', label: t('nav.pricing') },
    { href: '/about', label: t('nav.about') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Zap className="w-5 h-5 text-[var(--primary)]" />
          <span className="gradient-text">{t('site.name')}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
            aria-label={t('nav.toggleTheme')}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors text-sm"
            aria-label={t('nav.switchLang')}
          >
            {t('nav.switchLang')}
          </button>
          <a href="/tools/excel-processor" className="text-sm px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors">
            {t('nav.useNow')}
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
            aria-label={t('nav.toggleTheme')}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors text-sm"
            aria-label={t('nav.switchLang')}
          >
            {t('nav.switchLang')}
          </button>
          <button className="p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
              {t('nav.useNow')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
