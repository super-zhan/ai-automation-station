import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '定价 - AI 自动化工作站',
  description: '完全免费的 AI 在线工具。基础功能永久免费，高级功能即将上线。',
};

export default function PricingPage() {
  const plans = [
    {
      name: '免费版',
      price: '0',
      desc: '适合个人日常使用',
      features: [
        'Excel 基础处理（1000行以内）',
        'PDF 文本提取（10页以内）',
        '文档格式转换',
        '每日 20 次处理',
      ],
      cta: '开始使用',
      popular: false,
    },
    {
      name: '专业版',
      price: '29',
      desc: '适合重度用户和中小企业',
      features: [
        'Excel 高级处理（无限制）',
        'PDF 批量提取（无限制）',
        'AI 智能分析',
        '无限次处理',
        '优先支持',
      ],
      cta: '即将上线',
      popular: true,
    },
    {
      name: '企业版',
      price: '99',
      desc: '适合团队和企业定制需求',
      features: [
        '全部专业版功能',
        '私有化部署',
        'API 接口',
        '定制化开发',
        '专属客服',
      ],
      cta: '联系我们',
      popular: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">简单透明的定价</h1>
        <p className="text-[var(--text-muted)]">所有基础功能永久免费，专业版即将推出</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`relative p-6 rounded-xl border ${
              plan.popular
                ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10'
                : 'border-[var(--border)]'
            } bg-[var(--bg)]`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-[var(--primary)] text-white">
                推荐
              </span>
            )}
            <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">¥{plan.price}</span>
              <span className="text-sm text-[var(--text-muted)]">/月</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">{plan.desc}</p>
            <ul className="space-y-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.name !== '免费版'}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                plan.popular
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  : 'border border-[var(--border)] hover:bg-[var(--bg-muted)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
