---
title: "CopilotKit：33K Star 的前端 Agent 框架，手把手教你用 React 集成 AI 对话界面"
date: 2026-06-07
description: "CopilotKit 是一个 GitHub 33K Star 的开源项目，被称为 Agent 与 Generative UI 的前端全栈。支持 React、Angular、Vue、React Native，其 AG-UI 协议已被 Google、LangChain、AWS、Microsoft 采纳。本文手把手教你接入 CopilotKit。"
tags: [AI,前端,React,CopilotKit,Agent,Generative UI,AG-UI,开源,技术教程,效率工具]
---

## CopilotKit：33K Star 的前端 Agent 框架，手把手教你用 React 集成 AI 对话界面

2026 年 6 月，一个叫 CopilotKit 的开源项目在 GitHub 上持续霸榜，单日新增 631 个 Star，累计超过 33K。它被称作"Agent 与 Generative UI 的前端全栈"，不仅支持 React、Angular、Vue、React Native，还扩展到 Slack 和 Microsoft Teams。更值得关注的是，它背后的 AG-UI 协议已被 Google、LangChain、AWS、Microsoft 等巨头采纳。

本文将手把手教你用 CopilotKit 在 React 应用中集成一个完整的 AI Agent 对话界面，全程代码可跑通。

### CopilotKit 是什么

简单说，CopilotKit 是一个 SDK，让你在现有前端应用中快速接入 AI Agent 能力。它不只是 Chat UI，还提供了：

- **Generative UI**：Agent 可以在运行时动态生成和更新 UI 组件
- **Shared State**：Agent 和 UI 组件共享实时状态层
- **Human-in-the-Loop**：Agent 在执行关键操作前可暂停，等待用户确认
- **Self-Learning（早期体验）**：Agent 通过用户反馈持续改进

你可以在同一套 Agent 后端上，为 Web 应用、移动端、甚至 Slack/Terms 团队协作工具提供统一的 AI 交互体验。

### 快速上手：1 分钟接入 AI 对话

开始前，确保你的项目使用 React 17+ 或 Next.js 12+。我们用 Vite + React 演示。

**步骤 1：安装依赖**

```bash
npm install @copilotkit/react-core @copilotkit/react-ui
```

**步骤 2：在应用的根组件中包裹 CopilotKit 提供者**

```jsx
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <MyApp />
    </CopilotKit>
  );
}
```

`runtimeUrl` 指向你的 Agent 后端运行时地址。

**步骤 3：在页面中添加对话界面组件**

```jsx
import { CopilotSidebar } from "@copilotkit/react-ui";

function MyPage() {
  return (
    <div>
      <h1>我的 AI 工具</h1>
      <CopilotSidebar />
    </div>
  );
}
```

**步骤 4：配置后端 Agent**

后端使用 LangChain 或任何兼容的 Agent 框架。以下是一个简单的 Express 后端示例：

```javascript
import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint } from "@copilotkit/runtime";
import { ChatOpenAI } from "@langchain/openai";
import express from "express";

const app = express();

app.use("/api/copilotkit", copilotRuntimeNodeHttpEndpoint({
  runtime: new CopilotRuntime({
    agent: new ChatOpenAI({
      model: "gpt-4o",
      apiKey: process.env.OPENAI_API_KEY,
    }),
  }),
}));

app.listen(3000);
```

完成以上 4 步，你的应用中就出现了一个可对话的 AI 助手。

### Generative UI：让 Agent 拥有渲染能力

CopilotKit 最强大的特性是 Generative UI——Agent 不仅能回复文本，还能动态渲染 UI 组件。

例如，让 Agent 生成一个数据表格：

```jsx
function DataTable({ data }) {
  return (
    <table>
      <thead>
        <tr>
          {Object.keys(data[0] || {}).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {Object.values(row).map((val, j) => (
              <td key={j}>{String(val)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Agent 可以在对话中调用这个组件：

```javascript
// Agent 侧代码
async function handleUserQuery(query) {
  if (query.includes("数据") || query.includes("表格")) {
    // Agent 决定渲染 DataTable 组件
    return {
      type: "component",
      name: "DataTable",
      props: {
        data: await fetchData(query),
      },
    };
  }
  return { type: "text", content: await generateTextResponse(query) };
}
```

用户侧看到的不再是枯燥的文本回复，而是可直接交互的 UI 组件。

### Shared State：Agent 与 UI 协同工作

CopilotKit 的 Shared State 让 Agent 和前端组件共享一个实时状态层：

```jsx
import { useCopilotAction } from "@copilotkit/react-core";

function SearchFilter() {
  const [filters, setFilters] = useCopilotAction({
    name: "updateFilters",
    description: "更新搜索过滤条件",
    parameters: [
      { name: "category", type: "string" },
      { name: "priceRange", type: "string" },
    ],
    handler: ({ category, priceRange }) => {
      setFilters({ category, priceRange });
      return "过滤条件已更新";
    },
  });

  return (
    <div>
      <select onChange={(e) => setFilters({ category: e.target.value })}>
        <option>全部</option>
        <option>电子产品</option>
        <option>图书</option>
      </select>
    </div>
  );
}
```

用户选择类别时，Agent 同步感知变化；Agent 修改过滤条件时，UI 自动更新。

### Human-in-the-Loop：让 Agent 学会"请示"

当 Agent 要执行关键操作（发送邮件、删除数据、支付等）时，可以暂停并请求用户确认：

```jsx
await copilotKit.askUser({
  title: "确认发送邮件",
  message: `是否要向 ${recipient} 发送包含以下内容的邮件？`,
  fields: [
    { name: "confirm", type: "boolean", label: "我已确认内容无误" },
  ],
});

if (userResponse.confirm) {
  await sendEmail(recipient, content);
} else {
  return "已取消发送";
}
```

这在构建自动化工作流时尤为重要——既充分发挥 AI 的效率，又保留人对关键决策的控制权。

### 为什么 CopilotKit 值得关注

CopilotKit 之所以能在短时间内获得 33K Star，有几个原因：

1. **框架无关**：从 React 扩展到 Angular、Vue、React Native，甚至 Slack 和 Teams，一套 Agent 逻辑跑通所有前端
2. **AG-UI 协议正在成为标准**：被 Google、LangChain、AWS、Microsoft 采纳，意味着生态会越来越大
3. **开发体验极简**：4 步接入 AI 对话，10 分钟就能跑通原型
4. **企业级特性**：Human-in-the-Loop、Shared State、Self-Learning 让它从玩具级工具中脱颖而出

### 总结

CopilotKit 代表了前端开发的下一波浪潮——从"用户操作 UI"到"Agent 驱动 UI"。无论你是在做 SaaS 产品、企业内部工具还是个人项目，它都能在几分钟内让你的应用拥有专业级的 AI 交互体验。

如果你对这个方向感兴趣，不妨去 CopilotKit 的 GitHub 仓库看看，33K Star 背后是活跃的社区和快速迭代的团队。我在做的 zidongai.com.cn 也计划集成类似的 Agent UI 方案，帮助更多开发者快速落地 AI 功能。

### 参考资源

- GitHub 仓库：https://github.com/CopilotKit/CopilotKit
- 官方文档：https://docs.copilotkit.ai
- AG-UI 协议：https://ag-ui.com
