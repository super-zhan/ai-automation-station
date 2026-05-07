'use client';

import Link from 'next/link';
import { ArrowRight, Zap, FileSpreadsheet, FileText, Sparkles, Cpu, BarChart3, Shield } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import { useTranslation } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useTranslation();

  const features = [
    { icon: Zap, title: t('features.ai.title'), description: t('features.ai.desc') },
    { icon: Cpu, title: t('features.free.title'), description: t('features.free.desc') },
    { icon: BarChart3, title: t('features.batch.title'), description: t('features.batch.desc') },
    { icon: Shield, title: t('features.security.title'), description: t('features.security.desc') },
    { icon: FileSpreadsheet, title: t('features.excel.title'), description: t('features.excel.desc') },
    { icon: FileText, title: t('features.pdf.title'), description: t('features.pdf.desc') },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-bg opacity-50" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-sm text-[var(--primary)] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t('home.badge')}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {t('home.hero')}
            <span className="gradient-text block mt-2">{t('home.heroHighlight')}</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.sub1')}
            <br />
            {t('home.sub2')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-all shadow-lg shadow-[var(--primary)]/20"
            >
              {t('home.ctaTools')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text)] font-medium hover:bg-[var(--bg-muted)] transition-all"
            >
              {t('home.ctaGuides')}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { num: '2', label: t('home.stat1') },
              { num: '10+', label: t('home.stat2') },
              { num: '100%', label: t('home.stat3') },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-bold gradient-text">{s.num}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('home.featureTitle')}</h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            {t('home.featureSub')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 p-10 md:p-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-lg mx-auto">
            {t('home.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tools/excel-processor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> {t('home.ctaExcel')}
            </Link>
            <Link
              href="/tools/pdf-extractor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-all"
            >
              <FileText className="w-4 h-4" /> {t('home.ctaPdf')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
