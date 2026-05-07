import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: '文章未找到' };

  return {
    title: `${post.title} - AI 自动化工作站`,
    description: post.excerpt || `阅读关于 ${post.title} 的详细文章`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function estimateReadingTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, '').trim();
  const charCount = words.length;
  const readingSpeed = 500; // Chinese characters per minute
  const minutes = Math.max(1, Math.ceil(charCount / readingSpeed));
  return minutes;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const tags = post.tags || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 返回博客列表
      </Link>

      {/* Article header */}
      <article>
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)] mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {readingTime} 分钟阅读
            </span>
            {tags.length > 0 && (
              <span className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3.5 h-3.5" />
                {tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-xs border border-[var(--border)]">
                    {tag}
                  </span>
                ))}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-[var(--text-muted)] leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-[var(--text)] prose-headings:font-bold
            prose-p:text-[var(--text)] prose-p:leading-relaxed
            prose-a:text-[var(--primary)] prose-a:no-underline hover:prose-a:underline
            prose-code:text-[var(--primary)] prose-code:bg-[var(--bg-muted)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-[var(--bg-muted)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-xl
            prose-strong:text-[var(--text)]
            prose-blockquote:border-l-[var(--primary)] prose-blockquote:text-[var(--text-muted)]
            prose-li:text-[var(--text)]
            prose-img:rounded-xl
            dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-[var(--border)]">
          <h2 className="text-xl font-bold mb-6">推荐文章</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="block p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-sm transition-all"
              >
                <span className="text-xs text-[var(--text-muted)]">{rp.date}</span>
                <h3 className="font-medium mt-1 text-sm line-clamp-2">{rp.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
