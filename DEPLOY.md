# AI 自动化工作站 - 部署说明

## 项目简介
全栈网站: Next.js 16 + Tailwind CSS v4
功能: SEO 内容博客 + Excel 在线处理器 + PDF 文本提取器

## 在线地址
- Vercel (已部署): https://ai-saas-bice-ten.vercel.app
- GitHub: https://github.com/super-zhan/ai-automation-station

## 本地运行
```bash
cd ~/ai-saas
npm run dev
```

## 部署到 Vercel（已完成）

## 绑定自定义域名
1. 进 Vercel 项目 → Settings → Domains
2. 输入你的域名 → 按指引配置 DNS

## 持续更新内容
### 方式 A: GitHub Actions（推荐）
1. 在 Vercel 网页上链接 GitHub 仓库
2. 推送 main 分支会自动部署
3. .github/workflows/auto-post.yml 会每 3 天自动生成文章

### 方式 B: 本地 crontab
```bash
# 把 .crontab 里的 TOKEN 换成你的 Vercel Token
crontab .crontab
```

## 手动生成文章
```bash
node scripts/generate-post.mjs
vercel --prod --yes  # 部署
```

## 技术栈
- Next.js 16 (Turbopack)
- Tailwind CSS v4
- xlsx (Excel 处理)
- pdf-parse (PDF 提取)
- Lucide React (图标)

## 项目结构
```
src/
  app/
    page.tsx           — 首页
    blog/              — 博客列表 + 文章页
    tools/             — Excel + PDF 工具页
    pricing/           — 定价页面
    api/               — 后端 API 路由
  components/          — 可复用组件
  content/blog/        — Markdown 博文
  lib/                 — 工具函数
scripts/
  generate-post.mjs    — 自动生成博文的脚本
.github/workflows/     — CI/CD
