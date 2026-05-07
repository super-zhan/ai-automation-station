#!/usr/bin/env node
/**
 * 自动博客内容生成脚本
 * 用法: node scripts/generate-post.mjs
 *
 * 生成一篇新的 SEO 优化博客文章并写入 content/blog 目录
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content', 'blog');

const topics = [
  { title: 'Excel 批量合并：3 种方法搞定上百个工作表', keywords: 'Excel, 合并, VBA, Python, 效率' },
  { title: 'RPA 入门：用自动化工具替代人工数据录入', keywords: 'RPA, 自动化, 数据录入, 效率' },
  { title: 'Python 抓取网页数据：从零开始的爬虫教程', keywords: 'Python, 爬虫, 数据采集, 网页' },
  { title: 'AI 写作助手评测：2025 年最好用的 5 个工具', keywords: 'AI, 写作, 工具, 评测, 效率' },
  { title: 'WPS 表格高级技巧：数据透视表从入门到精通', keywords: 'WPS, 表格, 数据透视表, 教程' },
];

function getSlug(title) {
  // Convert Chinese characters to pinyin-like slug, or use English keywords
  const mapping = {
    'Excel 批量合并：3 种方法搞定上百个工作表': 'excel-merge-sheets-guide',
    'RPA 入门：用自动化工具替代人工数据录入': 'rpa-automation-introduction',
    'Python 抓取网页数据：从零开始的爬虫教程': 'python-web-scraping-tutorial',
    'AI 写作助手评测：2025 年最好用的 5 个工具': 'ai-writing-assistant-review',
    'WPS 表格高级技巧：数据透视表从入门到精通': 'wps-pivot-table-guide',
  };

  if (mapping[title]) return mapping[title];

  return title
    .toLowerCase()
    .replace(/[：:，。！？、（）【】《》""''\s]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateContent(topicIndex) {
  const topic = topics[topicIndex % topics.length];
  const slug = getSlug(topic.title);
  const today = new Date().toISOString().split('T')[0];

  // Check if already exists
  const existing = fs.readdirSync(contentDir).filter(f => f.includes(slug));
  if (existing.length > 0) {
    console.log(`跳过: ${topic.title} (已存在)`);
    return null;
  }

  const template = `---
title: ${topic.title}
date: ${today}
author: AI 自动化助手
category: 效率工具
tags: ${topic.keywords}
excerpt: 本文详细介绍 ${topic.title.replace(/[：:].*/, '')} 的完整流程，从基础概念到高级技巧，帮你提升工作效率。
---

# ${topic.title}

在日常工作中，我们经常会遇到重复性的办公任务。本文介绍的技巧可以帮助你将这些工作自动化，大幅提高效率。

## 为什么需要自动化？

时间是最宝贵的资源。手动重复操作不仅耗时，还容易出错。自动化可以将你从这些繁琐的工作中解放出来，专注于更有创造性的任务。

## 入门指南

### 第一步：分析你的工作流程

在开始自动化之前，先花时间分析你每天的工作。找出那些重复性高、规则明确的步骤，这些就是自动化的最佳对象。

### 第二步：选择合适的工具

根据你的需求选择合适的自动化工具。如果只是简单的 Excel 处理，可以使用我们提供的在线工具。如果需要复杂的流程自动化，可以考虑编写脚本或使用专业的 RPA 工具。

### 第三步：实施和迭代

从小处开始，逐步扩大自动化的范围。每次优化一点，长期积累下来会有巨大的效率提升。

## 常见场景

1. **数据处理**：清洗、转换、合并各类数据文件
2. **报告生成**：自动生成日报、周报、月报
3. **文档整理**：批量处理 PDF、Word、Excel 文件
4. **邮件自动化**：自动发送和归档邮件
5. **网页数据采集**：从网站提取有用信息

## 总结

自动化不是一蹴而就的，但每一步改进都会带来长期回报。从今天开始，减少重复性工作，把时间花在更有价值的事情上。

---

*如果你觉得本文有帮助，欢迎分享给更多需要的人。使用我们的在线工具可以立即开始自动化你的工作流程。*
`;

  const filePath = path.join(contentDir, `${slug}.md`);
  fs.writeFileSync(filePath, template, 'utf-8');
  console.log(`✅ 生成: ${topic.title} -> ${path.relative(path.join(__dirname, '..'), filePath)}`);
  return true;
}

// 生成所有文章
let count = 0;
for (let i = 0; i < topics.length; i++) {
  if (generateContent(i)) count++;
}

console.log(`\n完成！本次生成 ${count} 篇新文章。`);
console.log(`总文章数: ${fs.readdirSync(contentDir).filter(f => f.endsWith('.md')).length} 篇`);
