---
title: Vercel eve：文件系统优先的 AI Agent 框架，5 分钟上手实战
date: 2026-06-19T08:00:00+08:00
author: AI 自动化助手
category: AI
tags: AI, Agent, Vercel, eve, 开源, TypeScript, 开发框架, 效率工具
excerpt: Vercel 新开源 eve 框架，用文件系统即接口的理念重新定义 AI Agent 开发。5 分钟初始化、3 分钟写出天气助手，本文手把手实战教学。
---

## Vercel eve：文件系统优先的 AI Agent 框架，5 分钟上手实战

### 引言

AI Agent 是 2026 年最火的开发方向之一。从 OpenAI 的 GPTs 到各种 Agent 框架，开发者们一直在寻找更简单、更直观的方式来构建 AI Agent。今天要介绍的 **Vercel eve**，可能就是这个问题的终极答案。

就在上周，Vercel 在 GitHub 上开源了一个名为 `eve` 的 AI Agent 框架，短短几天就收获了超过 1300+ Star。作为对比，Next.js 之父 Vercel 出品的每一个开源项目都代表着行业风向。eve 的核心理念是：**文件系统即接口（Filesystem-first）**。

这意味着什么？简单来说，你不需要复杂的配置文件、不需要学习繁琐的 SDK，你只需要在项目中创建一些约定好的文件和目录，你的 AI Agent 就定义好了。

## 什么是 Vercel eve

eve 是一个**文件系统优先（filesystem-first）的持久化 AI Agent 框架**。它由 Vercel 团队开发并开源，遵循 Apache 2.0 协议。

它的核心理念是将 Agent 的能力分布在文件系统的约定路径中。这样的设计有几个显著优势：

- **直观的项目结构** —— 看一眼目录树就知道 Agent 能做什么
- **易于扩展** —— 添加工具就是添加一个文件
- **易于运维** —— 代码即配置，支持 Git 版本管理
- **持久化** —— Agent 的状态可以跨会话保持

### eve 的核心概念

eve 的项目结构非常清晰，看一次就记住了：

```
my-agent/
└── agent/
    ├── agent.ts            # 可选：模型和运行时配置
    ├── instructions.md     # 必需：系统提示词（System Prompt）
    ├── tools/              # 可选：Agent 可以调用的函数工具
    │   └── get_weather.ts
    ├── skills/             # 可选：按需加载的任务流程
    │   └── plan_a_trip.md
    ├── channels/           # 可选：消息通道（HTTP、Slack、Discord 等）
    │   └── slack.ts
    └── schedules/          # 可选：定时任务（Cron Job）
        └── weekly_recap.ts
```

每个目录都有特定的含义：

| 目录/文件 | 是否必须 | 作用 |
|-----------|---------|------|
| `instructions.md` | ✅ 必须 | Agent 的系统提示词，定义行为准则 |
| `agent.ts` | 可选 | 配置使用的模型、API key 等 |
| `tools/` | 可选 | Agent 可以调用的 TypeScript 函数 |
| `skills/` | 可选 | 按需加载的操作流程（Markdown 描述） |
| `channels/` | 可选 | 接入消息渠道（HTTP API、Slack Bot、Discord Bot） |
| `schedules/` | 可选 | 定时任务配置 |

## 快速开始：5 分钟构建第一个 Agent

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 第一步：初始化项目

```bash
npx eve@latest init my-agent
```

这条命令会：
1. 创建一个 `my-agent` 目录
2. 安装依赖（`eve` 包本身）
3. 初始化 Git 仓库
4. 启动交互式终端 UI

如果你已有项目，也可以直接初始化到当前目录：

```bash
cd myapp
npx eve@latest init .
```

### 第二步：编写系统提示词

打开生成的 `agent/instructions.md`，用你自己定义的 Agent 行为替换默认内容：

```markdown
你是一个简洁的天气预报助手。
告诉用户天气数据是模拟的（Mock），仅供演示。
回答要简短、友好，每次回复最后加一句"☀️ 祝你今天好心情！"
```

### 第三步：添加工具函数

接下来为 Agent 添加一个获取天气的工具。创建 `agent/tools/get_weather.ts`：

