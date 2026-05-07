import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(parsePost);
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(p => p.slug === slug) || null;
}

function parsePost(filename: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
  const [, metaRaw] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) || ['', '', raw];

  const meta: Record<string, string> = {};
  metaRaw.split('\n').forEach(line => {
    const [, key, val] = line.match(/^(\w+):\s*(.+)$/) || [];
    if (key) meta[key] = val;
  });

  const slug = filename.replace('.md', '');
  const content = metaRaw ? raw.slice(`---\n${metaRaw}\n---\n`.length) : raw;

  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '2026-01-01',
    author: meta.author || 'AI 自动化助手',
    category: meta.category || '自动化',
    tags: (meta.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    excerpt: meta.excerpt || content.replace(/[#*`\[\]]/g, '').trim().slice(0, 200) + '...',
    content: content.trim(),
  };
}
