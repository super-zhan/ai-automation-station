'use client';

import Link from 'next/link';
import { Zap, Globe, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-muted)] mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <Zap className="w-5 h-5 text-[var(--primary)]" />
              <span className="gradient-text">{t('site.name')}</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a href="mailto:contact@zidongai.com.cn" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://github.com/super-zhan" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.tools')}</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link href="/tools/excel-processor" className="hover:text-[var(--text)]">{t('footer.excel')}</Link>
              <Link href="/tools/pdf-extractor" className="hover:text-[var(--text)]">{t('footer.pdf')}</Link>
              <Link href="/tools" className="hover:text-[var(--text)]">{t('footer.allTools')}</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.content')}</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link href="/blog" className="hover:text-[var(--text)]">{t('footer.efficiency')}</Link>
              <Link href="/pricing" className="hover:text-[var(--text)]">{t('nav.pricing')}</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.about')}</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
              <Link href="/about" className="hover:text-[var(--text)]">{t('footer.aboutUs')}</Link>
              <Link href="/about#contact" className="hover:text-[var(--text)]">{t('footer.contact')}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>{t('footer.copyright')}</span>
          <span className="hidden sm:inline">·</span>
          <span>{t('footer.built')}</span>
        </div>
      </div>
    </footer>
  );
}
