// Checkout temporarily disabled
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CheckoutDisabled />
    </Suspense>
  );
}

function CheckoutDisabled() {
  const { t } = useTranslation();
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="text-2xl font-bold mb-3">支付系统维护中</h1>
      <p className="text-[var(--text-muted)] mb-6">在线支付功能暂不可用，如有需要请联系客服开通。</p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> 返回定价页
      </Link>
    </div>
  );
}
