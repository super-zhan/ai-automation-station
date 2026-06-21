---
title: "Omnigent 实战：一个框架编排 Claude Code、Codex、Cursor 等所有 AI 编程 Agent"
date: "2026-06-21T08:00:00+08:00"
tags: ["AI", "Omnigent", "Agent", "编程工具", "开源", "AI编程", "Claude Code", "Codex", "多Agent"]
description: "Omnigent 是一个开源 AI Agent 编排框架，4,200+ Stars，让你在一个统一面板中管理 Claude Code、Codex、Cursor、Pi 等所有 AI 编程 Agent，支持跨设备接力、多人协作和云沙箱运行。"
---

如果你同时用 Claude Code、Codex 和 Cursor 写代码，你可能已经体验过这种痛苦：同一个项目，换个工具就得重新熟悉 CLI 参数；想并行让两个 Agent 做不同任务，只能手动切 terminal；想把 session 从电脑切到手机上继续，根本没门。

2026 年 6 月才在 GitHub 上开源的 **Omnigent**（⭐ 4,200+），就是来解决这个问题的。它把自己定位成一个 AI Agent 的"元编排层"——你可以把它理解成 Kubernetes 之于容器，或者 Tmux 之于终端：它让你在一个统一的面板里管理所有 AI 编程 Agent。

本文会从安装部署开始，到手把手用 Omnigent 同时调度 Claude Code 和 Codex 完成一个代码审查任务，最后聊聊适合什么样的人用它。

## Omnigent 是什么

简单说，Omnigent 是一个开源的 AI Agent 框架和元编排工具（meta-harness）。它不替代 Claude Code 或 Codex，而是在它们之上加了一层统一的操作界面。

核心能力包括：

- **多 Agent 编排**：在同一个 Session 里同时运行 Claude Code、Codex、Cursor、Pi，让它们互相审查代码、分任务协作
- **跨设备接力**：在 Mac 终端开始一个 Session，拿起手机在浏览器里继续，状态完全同步
- **任意模型**：Anthropic API Key、OpenAI API Key、Claude 订阅、OpenRouter、Ollama、Databricks 全支持
- **多人协作**：把 Session 链接分享给团队，对方能实时看到 Agent 在做什么，甚至可以接管操作
- **云沙箱运行**：不需要本地算力，在 Modal、Daytona、Islo 等云沙箱中启动 Agent
- **策略治理**：为 Agent 设置审批门槛、花费上限、工具白名单，防止它干出"惊喜操作"

这个项目采用 Apache 2.0 许可证，完全开源，对个人和企业都非常友好。

## 快速安装

安装 Omnigent 非常简单，一行命令即可：

```bash
curl -fsSL https://raw.githubusercontent.com/omnigent-ai/omnigent/main/scripts/install_oss.sh | sh
```

这个安装脚本会自动处理依赖（包括 Python 3.12+ 和 uv 包管理器），安装完成后 `omnigent` 和 `omni` 两个命令都会加入 PATH，它们完全等价。

如果你偏好手动安装，也可以用以下方式之一：

**使用 pip / uv：**

```bash
uv tool install omnigent
```

或者：

```bash
pip install "omnigent"
```

**使用 Homebrew（macOS）：**

```bash
brew install omnigent-ai/tap/omnigent
```

**从源码安装最新版：**

```bash
uv tool install -q --python 3.12 git+https://github.com/omnigent-ai/omnigent.git
```

安装完成后，`omni` 命令就已经可用了。第一次运行时它会自动探测环境中已有的 API Key（`ANTHROPIC_API_KEY`、`OPENAI_API_KEY`，或者已登录的 `claude` / `codex` CLI），并帮助你配置默认模型。

## 启动你的第一个 Agent

在终端直接输入 `omnigent`（或 `omni`）就能启动一个交互式 Session：

```bash
omnigent
```

它会打开一个命令行界面，底部是输入框，上方显示 Agent 的实时输出。同时 Omnigent 会在本地启动一个 Web UI（`http://localhost:6767`），浏览器打开可以看到完全相同的 Session。

如果你只想启动特定 Agent 运行时：

```bash
omnigent claude          # 启动 Claude Code（需要已安装 claude CLI）
omnigent codex           # 启动 Codex（需要已安装 codex CLI）
omnigent run my_agent.yaml  # 启动自定义 Agent
```

