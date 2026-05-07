import { getAllPosts } from '@/lib/blog';

const baseUrl = process.env.SITE_URL || 'https://ai-saas-bice-ten.vercel.app';

export default function sitemap() {
  const posts = getAllPosts();
  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/tools`, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
    { url: `${baseUrl}/tools/excel-processor`, lastModified: new Date() },
    { url: `${baseUrl}/tools/pdf-extractor`, lastModified: new Date() },
  ];

  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticPages, ...blogPages];
}
