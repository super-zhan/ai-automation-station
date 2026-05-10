'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Copy, ExternalLink, Server } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { API_PLANS } from '@/lib/i18n/api-plans';

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-24 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" /><p className="text-[var(--text-muted)]">加载中...</p></div>}>
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan') || 'popular';
  const isEn = lang === 'en';

  // Find if this is an API plan
  const apiPlan = API_PLANS.find(p => p.id === planKey);
  const isApiPlan = !!apiPlan;

  // For subscription plans (fallback)
  const subPlan = !isApiPlan ? {
    name: t('pricing.pro'),
    price: '29',
    desc: t('pricing.proDesc'),
    featureKeys: ['pricing.proFeatures.0', 'pricing.proFeatures.1', 'pricing.proFeatures.2', 'pricing.proFeatures.3', 'pricing.proFeatures.4'],
  } : null;

  const plan = isApiPlan ? {
    name: isEn ? apiPlan!.nameEn : apiPlan!.name,
    price: apiPlan!.price.toString(),
    priceCny: apiPlan!.priceCny,
    tokens: apiPlan!.tokens,
    desc: isEn ? apiPlan!.descEn : apiPlan!.desc,
    features: isEn ? apiPlan!.featuresEn : apiPlan!.features,
  } : subPlan;

  const [email, setEmail] = useState('');
  const [state, setState] = useState<'form' | 'loading' | 'paying' | 'success' | 'error'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [orderId, setOrderId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">{t('checkout.invalidPlan')}</h1>
        <p className="text-[var(--text-muted)] mb-6">{t('checkout.invalidPlanDesc')}</p>
        <Link href="/pricing" className="text-[var(--primary)] hover:underline">{t('checkout.backToPricingBtn')}</Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!email) return;
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          email,
          payment_method: paymentMethod,
          is_api_plan: isApiPlan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.order_id);
        setState('paying');
      } else {
        setErrorMsg(data.message || '下单失败，请重试');
        setState('form');
      }
    } catch {
      setErrorMsg('网络错误，请重试');
      setState('form');
    }
  };

  const handlePaymentConfirm = async () => {
    if (!orderId || isActivating) return;
    setIsActivating(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          plan: planKey,
          email,
          is_api_plan: isApiPlan,
        }),
      });
      const data = await res.json();
      if (data.success && data.api_key) {
        setApiKey(data.api_key);
        setState('success');
      } else {
        setErrorMsg(data.message || '激活失败，请联系客服');
      }
    } catch {
      setErrorMsg('激活失败，请重试');
    } finally {
      setIsActivating(false);
    }
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const totalAmount = (isApiPlan && 'priceCny' in plan) ? (plan as any).priceCny : parseInt(plan.price);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/pricing" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8">
        <ArrowLeft className="w-4 h-4" /> {t('checkout.backToPricing')}
      </Link>

      {state === 'success' ? (
        <div className="max-w-lg mx-auto text-center py-8">
          {apiKey ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isEn ? 'Payment Confirmed! 🎉' : '购买成功！🎉'}
              </h1>
              <p className="text-[var(--text-muted)] mb-6">
                {isEn ? 'Your API key has been generated. Copy it below:' : '你的 API Key 已生成，请复制保存：'}
              </p>

              {/* API Key Display */}
              <div className="p-4 rounded-xl border-2 border-[var(--primary)] bg-[var(--primary)]/5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--primary)]">
                    {isEn ? 'YOUR API KEY' : '你的 API Key'}
                  </span>
                  <button
                    onClick={copyApiKey}
                    className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    {apiKeyCopied ? (
                      <><Check className="w-3.5 h-3.5" /> {isEn ? 'Copied!' : '已复制'}</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> {isEn ? 'Copy' : '复制'}</>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs bg-white dark:bg-black/30 px-3 py-2.5 rounded-lg break-all text-left border border-[var(--border)] select-all">
                  {apiKey}
                </div>
              </div>

              {/* Usage instructions */}
              <div className="text-left p-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[var(--primary)]" />
                  {isEn ? 'How to Use' : '如何使用'}
                </h3>
                <div className="space-y-2 text-xs">
                  <p className="font-medium">{isEn ? 'API Endpoint:' : 'API 接入点：'}</p>
                  <code className="block bg-[var(--bg-muted)] px-2 py-1.5 rounded text-xs">
                    POST http://8.210.65.231/v1/chat/completions
                  </code>
                  <p className="font-medium mt-2">{isEn ? 'Example with curl:' : 'cURL 示例：'}</p>
                  <code className="block bg-[var(--bg-muted)] px-2 py-1.5 rounded text-xs whitespace-pre-wrap">
{`curl http://8.210.65.231/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey.slice(0, 12)}..." \\
  -d '{"model": "deepseek-v4-flash", "messages": [{"role": "user", "content": "Hello"}]}'`}
                  </code>
                  <p className="font-medium mt-2">{isEn ? 'Supported Models:' : '可用模型：'}</p>
                  <ul className="list-disc list-inside text-[var(--text-muted)]">
                    <li>deepseek-v4-flash</li>
                    <li>deepseek-v4-pro</li>
                  </ul>
                </div>
              </div>

              <a
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm"
              >
                {isEn ? 'Go to Tools' : '前往工具页'} <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-xs text-[var(--text-muted)] mt-4">
                {isEn ? 'We\'ve also sent the API key to' : 'API Key 已同时发送至'} <span className="font-medium">{email}</span>
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('checkout.successTitle')}</h1>
              <p className="text-[var(--text-muted)] mb-6">{t('checkout.successSub', { plan: plan.name })}</p>
              {email && <p className="text-sm text-[var(--text-muted)] mb-8">{t('checkout.successEmail')} <span className="font-medium text-[var(--text)]">{email}</span></p>}
              <Link href="/tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors">
                {t('checkout.goTools')}
              </Link>
            </>
          )}
        </div>
      ) : state === 'paying' ? (
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-6 text-center">
            {isEn ? 'Scan to Pay' : '扫码支付'}
          </h1>
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <div className="text-center mb-6">
              <div className="text-lg font-semibold mb-1">¥{totalAmount}</div>
              <div className="text-sm text-[var(--text-muted)]">{plan.name}</div>
              {isApiPlan && (
                <div className="text-xs text-[var(--primary)] mt-1">
                  {((plan as any).tokens / 1_000_000).toLocaleString()}M tokens
                </div>
              )}
            </div>

            {/* QR Code Display */}
            {paymentMethod === 'alipay' ? (
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center bg-blue-50/30">
                  <div className="text-center">
                    <span className="text-4xl">💳</span>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {isEn ? 'Alipay QR Code' : '支付宝收款码'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center bg-green-50/30">
                  <div className="text-center">
                    <span className="text-4xl">💚</span>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {isEn ? 'WeChat QR Code' : '微信收款码'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-sm font-medium mb-1">
              {paymentMethod === 'alipay'
                ? (isEn ? 'Open Alipay to scan' : '打开支付宝扫码支付')
                : (isEn ? 'Open WeChat to scan' : '打开微信扫码支付')}
            </p>
            <p className="text-center text-xs text-[var(--text-muted)] mb-4">
              {isEn
                ? 'After payment, click the button below to activate your API key'
                : '支付完成后，点击下方按钮激活 API Key'}
            </p>

            {/* Manual confirm button */}
            <button
              onClick={handlePaymentConfirm}
              disabled={isActivating}
              className="w-full py-3 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isActivating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEn ? 'Activating...' : '激活中...'}</>
              ) : (
                isEn ? '✅ I Have Paid - Activate Now' : '✅ 我已付款，立即激活'
              )}
            </button>

            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {isEn
                  ? 'Please complete the payment first, then click the button above. Your API key will be generated instantly.'
                  : '请先完成支付，然后点击上方按钮。API Key 将立即生成。'}
              </p>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setOrderId(''); setState('form'); setErrorMsg(''); }}
                className="flex-1 py-2 rounded-lg text-sm border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors"
              >
                {t('checkout.cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <h1 className="text-2xl font-bold mb-6">
              {isEn ? 'Confirm Order' : '确认订单'}
            </h1>
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)] space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{plan.name}</span>
                <span className="text-xl font-bold">¥{totalAmount}</span>
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                <p>{plan.desc}</p>
                {isApiPlan && (
                  <p className="text-xs text-[var(--primary)] mt-1">
                    {((plan as any).tokens / 1_000_000).toLocaleString()}M tokens
                  </p>
                )}
                <ul className="mt-3 space-y-2">
                  {((isApiPlan ? (plan as any).features : (plan as any).featureKeys) as string[]).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between text-sm">
                  <span>{t('checkout.subtotal')}</span>
                  <span>¥{totalAmount}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>{t('checkout.total')}</span>
                  <span className="text-lg">¥{totalAmount}</span>
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
                    paymentMethod === 'alipay' ? 'bg-blue-500 text-white' : 'border border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {t('checkout.alipay')}
                </button>
                <button
                  onClick={() => setPaymentMethod('wechat')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    paymentMethod === 'wechat' ? 'bg-green-500 text-white' : 'border border-[var(--border)] hover:bg-[var(--bg-muted)]'
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t('checkout.processing')}</>
                ) : (
                  t('checkout.confirmPay', { price: totalAmount.toString() })
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
