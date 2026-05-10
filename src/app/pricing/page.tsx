'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Check, ArrowLeft, Loader2, Cpu, Server } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { API_PLANS } from '@/lib/i18n/api-plans';

export default function PricingPage() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const [proHover, setProHover] = useState(false);
  const [tab, setTab] = useState<'tools' | 'api'>('api'); // default to API tab

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

  const isEn = lang === 'en';

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
          {tab === 'api' ? (
            <Cpu className="w-6 h-6 text-[var(--primary)]" />
          ) : (
            <Zap className="w-6 h-6 text-[var(--primary)]" />
          )}
        </div>
        <h1 className="text-4xl font-bold mb-3">
          {tab === 'api' ? (isEn ? 'API Access Plans' : 'API 接口服务') : t('pricing.title')}
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
          {tab === 'api'
            ? (isEn ? 'OpenAI-compatible API. Pay-as-you-go token packages. No monthly commitment.'
                     : 'OpenAI 兼容 API，按量购买 token 包，无需月费。')
            : t('pricing.sub')}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-xl border border-[var(--border)] p-1">
          <button
            onClick={() => setTab('tools')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'tools'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1.5" />
            {isEn ? 'Tools Subscription' : '工具订阅'}
          </button>
          <button
            onClick={() => setTab('api')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'api'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Server className="w-4 h-4 inline mr-1.5" />
            {isEn ? 'API Access' : 'API 接口'}
          </button>
        </div>
      </div>

      {tab === 'tools' ? (
        /* ====== TOOL SUBSCRIPTION PLANS ====== */
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

          {/* Pro Plan */}
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
      ) : (
        /* ====== API TOKEN PLANS ====== */
        <div>
          {/* Plans grid */}
          <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto items-stretch">
            {API_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-5 rounded-xl border ${
                  plan.popular
                    ? 'border-2 border-[var(--primary)] shadow-xl shadow-[var(--primary)]/10'
                    : 'border border-[var(--border)]'
                } bg-[var(--bg)] flex flex-col`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-4 py-1 rounded-full bg-[var(--primary)] text-white font-medium whitespace-nowrap">
                    {isEn ? 'Most Popular' : '最受欢迎'}
                  </span>
                )}

                <h3 className="text-base font-semibold mb-1">{isEn ? plan.nameEn : plan.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">{isEn ? plan.descEn : plan.desc}</p>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">
                    ≈ ¥{plan.priceCny}
                  </span>
                </div>

                {/* Token amount */}
                <div className="mb-3">
                  <span className="text-sm font-mono font-bold text-[var(--primary)]">
                    {(plan.tokens / 1_000_000).toLocaleString()}M
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">
                    {isEn ? 'tokens' : 'tokens 配额'}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {(isEn ? plan.featuresEn : plan.features).map((f, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => router.push(`/pricing/checkout?plan=${plan.id}`)}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                    plan.popular
                      ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-md shadow-[var(--primary)]/20'
                      : 'border border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {plan.popular ? (isEn ? 'Buy Now' : '立即购买') : (isEn ? 'Select Plan' : '选择方案')}
                </button>
              </div>
            ))}
          </div>

          {/* Info section */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)]/50">
              <h3 className="font-semibold mb-3 text-sm">
                {isEn ? 'How It Works' : '使用流程'}
              </h3>
              <div className="grid sm:grid-cols-4 gap-4 text-sm">
                {[
                  { step: '1', title: isEn ? 'Select Plan' : '选择方案', desc: isEn ? 'Choose the token package that fits your needs' : '选择适合你的 token 套餐' },
                  { step: '2', title: isEn ? 'Pay via QR' : '扫码支付', desc: isEn ? 'Scan WeChat/Alipay QR code to complete payment' : '微信/支付宝扫码支付' },
                  { step: '3', title: isEn ? 'Get API Key' : '获取密钥', desc: isEn ? 'System auto-creates your API key instantly' : '系统自动生成专属 API Key' },
                  { step: '4', title: isEn ? 'Start Using' : '开始调用', desc: isEn ? 'Use any OpenAI-compatible client to call the API' : '用任意 OpenAI 兼容客户端调用 API' },
                ].map((item) => (
                  <div key={item.step} className="text-center p-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {item.step}
                    </div>
                    <div className="font-medium text-xs mb-1">{item.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* API endpoint info */}
          <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <div className="flex items-start gap-3 text-sm">
              <Server className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  {isEn ? 'API Endpoint' : 'API 接入点'}
                </p>
                <p className="font-mono text-xs bg-[var(--bg-muted)] px-2 py-1 rounded inline-block">http://8.210.65.231/v1/chat/completions</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {isEn ? 'Fully compatible with OpenAI API format. Use any OpenAI SDK.' : '完全兼容 OpenAI API 格式，支持任意 OpenAI SDK。'}
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--text-muted)]">
              <span>🔒 {isEn ? 'WeChat/Alipay' : '微信/支付宝支付'}</span>
              <span>⚡ {isEn ? 'Instant API Key Activation' : '付款后自动生成 API Key'}</span>
              <span>💬 {isEn ? '24/7 Support' : '在线客服支持'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom trust badges (for tools tab) */}
      {tab === 'tools' && (
        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-[var(--text-muted)]">
            <span>{t('pricing.badge1')}</span>
            <span>{t('pricing.badge2')}</span>
            <span>{t('pricing.badge3')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
