import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/lib/blog';

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block p-6 rounded-xl border border-[var(--border)] card-hover">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          {post.category}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{formatDate(post.date)}</span>
      </div>
      <h2 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h2>
      <p className="text-sm text-[var(--text-muted)] line-clamp-3">{post.excerpt}</p>
      <div className="flex gap-1.5 mt-3">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-muted)]">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
