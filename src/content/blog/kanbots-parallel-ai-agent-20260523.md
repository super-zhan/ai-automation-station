---
title: "KanBots：开源看板工具，每张卡片跑一个并行 AI Agent"
date: 2026-05-23
description: "KanBots 是一个开源桌面应用，把看板（Kanban）和 AI Agent 运行时合二为一。每张卡片可以跑一个独立的 AI Agent，支持 Claude Code 和 Codex，MIT 协议开源。这篇文章深入拆解它的架构设计和核心功能。"
tags: [AI,开源,编程工具,Agent,看板,效率工具]
---

## 引子

2026 年 5 月，一个叫 **KanBots** 的开源项目登顶 Hacker News 首页，获得 147 分。它的 slogan 只有一句话：

> "A kanban that runs parallel agents on every card."

翻译过来就是：**一个看板，每张卡片上跑一个并行的 AI Agent。**

你拖一张卡片到「In Progress」列，KanBots 自动创建独立的 git worktree，启动一个 Claude Code 或 Codex Agent，实时把 `tool_use`、`tool_result` 流式推送到 UI。拖五张卡片，五个 Agent 同时在各自的隔离环境下工作。它们可以共享同一个代码仓库，但互不干扰。

这不再是概念演示。它已经发布 v1.0，MIT 协议开源，支持 macOS、Linux、Windows，并且——**零遥测、零服务器、本地优先**。

本文带你深入拆解 KanBots 的架构设计、核心功能，以及为什么它可能是 AI 辅助编程的下一步进化方向。

## 一、KanBots 是什么

KanBots 是一个本地优先的开源桌面应用。它把看板（Kanban）和 AI Agent 运行时（Runtime）合二为一。

### 核心流程

1. **拖入一个文件夹**。只要是 git 仓库即可。
2. **自动生成看板**。KanBots 在仓库根目录下创建 `.kanbots/` 目录，包含 SQLite 数据库、配置文件、worktrees。
3. **拖卡片、启 Agent**。在任意卡片上点击「Dispatch」，KanBots 创建独立的 git worktree，启动 Claude Code 或 Codex Agent。
4. **实时观看**。每一行 `tool_use`、每一个 `tool_result` 都会流式推送到 UI。Agent 需要决策时，卡片上弹出选项。
5. **完成或 Promote**。Agent 跑完后，工作成果可以直接 `promote` 为提交，或创建 Draft PR。

### 技术栈速览

```
Node 20+ + pnpm 10+
Electron 桌面壳
SQLite 本地存储
Claude Code CLI / Codex CLI
git worktree 隔离
```

这看起来简单，但背后的设计极为精妙。

## 二、核心架构拆解

### 2.1 工作目录结构

```bash
.kanbots/
├── db.sqlite           # 所有 issues、threads、runs、providers、settings
├── config.json         # workspace 模式 + 默认配置
├── worktrees/          # 每个 Agent run 一个独立子目录
│   ├── issue-24-run-abc/
│   └── issue-22-run-def/
├── attachments/        # 拖入聊天/卡片的文件
├── mcp-runtime/        # 临时 MCP 配置
└── promote/            # worktree 提升为 commit 的中转区
```

**关键设计决定：** 所有数据都在 `.kanbots/` 内，不改写仓库任何现有文件。Agent 的 worktree 和仓库主分支是完全隔离的——通过 git worktree 实现，而非简单目录复制。

### 2.2 Agent 运行时模型

KanBots 定义了一个统一的 **AgentCliAdapter** 接口：

```typescript
interface AgentCliAdapter {
  spawn(worktree: string, prompt: string): ChildProcess;
  parseEvent(line: string): StreamEvent | null;
  // StreamEvent = tool_use | tool_result | decision_request | finish
}
```

当前实现了两个适配器：

- **ClaudeCodeAdapter** — 通过 `claude -p` 启动，解析 stream-JSON 输出
- **CodexAdapter** — 通过 `codex exec` 启动，解析相同格式

同一张看板、同样的 worktrees、同样的决策 UI——后端 Agent 可互换。这是分层架构的优秀实践。

### 2.3 并行隔离机制：git worktree

Agent 之间的隔离不是靠容器或虚拟环境，而是 **git worktree**：

```bash
git worktree add .kanbots/worktrees/issue-24-run-abc kanbots/issue-24
```

每个 worktree 指向独立的 `kanbots/issue-N` 分支。Agent 对这个分支的修改不会影响其他 worktree 或 main 分支。

**更关键的是 pre-push hook：** KanBots 自动设置 pre-push hook，阻止 Agent 执行 `git push`。这意味着 Agent 可以任意修改代码、运行测试，但永远无法将未审核的代码推送到远端仓库。

### 2.4 实时流式 UI

KanBots UI 最大的亮点是 **live agent thread**。这不是一个简单的「等 Agent 跑完看结果」——它把 Agent 的每步操作流式展示：

- 每个 `tool_use` 调用实时出现
- 每个 `tool_result` 返回实时更新
- Agent 请求决策时，卡片上弹出选项按钮（如「How should I handle iOS HEIC files?」→ 3 个选项），用户点击后 Agent 继续

这是对 AI 编程过程的全透明化——不再是黑盒，而是看得见、可干预的协作。

