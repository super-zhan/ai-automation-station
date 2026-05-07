import { getAllPosts } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';

export const metadata = {
  title: '博客 - AI 自动化工作站',
  description: '效率工具教程、AI 办公技巧、Python 自动化指南。用 AI 提升你的工作效率。',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">效率指南</h1>
        <p className="text-[var(--text-muted)]">AI 办公技巧、Python 自动化、效率工具推荐</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          文章正在生成中，请稍后再来...
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