这里有个关键设计：`omnigent claude` 启动的不是原生 Claude Code CLI，而是 Omnigent 包装的版本——它保留了 Claude Code 的所有能力，但加入了 Omnigent 的 Session 同步、策略治理和多人协作功能。

Omnigent 内置了两个示例 Agent，非常适合初体验：

**Polly（🐙 章鱼姐）** —— 多 Agent 编程编排器

```bash
omnigent run examples/polly/
```

Polly 自己不写一行代码。她是"技术总监"角色：收到需求后制定计划，把编码任务分派给子 Agent（可以是 Claude Code、Codex 或 Pi），每个子 Agent 在独立的 Git Worktree 中工作，然后让来自不同供应商的 Agent 互相审查代码，最后给你一个合并决策。

**Debby（🟠🔵 双脑辩论师）**

```bash
omnigent run examples/debby/
```

Debby 有两个"大脑"——一个 Claude 和一个 GPT。你问的任何问题都会同时发给两者，然后并列展示两套答案。输入 `/debate` 还能让两个模型互相批评几轮后收敛到共识方案。

## 配置模型与凭证

Omnigent 支持四种类型的凭证：

| 类型 | 说明 |
|------|------|
| API Key | 直接使用 Anthropic、OpenAI 等提供的 API Key |
| 订阅 | 使用 Claude Pro/Max 或 ChatGPT Plus 订阅（通过官方 CLI） |
| 网关 | 任意兼容 OpenAI/Anthropic 协议的代理地址（OpenRouter、LiteLLM、Ollama、Azure） |
| Databricks | Databricks 工作区模型（需要额外安装） |

运行 `omnigent setup` 可以交互式配置：

```bash
omnigent setup
```

它会引导你添加凭证、设置默认模型。每个 Agent 可以有自己的默认模型——Claude Code 用 Anthropic、Codex 用 OpenAI，它们互不冲突。

在 Session 中也可以用 `/model` 命令随时切换模型，非常灵活。

### 网关配置示例

如果你使用 OpenRouter 或本地 Ollama，配置如下：

**OpenRouter：**

```bash
# 用于 Claude Code
# 基础 URL: https://openrouter.ai/api
# API Key: sk-or-xxx

# 用于 Codex / OpenAI Agent
# 基础 URL: https://openrouter.ai/api/v1
```

**本地 Ollama：**

```bash
# 基础 URL: http://localhost:11434/v1
# API Key: 随便填（Ollama 忽略 Key）
```

注意：Claude Code 使用 Anthropic 兼容端点（`/api`），Codex 使用 OpenAI 兼容端点（`/api/v1`），两者 URL 格式不同。

## 实战：用 Omnigent 搭建多 Agent 代码审查流水线

纸上得来终觉浅，我们来做一个真实场景：使用 Polly 编排器，让 Claude Code 写代码，Codex 审查代码，自动完成一个 Python 工具的开发-审查闭环。

### 准备工作

首先确保已安装必要的 CLI 工具：

```bash
# 检查 claude CLI 是否可用
claude --version

# 检查 codex CLI 是否可用
codex --version
```

如果某工具未安装，可以参考官方文档安装。Omnigent 只需要其中一个能用就能启动 Session。

### 启动 Polly 编排器

```bash
# 从 Omnigent 仓库中复制 Polly 示例到工作目录
git clone https://github.com/omnigent-ai/omnigent.git /tmp/omnigent-demo
cd /tmp/omnigent-demo

# 启动 Polly
omnigent run examples/polly/
```

Polly 启动后，会显示一个交互式对话界面。你可以直接提出需求，比如：

> 请帮我写一个 Python 脚本，它能批量将 CSV 文件转换为 Excel 文件，并支持自定义列宽。使用 Claude Code 实现，然后用 Codex 做代码审查。

Polly 会执行以下步骤：

1. **任务规划**：Polly 将需求拆解为任务清单
2. **分发到子 Agent**：将"编写代码"的任务发送给 Claude Code
3. **代码审查**：Claude Code 完成后，将代码发送给 Codex 审查
4. **结果整合**：汇总两方结果，给你最终的代码和审查意见

### 监控多 Agent 协作

在 Polly 工作时，你可以打开浏览器访问 `http://localhost:6767`，实时查看每个 Agent 的终端输出。你能看到：

- Claude Code 正在创建 `csv_to_xlsx.py` 文件
- 它使用了 `pandas` 和 `openpyxl` 库
- Codex 正在逐行审查代码，标注可能的问题
- Codex 建议增加错误处理和类型注解