```typescript
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "获取指定城市的模拟天气数据",
  inputSchema: z.object({
    city: z.string().min(1).describe("城市名称，如 Beijing、Shanghai"),
  }),
  async execute({ city }) {
    // 这里可以接入真实天气 API
    return {
      city,
      condition: "Sunny",
      temperatureC: 25,
      humidity: "60%",
    };
  },
});
```

可以看到，eve 使用了 `zod` 做输入验证，`defineTool` 包装了工具的描述和实现逻辑。这一切都遵循 TypeScript 的类型安全。

### 第四步：配置模型

创建 `agent/agent.ts` 来选择你想要的模型：

```typescript
import { defineAgent } from "eve";

export default defineAgent({
  model: "gpt-4o",
  provider: "openai",
  temperature: 0.7,
});
```

目前 eve 支持 OpenAI、Anthropic Claude 等主流模型提供商。你也可以配置自定义的 API 端点来使用国产大模型。

### 第五步：运行你的 Agent

```bash
cd my-agent
npx eve dev
```

就可以在终端中与你的 Agent 交互了！输入 "北京今天天气怎么样？"，Agent 会自动调用 `get_weather` 工具返回数据。

## 进阶用法：Skill 系统和 Channel 系统

### Skill 系统：按需加载的能力

想象一下，你希望 Agent 在用户需要时能够"策划一次旅行"。这个流程可能包含多个步骤，不适合放到系统提示词里。eve 的 Skill 系统就是为此设计的：

创建 `agent/skills/plan_a_trip.md`：

```markdown
## 旅行计划流程

当用户要求策划旅行时，按以下步骤执行：

1. 首先询问用户的目的地、时间、预算
2. 调用 `search_flights` 工具查询航班
3. 调用 `search_hotels` 工具查询酒店
4. 调用 `get_weather` 工具查询目的地天气
5. 整合信息生成旅行建议书
```

Skill 是 Markdown 文件，用自然语言描述流程。Agent 会在需要时自动加载并理解这些流程。

### Channel 系统：接入真实业务

想让 Agent 接入 Slack 或 Discord？只需要创建一个 channel 文件：

```typescript
// agent/channels/slack.ts
import { defineChannel } from "eve/channels";

export default defineChannel({
  type: "slack",
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
```

同样，你也可以创建 HTTP API 端点：

```typescript
// agent/channels/api.ts
import { defineChannel } from "eve/channels";

export default defineChannel({
  type: "http",
  path: "/api/agent",
  method: "POST",
});
```

这样你的 Agent 就变成了一个 HTTP 服务，可以集成到任何业务系统中。

## eve 的设计哲学：为什么文件系统即接口

你可能好奇，为什么 Vercel 选择用文件系统来定义 Agent，而不是像 LangChain 那样用代码编排？

这其实是 Vercel 一以贯之的设计理念。回想一下 Next.js 的成功之处：**约定优于配置**。在 Next.js 中，`pages/` 目录下的文件自动变成路由，`app/` 目录下的 layout.tsx 自动成为布局。开发者不需要写路由配置文件，不需要注册组件。

eve 把同样的理念带到了 AI Agent 领域：

- **`tools/` 目录下的每个文件就是一个工具** —— 不需要注册、不需要导入
- **`skills/` 目录下的每个文件就是一个技能** —— 按需自动加载
- **`instructions.md` 就是系统提示词** —— 用你最熟悉的 Markdown 编写

这种设计思路极大降低了 Agent 开发的认知负荷。你不需要理解复杂的 Agent 编排逻辑，只需要知道：**文件放在哪里，Agent 就有什么能力**。

## 与传统 Agent 框架的对比

