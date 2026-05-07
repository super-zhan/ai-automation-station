'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function CheckoutPageWrapper() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">{t('checkout.loading')}</p>
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan') || 'pro';

  const plans: Record<string, { name: string; price: string; desc: string; featureKeys: string[] }> = {
    pro: {
      name: t('pricing.pro'),
      price: '29',
      desc: t('pricing.proDesc'),
      featureKeys: ['pricing.proFeatures.0', 'pricing.proFeatures.1', 'pricing.proFeatures.2', 'pricing.proFeatures.3', 'pricing.proFeatures.4'],
    },
  };

  const plan = plans[planKey];
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'form' | 'loading' | 'paying' | 'success' | 'error'>('form');
  const [payUrl, setPayUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'manual'>('alipay');
  const [orderId, setOrderId] = useState('');

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">{t('checkout.invalidPlan')}</h1>
        <p className="text-[var(--text-muted)] mb-6">{t('checkout.invalidPlanDesc')}</p>
        <Link href="/pricing" className="text-[var(--primary)] hover:underline">
          {t('checkout.backToPricingBtn')}
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!email) return;
    setState('loading');
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          email,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayUrl(data.pay_url);
        setOrderId(data.order_id);
        setState('paying');
        pollPaymentStatus(data.order_id);
      } else {
        alert(data.message || '下单失败，请重试');
        setState('form');
      }
    } catch {
      alert('网络错误，请重试');
      setState('form');
    }
  };

  const pollPaymentStatus = async (oid: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-status?order_id=${oid}`);
        const data = await res.json();
        if (data.paid) {
          clearInterval(interval);
          setState('success');
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  const handleManualConfirm = () => {
    setState('success');
  };

  const totalAmount = parseInt(plan.price);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> {t('checkout.backToPricing')}
      </Link>

      {state === 'success' ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('checkout.successTitle')}</h1>
          <p className="text-[var(--text-muted)] mb-6">{t('checkout.successSub', { plan: plan.name })}</p>
          {email && (
            <p className="text-sm text-[var(--text-muted)] mb-8">
              {t('checkout.successEmail')}{' '}
              <span className="font-medium text-[var(--text)]">{email}</span>
            </p>
          )}
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            {t('checkout.goTools')}
          </Link>
        </div>
      ) : state === 'paying' ? (
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">{t('checkout.scanPay')}</h1>
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <div className="text-center mb-6">
              <div className="text-lg font-semibold mb-1">¥{totalAmount}</div>
              <div className="text-sm text-[var(--text-muted)]">{plan.name} {t('checkout.monthly')}</div>
            </div>

            {payUrl ? (
              <div className="flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payUrl}
                  alt={t('checkout.scanPay')}
                  className="w-48 h-48 rounded-lg border border-[var(--border)]"
                />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--text-muted)] mx-auto mb-2" />
                    <span className="text-xs text-[var(--text-muted)]">{t('checkout.qrLoading')}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <p className="text-sm font-medium">
                {paymentMethod === 'alipay' ? t('checkout.qrHint') : t('checkout.qrHintWechat')}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('checkout.autoActivate')}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPayUrl('');
                  setState('form');
                }}
                className="flex-1 py-2 rounded-lg text-sm border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors"
              >
                {t('checkout.cancel')}
              </button>
            </div>

            {!payUrl && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {t('checkout.manualTip')}
                </p>
                <button
                  onClick={handleManualConfirm}
                  className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                >
                  {t('checkout.manualBtn')}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{plan.name}</span>
                <span className="text-xl font-bold">¥{plan.price}</span>
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                <p>{plan.desc}</p>
                <ul className="mt-3 space-y-2">
                  {plan.featureKeys.map((k) => (
                    <li key={k} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {t(k)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between text-sm">
                  <span>{t('checkout.subtotal')}</span>
                  <span>¥{plan.price}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>{t('checkout.total')}</span>
                  <span className="text-lg">¥{plan.price}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">{t('checkout.payment')}</h2>
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    paymentMethod === 'alipay'
                      ? 'bg-blue-500 text-white'
                      : 'border border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {t('checkout.alipay')}
                </button>
                <button
                  onClick={() => setPaymentMethod('wechat')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    paymentMethod === 'wechat'
                      ? 'bg-green-500 text-white'
                      : 'border border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {t('checkout.wechat')}
                </button>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">{t('checkout.emailLabel')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('checkout.emailPlaceholder')}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">{t('checkout.emailHint')}</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!email || state === 'loading'}
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t('checkout.processing')}
                  </>
                ) : (
                  t('checkout.confirmPay', { price: plan.price })
                )}
              </button>

              <p className="text-xs text-center text-[var(--text-muted)]">
                {t('checkout.agree')} <a href="#" className="underline">{t('checkout.terms')}</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
