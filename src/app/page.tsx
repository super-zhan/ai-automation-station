import Link from 'next/link';
import { ArrowRight, Zap, FileSpreadsheet, FileText, Bot, TrendingUp, Shield } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-bg">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)]/50 text-sm text-[var(--text-muted)] mb-6">
            <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
            AI 驱动 · 完全免费 · 开箱即用
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">AI 赋能</span> 的
            <br />
            自动化工作站
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            不用写代码，上传文件即可处理。Excel 自动清洗、PDF 批量提取、数据格式转换 ——
            <br />所有重复工作，交给 AI。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/tools/excel-processor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              开始使用 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text)] font-medium hover:bg-[var(--bg-muted)] transition-colors"
            >
              阅读教程
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">一站式效率工具箱</h2>
          <p className="text-[var(--text-muted)]">覆盖日常办公最常见的文件处理需求</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={FileSpreadsheet}
            title="Excel 智能处理"
            description="数据清洗、格式转换、批量合并、公式生成。上传即处理，无需安装任何软件。"
          />
          <FeatureCard
            icon={FileText}
            title="PDF 批量提取"
            description="从 PDF 中提取文本、表格和元数据。支持批量处理，一次性处理几十个文件。"
          />
          <FeatureCard
            icon={Bot}
            title="AI 自动处理"
            description="自然语言描述你的需求，AI 自动完成数据处理。你说需求，它干活。"
          />
          <FeatureCard
            icon={TrendingUp}
            title="数据可视化"
            description="上传数据自动生成图表和分析报告，不用学 Excel 高级功能。"
          />
          <FeatureCard
            icon={Shield}
            title="隐私安全"
            description="上传文件仅用于处理，处理完成后自动删除。不做数据留存。"
          />
          <FeatureCard
            icon={Zap}
            title="完全免费"
            description="所有基础功能免费使用，不限次数。高级功能即将上线。"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--bg-muted)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好提升效率了吗？</h2>
          <p className="text-[var(--text-muted)] mb-8">
            不用注册，不用下载，上传文件就开始处理。
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors text-lg"
          >
            浏览所有工具 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