| 特性 | Vercel eve | LangChain | AutoGPT | Dify |
|------|-----------|-----------|---------|------|
| 学习曲线 | ⭐ 低（文件系统即接口） | ⭐⭐⭐ 高 | ⭐⭐ 中 | ⭐ 低 |
| 可扩展性 | ⭐⭐⭐ 目录扩展 | ⭐⭐⭐ Chain 组合 | ⭐⭐ 插件 | ⭐⭐ 工作流 |
| TypeScript 支持 | ✅ 原生 | ✅ 支持 | ❌ Python | ❌ Python |
| 持久化状态 | ✅ 内置 | ❌ 需额外配置 | ❌ 有限 | ✅ 内置 |
| 多通道接入 | ✅ HTTP/Slack/Discord | ✅ 需额外配置 | ❌ | ✅ 内置 |
| 开源协议 | Apache 2.0 | MIT | MIT | Apache 2.0 |
| 文件系统约定 | ✅ 核心设计 | ❌ | ❌ | ❌ |

可以看到，eve 最大的差异化优势就是**文件系统约定**和**极低的学习曲线**。如果你已经熟悉 TypeScript 和 Markdown，基本上不需要额外学习就能上手。

## 实战场景：构建一个自动化运营助手

让我们来构建一个更有实际价值的场景：一个**内容运营助手**，它可以自动从 RSS 抓取内容、生成摘要、并发布到多个平台。

### 项目结构

```
content-bot/
└── agent/
    ├── instructions.md          # 系统提示词
    ├── agent.ts                 # 配置 model
    ├── tools/
    │   ├── fetch_rss.ts         # 抓取 RSS 内容
    │   ├── generate_summary.ts  # 调用 AI 生成摘要
    │   └── post_to_csdn.ts      # 发布到 CSDN
    └── schedules/
        └── daily_publish.ts     # 每天早上 8 点执行
```

### 核心工具实现

RSS 抓取工具：

```typescript
// agent/tools/fetch_rss.ts
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "从 RSS 链接抓取最新文章列表",
  inputSchema: z.object({
    rssUrl: z.string().url(),
    limit: z.number().default(5),
  }),
  async execute({ rssUrl, limit }) {
    const response = await fetch(rssUrl);
    const xml = await response.text();
    // 解析 XML 提取文章标题和链接
    const items = parseRSS(xml).slice(0, limit);
    return items;
  },
});
```

定时发布任务：

```typescript
// agent/schedules/daily_publish.ts
import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 8 * * *",  // 每天早上 8 点
  async run() {
    const posts = await this.callTool("fetch_rss", {
      rssUrl: "https://blog.example.com/rss"
    });
    for (const post of posts) {
      const summary = await this.callTool("generate_summary", {
        content: post.content,
      });
      await this.callTool("post_to_csdn", {
        title: post.title,
        content: summary,
      });
    }
  },
});
```

这个例子展示了 eve 的真正威力：**用文件系统组织能力，用自然语言描述流程，用 TypeScript 实现工具**。而这一切都遵循"约定优于配置"的原则。

## 如何部署 eve Agent

eve 天然与 Vercel 平台集成。你可以一键部署到 Vercel：

```bash
npx eve deploy
```

这会将你的 Agent 部署为 Vercel Functions，自动获得：

- **Serverless 弹性伸缩** —— 零流量时不收费
- **边缘网络加速** —— 全球访问低延迟
- **自带域名和 HTTPS**
- **持续集成** —— 关联 Git 仓库，推送即部署

如果你需要私有化部署，也可以打包成 Docker 镜像：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx eve build
CMD ["npx", "eve", "start"]
```

## 总结与展望

Vercel eve 代表了一种**新的 Agent 开发范式**。它摒弃了传统框架中复杂的抽象层和配置逻辑，回归到开发者最熟悉的东西 —— **文件系统**。

这种设计带来的最直接好处是：**门槛极低、结构清晰、易于运维**。无论你是刚接触 AI Agent 的新手，还是在生产环境中管理大量 Agent 的团队，eve 都能提供简洁而强大的体验。

如果你正在考虑构建 AI Agent 应用，强烈建议试试 eve。5 分钟上手，一个下午就能做出生产可用的 Agent。

---

### 更多资源

- 🔗 eve GitHub 仓库：https://github.com/vercel/eve
- 🔗 官方文档：https://beta.eve.dev/docs
- 🔗 在线工具推荐：https://www.zidongai.com.cn —— 自动化工具集合，帮你用 AI 提升工作效率
