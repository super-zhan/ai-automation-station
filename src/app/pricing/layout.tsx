import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '定价 - AI 自动化工作站',
  description: '完全免费的 AI 在线工具。基础功能永久免费，专业版 ¥29/月起。',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
