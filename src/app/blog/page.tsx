import { getAllPosts } from '@/lib/blog';
import BlogContent from './BlogContent';

export const metadata = {
  title: '博客 - AI 自动化工作站',
  description: '效率工具教程、AI 办公技巧、Python 自动化指南。用 AI 提升你的工作效率。',
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogContent posts={posts} />;
}
