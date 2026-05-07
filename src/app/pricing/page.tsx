'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Check, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function PricingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [proHover, setProHover] = useState(false);

  const plans = {
    free: {
      name: t('pricing.free'),
      price: '0',
      desc: t('pricing.freeDesc'),
      featureKeys: ['pricing.freeFeatures.0', 'pricing.freeFeatures.1', 'pricing.freeFeatures.2', 'pricing.freeFeatures.3'],
      href: '/tools',
    },
    pro: {
      name: t('pricing.pro'),
      price: '29',
      desc: t('pricing.proDesc'),
      featureKeys: ['pricing.proFeatures.0', 'pricing.proFeatures.1', 'pricing.proFeatures.2', 'pricing.proFeatures.3', 'pricing.proFeatures.4'],
    },
    enterprise: {
      name: t('pricing.enterprise'),
      price: '99',
      desc: t('pricing.enterpriseDesc'),
      featureKeys: ['pricing.enterpriseFeatures.0', 'pricing.enterpriseFeatures.1', 'pricing.enterpriseFeatures.2', 'pricing.enterpriseFeatures.3', 'pricing.enterpriseFeatures.4', 'pricing.enterpriseFeatures.5'],
      href: 'mailto:contact@zidongai.com.cn?subject=企业版咨询',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <h1 className="text-4xl font-bold mb-3">{t('pricing.title')}</h1>
        <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
          {t('pricing.sub')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        {/* Free Plan */}
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <h3 className="text-lg font-semibold mb-1">{plans.free.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">¥0</span>
            <span className="text-sm text-[var(--text-muted)]">{t('pricing.priceMonth')}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-6">{plans.free.desc}</p>
          <ul className="space-y-3 mb-8">
            {plans.free.featureKeys.map(k => (
              <li key={k} className="text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {t(k)}
              </li>
            ))}
          </ul>
          <Link
            href={plans.free.href}
            className="block w-full text-center py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            {t('pricing.startFree')}
          </Link>
        </div>

        {/* Pro Plan - Popular */}
        <div
          className="relative p-6 rounded-xl border-2 border-[var(--primary)] shadow-xl shadow-[var(--primary)]/10 bg-[var(--bg)] scale-105"
          onMouseEnter={() => setProHover(true)}
          onMouseLeave={() => setProHover(false)}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-4 py-1 rounded-full bg-[var(--primary)] text-white font-medium">
            {t('pricing.recommended')}
          </span>
          <h3 className="text-lg font-semibold mb-1">{plans.pro.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">¥29</span>
            <span className="text-sm text-[var(--text-muted)]">{t('pricing.priceMonth')}</span>
            <span className="ml-2 text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
              {t('pricing.firstMonth')}
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-6">{plans.pro.desc}</p>
          <ul className="space-y-3 mb-8">
            {plans.pro.featureKeys.map(k => (
              <li key={k} className="text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {t(k)}
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.push('/pricing/checkout?plan=pro')}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              proHover
                ? 'bg-[var(--primary-dark)] scale-[1.02]'
                : 'bg-[var(--primary)]'
            } text-white shadow-lg shadow-[var(--primary)]/20`}
          >
            {t('pricing.subscribe')}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <h3 className="text-lg font-semibold mb-1">{plans.enterprise.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">¥99</span>
            <span className="text-sm text-[var(--text-muted)]">{t('pricing.priceMonth')}</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-6">{plans.enterprise.desc}</p>
          <ul className="space-y-3 mb-8">
            {plans.enterprise.featureKeys.map(k => (
              <li key={k} className="text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {t(k)}
              </li>
            ))}
          </ul>
          <a
            href={plans.enterprise.href}
            className="block w-full text-center py-2.5 rounded-lg text-sm font-medium border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            {t('pricing.contactUs')}
          </a>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-16 text-center">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-[var(--text-muted)]">
          <span>{t('pricing.badge1')}</span>
          <span>{t('pricing.badge2')}</span>
          <span>{t('pricing.badge3')}</span>
        </div>
      </div>
    </div>
  );
}
