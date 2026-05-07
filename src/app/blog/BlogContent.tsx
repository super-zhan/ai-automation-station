'use client';

import BlogCard from '@/components/BlogCard';
import { useTranslation } from '@/lib/i18n';
import type { BlogPost } from '@/lib/blog';

interface Props {
  posts: BlogPost[];
}

export default function BlogContent({ posts }: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">{t('blog.title')}</h1>
        <p className="text-[var(--text-muted)]">{t('blog.sub')}</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          {t('blog.empty')}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map(post => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
