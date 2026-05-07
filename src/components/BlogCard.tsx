'use client';

import Link from 'next/link';
import { Calendar, Clock, Tag } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { BlogPost } from '@/lib/blog';

function estimateReadingTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, '').trim();
  const charCount = words.length;
  return Math.max(1, Math.ceil(charCount / 500));
}

export default function BlogCard({ post }: { post: BlogPost }) {
  const { t } = useTranslation();
  const readingTime = estimateReadingTime(post.content);
  const tags = post.tags || [];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-200"
    >
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {readingTime} {t('blog.readingTimeShort')}
        </span>
        {tags.length > 0 && tags.slice(0, 2).map((tag: string) => (
          <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-xs border border-[var(--border)]">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="font-semibold mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      )}
    </Link>
  );
}
