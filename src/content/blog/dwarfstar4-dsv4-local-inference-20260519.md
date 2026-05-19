---
title: "DwarfStar 4：Redis 之父打造 DeepSeek V4 Flash 本地推理引擎"
date: 2026-05-19
description: "antirez 开源 DwarfStar 4，一个专为 DeepSeek V4 Flash 设计的本地推理引擎。284B 参数 MoE 模型在 MacBook 上跑出 26 tok/s 的惊人速度，带来磁盘 KV 缓存、2-bit 量化等创新设计。"
tags: [DwarfStar4,DeepSeek,本地推理,开源,LLM,Metal,CUDA,量化]
---

# DwarfStar 4：Redis 之父打造 DeepSeek V4 Flash 本地推理引擎

## 一、背景：本地运行 284B 大模型成为现实

2026 年 5 月，一个开源项目在 GitHub 上迅速获得 10k+ 星标——**DwarfStar 4 (ds4)**，由 Redis 创始人 Salvatore Sanfilippo（antirez）开发的 DeepSeek V4 Flash 专用本地推理引擎。

在此之前，本地运行 284B 参数的大模型被认为是不切实际的：模型太大、显存不够、推理速度慢。但 DeepSeek V4 Flash 的 MoE（混合专家）架构改变了这一切——每次推理只激活约 30B 参数，配合 2-bit 量化，可以在 MacBook 上流畅运行。

antirez 说：「DeepSeek V4 Flash 很特别，值得一个专用的推理引擎。」

## 二、DwarfStar 4 是什么

ds4 是一个**完全自包含**的本地推理引擎，专为 DeepSeek V4 Flash 设计。它不是通用 GGUF 运行器，而是深度定制的单模型引擎。

### 核心设计哲学

1. **非通用实现** — 只针对 DSV4 一个模型，不做通用 GGUF loader
2. **KV 缓存是"一等磁盘公民"** — 利用现代 MacBook 的高速 SSD，KV 缓存不仅仅存在于 RAM 中，还可以持久化到磁盘
3. **三件套** — 推理引擎 + HTTP API + 特制 GGUF 量化文件，三者配合开箱即用
4. **AI 辅助开发** — 项目使用 GPT 5.5 辅助编码，antirez 主导设计、测试和调试

### 支持的硬件后端

| 后端 | 状态 | 说明 |
|------|------|------|
| **Metal** | ✅ 主要目标 | MacBook 96GB+ RAM，Mac Studio |
| **CUDA** | ✅ 支持 | DGX Spark（优先），通用 GPU |
| **AMD ROCm** | ⚠️ rocm 分支 | 社区维护，antirez 无硬件 |
| **CPU** | ⚠️ 调试用 | macOS 有内核 bug，仅限 Linux |

## 三、实测性能数据

### Metal 后端推理速度

| 设备 | 量化 | 场景 | Prefill 速度 | 生成速度 |
|------|------|------|:------------:|:--------:|
| M3 Max 128GB | q2 | 预填充 | 58 tok/s | 26 tok/s |
| M3 Max 128GB | q4 | 预填充 | 30 tok/s | 12 tok/s |
| M3 Max 128GB | q2 | 持续推理 | — | 26 tok/s |
| M3 Max 128GB | q4 | 持续推理 | — | 12 tok/s |

在 M3 Max 128GB 上，q2 量化的持续推理达到 **26 tok/s**，这个速度对于日常编码辅助来说已经非常实用。

### 内存占用

- **q2 量化**：仅需约 28GB 上下文内存（1M token 上下文窗口）
- **MacBook 最低推荐**：96GB RAM
- **q4 量化**：需要约 45GB 上下文内存

## 四、最惊艳的设计：磁盘 KV 缓存

传统推理引擎把 KV cache 当 RAM 数据对待，每次重启服务器都需要重新计算全部上下文。antirez 把 KV cache 当磁盘文件对待，带来了革命性变化：

1. **持久化会话** — 你可以关掉服务器再打开，之前的对话上下文自动恢复
2. **前缀共享** — 多个会话之间共享已缓存的 prompt 前缀
3. **快速恢复** — 重启后不需要重新处理整个上下文

这个思路来自一个很简单的观察：现代 MacBook 的 SSD 速度可达 3000-7000 MB/s，为什么 KV cache 一定要在 RAM 里？

## 五、2-bit 量化：关键创新

ds4 采用了特殊的**非对称量化方案**：

- 注意力层和 MLP 层使用不同位宽
- MoE 的 expert 参数压缩到 IQ2_XXS（极致 2-bit）
- 关键路径（gate/router）保持全精度
- 最终效果：284B 模型压缩到约 28GB 内存

实测表明，DeepSeek V4 Flash 对 2-bit 量化的容忍度远超预期，tool calling 和函数调用功能仍然可靠。

## 六、Claude Code 集成

ds4 原生支持 Claude Code 集成。配置好环境变量后，Claude Code 可以直接连接本地运行的 ds4 服务器：

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:5000/v1
export ANTHROPIC_API_KEY=sk-ds4-local
```

这意味着你的代码数据永远不会离开本地机器——对处理敏感代码的企业开发者来说意义重大。

## 七、如何上手

### 安装

```bash
git clone https://github.com/antirez/ds4
cd ds4
make
```

### 下载模型

ds4 需要特定的 DeepSeek V4 Flash GGUF 文件（antirez 特制的量化版本）。你需要至少 96GB RAM 的 MacBook 或等效的 CUDA 硬件。

### 启动

```bash
./ds4 --model path/to/model.gguf --port 5000
```

然后通过 HTTP API 或 Claude Code 连接使用。

## 总结

DwarfStar 4 代表了本地大模型推理的一个重要方向：**专模型专用、深度优化、利用消费级硬件特性**。antirez 用工程直觉告诉我们，有时候通用方案不如专用方案——为特定模型打造的精简引擎，可能比通用推理框架更贴近实际需求。

项目地址：https://github.com/antirez/ds4

在线体验工具：访问 [zidongai.com.cn](https://zidongai.com.cn) 体验 AI 驱动的办公自动化工具集。
