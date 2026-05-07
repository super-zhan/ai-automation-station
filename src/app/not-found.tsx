import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-6">
        <Search className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <p className="text-xl text-[var(--text-muted)] mb-8">页面不存在或已被移动</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-all"
      >
        <Home className="w-4 h-4" /> 返回首页
      </Link>
    </div>
  );
}