最终输出会包含完整代码和审查报告，所有内容都在同一个 Session 中，方便回溯。

### 跨设备继续 Session

假设你正在 Mac 上使用 Polly，需要出门。在手机上打开浏览器，访问 Omnigent 的 Web UI 地址（如果部署了服务器则可用公网地址），就能看到完全相同的界面。输入的消息会同步到后台运行的 Agent，就像从未离开过电脑。

## 高级特性

### 策略治理

Omnigent 的一个亮点是内置了 Agent 治理能力。你可以为 Agent 设置策略——类似于 Kubernetes 的 PodSecurityPolicy：

```yaml
# policy.yaml
policies:
  - name: safe-tools
    type: tool-whitelist
    allow: ["read_file", "write_file", "execute_command"]
    deny: ["network_request"]
    
  - name: spend-cap
    type: cost-limit
    max_per_session: 0.50  # 每个 Session 最多花费 0.50 美元
    
  - name: require-approval
    type: approval-gate
    triggers:
      - pattern: "rm -rf"
      - pattern: "DROP TABLE"
```

这些策略可以应用于整个服务器、单个 Agent 或某一次对话。当 Agent 触发了策略条件，Omnigent 会暂停并等待人工审批。

### 云沙箱运行

如果不想占用本地资源，可以把 Agent 放在云沙箱里运行：

```bash
omnigent run examples/polly/ --sandbox modal
```

目前支持 Modal、Daytona 和 Islo 三种托管沙箱。Session 的交互界面仍然在本地，但 Agent 的代码执行环境在云端，做到了"本地操控，云端执行"。

### 编写自定义 Agent

Omnigent 允许你用 YAML 定义自己的 Agent：

```yaml
# my-agent.yaml
name: "mypy-guardian"
description: "专门做 Python 类型检查的 Agent"
model: "claude-sonnet-4-20260506"
system_prompt: |
  你是一个严格的 Python 类型检查专家。
  用户给你 Python 代码时，你要用 mypy 的规则逐条检查，
  输出类型错误的精确位置和修复建议。
tools:
  - read_file
  - write_file
  - execute_command
harness: claude
```

然后用 `omnigent run my-agent.yaml` 即可启动。

## 优缺点总结

**Omnigent 的优势：**

- **统一编排层**：不再需要在多个 Agent CLI 之间手动切换，一个 Omnigent 管理所有
- **Session 同步**：跨设备、跨终端的 Session 同步做得非常完善，体验流畅
- **治理体系**：企业级的安全策略控制，适合团队场景
- **开源免费**：Apache 2.0 许可证，无任何隐藏费用
- **架构灵活**：支持任意模型、任意 Harness、自定义 Agent

**目前局限：**

- **Alpha 阶段**：项目处于早期，API 和配置格式可能变动
- **学习曲线**：对不熟悉 CLI 的用户有一定门槛
- **依赖较多**：需要安装 Node.js、tmux、Python 3.12+ 等运行时
- **生态待建**：目前内置 Agent 和 Harness 数量有限

## 适用场景建议

**强烈推荐使用的场景：**

- 每天在 Claude Code、Codex 和 Cursor 之间反复横跳的开发者
- 需要进行多 Agent 代码审查（不同供应商交叉审查）的团队
- 希望在手机/平板上继续电脑上代码工作的场景
- 需要在云沙箱中运行 Agent 的远程办公环境

**暂时不适合的场景：**

- 只用单一 Agent（如只用 Claude Code）的开发者——Omnigent 的编排能力发挥不出来
- 对零依赖有严格要求的离线环境
- 需要成熟商业支持的企业用户

## 结语

Omnigent 的出现反映了 AI 编程工具发展的一个新趋势：当单个 Agent 工具趋于成熟后，下一个增长点在于如何编排和协同多个 Agent。正如 Kubernetes 统一了容器编排、Tmux 统一了终端会话管理，Omnigent 试图在 AI Agent 领域做同样的事情。

作为一个刚上线不到两周的开源项目，它已经有 4,200+ Stars，社区的关注度说明这个方向确实切中了痛点。如果你刚好在同时使用多个 AI 编程工具，不妨花十分钟装一个试试——也许你会发现，这才是 AI 编程应该有的协作方式。

如果你对自动化效率工具感兴趣，推荐访问 [zidongai.com.cn](https://zidongai.com.cn) 获取更多实用工具和教程。
