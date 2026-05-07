import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  /** Raw markdown content (for RSS/exports) */
  rawContent: string;
}

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

let _cache: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_cache) return _cache;

  if (!fs.existsSync(BLOG_DIR)) {
    _cache = [];
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(parsePost);
  _cache = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return _cache;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(p => p.slug === slug) || null;
}

function parsePost(filename: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
  const [, metaRaw, markdownContent] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) || ['', '', raw];

  const meta: Record<string, string> = {};
  metaRaw.split('\n').forEach(line => {
    const [, key, val] = line.match(/^(\w+):\s*(.+)$/) || [];
    if (key) meta[key] = val;
  });

  const slug = filename.replace('.md', '');

  // Convert markdown to HTML synchronously (remark.processSync is available)
  const processor = remark().use(remarkHtml, { sanitize: false });
  const htmlContent = processor.processSync(markdownContent || '').toString();

  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '2026-01-01',
    author: meta.author || 'AI 自动化助手',
    category: meta.category || '自动化',
    tags: (meta.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    excerpt: meta.excerpt || markdownContent.replace(/[#*`\[\]]/g, '').trim().slice(0, 200) + '...',
    content: htmlContent,
    rawContent: markdownContent,
  };
}

/** Clear cache (useful for hot reload in dev) */
export function clearCache() {
  _cache = null;
}