## 三、Autopilot 模式：真正的多 Agent 协作

KanBots 的「Autopilot」模式是它的杀手级功能。

### Feature Dev Autopilot

配置 **personas**（角色）和 **parallelism**（并行度，最大 4）：

```yaml
personas:
  - product_author
  - engineer
  - reviewer
  - tester
parallelism: 3
effort: medium
model: claude-opus-4.7
```

流程：

1. Orchestrator 接收一个 Issue
2. 按 round-robin 轮询调用各 persona
3. 多个 slot 并发运行
4. 父 Issue 自动拆分为子任务
5. 随着 Agent 工作推进，backlog 动态演化
6. 当所有子任务关闭或成本到达上限时停止

**最有趣的是「personas spawn personas」**——product_author 可能会决定新增一个子任务，engineer 实现时发现需要重构，于是生成新的 tech-debt 卡片。整个 backlog 像生物一样自我演化。

### QA Autopilot

```bash
# 循环: typecheck → test → lint → e2e → fix → repeat
```

QA 模式下，Agent 运行类型检查、单元测试、lint、端到端测试，发现失败后自动修复，修复完成后再次运行，直到全部通过或达到成本上限。

## 四、GitHub Issues 集成

KanBots 有两种工作模式：

| 模式 | Issue 来源 | 适用场景 |
|------|-----------|---------|
| **local** | .kanbots/db.sqlite | 个人项目、实验性工作 |
| **github** | GitHub REST API | 团队协作已有 Issue |

GitHub 模式下：

- 看板操作通过 `status:*` label 编辑双向同步
- Promote 可创建 Draft PR
- Sentry import：自动拉取 Sentry error groups 到看板，一键交给 Agent 处理

## 五、MCP 集成：让任意工具驱动看板

KanBots 提供了 `kanbots-mcp-server`——一个 Model Context Protocol 服务器。

这意味着：

- **Cursor** 可以通过 MCP 读取/写入看板
- **Claude Desktop** 可以通过 MCP 操控看板
- 任何 MCP-aware 工具都可以与 KanBots 交互

```json
// MCP 工具示例
{
  "tools": [
    {
      "name": "kanbots_get_board",
      "description": "获取当前看板所有卡片"
    },
    {
      "name": "kanbots_dispatch_agent",
      "description": "在指定卡片上启动 Agent"
    }
  ]
}
```

这种开放架构意味着 KanBots 不只限制在桌面应用内——它正在成为一个 Agent 编排平台。

## 六、为什么这很重要

看板工具（Jira、Trello、Linear）和 AI 编程工具（Copilot、Claude Code、Codex）是两个独立的软件品类。KanBots 把它们融合了：

**之前：**
1. PM 在 Jira 创建 Issue
2. 开发者在 IDE 中手动切换到该 Issue
3. 运行 Claude Code / Codex 处理 Issue
4. 提交 PR
5. PM 在 Jira 移动卡片

**现在（KanBots）：**
1. PM 在看板上创建卡片
2. 点击「Dispatch」，Agent 自动处理
3. 实时看 Agent 在做什么
4. 完成后一键 Promote 为提交
5. 卡片自动移动到 Done

这不是节省了一个「切换上下文」的步骤——它从根本上改变了「人写代码」到「人管理 Agent 写代码」的范式。

## 七、快速上手

```bash
# 1. 克隆
git clone https://github.com/leodavinci1/kanbots.git
cd kanbots

# 2. 安装
pnpm install

# 3. 启动
pnpm desktop

# 4. 选择任意的 git 仓库目录
# 5. 开始拖卡片、启 Agent
```

前提条件：

- Node 20+ 和 pnpm 10+
- Claude Code CLI（`claude` 在 PATH 中，且已 `claude /login`）
- （可选）Codex CLI
- git

也可从 GitHub Releases 下载编译好的安装包（macOS / Linux / Windows）。

## 八、注意事项与局限

1. **macOS/Windows 构建未签名**。macOS 上首次打开需右键 → 打开绕过 Gatekeeper，Windows 上需绕过 SmartScreen。

2. **AI 成本**。Agent 调用 API 是实打实的费用。KanBots 带实时成本分析面板，每张卡片显示 `$0.13`、`$0.31` 等费用。

3. **适用场景**。KanBots 不是 Project Management 工具——它没有甘特图、没有 Sprint 规划、没有工时统计。它是 **Agent Task Management** 工具。

4. **仍很新**。87 次 commit，5 个 tag，4 个 fork。项目诞生于 2026 年 4 月。社区和插件生态尚未成熟。

## 总结

KanBots 不是一个普通的开源工具。它代表了一种工作流范式的转变：**从「人写代码」到「人管理 Agent 写代码」**。

看板管理任务 → Agent 执行任务 → 人审核结果。这个循环一旦跑通，开发效率的提升不是线性的，而是指数级的。

它现在 98 个 Star、MIT 协议开源。如果你对 AI Agent 编程的未来感兴趣，这是你今晚应该 clone 的项目。

---

**在线工具推荐：** 我在做的一个在线工具 [zidongai.com.cn](https://zidongai.com.cn) 也在探索 AI 自动化的边界，欢迎来看看。

**代码仓库：** https://github.com/leodavinci1/kanbots
**官网：** https://www.kanbots.dev/
