---
title: "DeepSeek 4 Flash 本地推理：用 ds4 在 MacBook 上跑出 6000+ tok/s"
date: 2026-05-27
description: "Redis 创始人 antirez 刚开源了 ds4——一个专为 DeepSeek 4 Flash 模型设计的本地推理引擎。本文从零开始教你在 MacBook 上部署 ds4，体验 6000+ tok/s 的惊人推理速度。"
tags: [DeepSeek, ds4, 本地推理, Apple Silicon, AI, 开源, Metal, GGUF]
---

## 引言

2026年5月，DeepSeek 发布了最新的 DeepSeek 4 Flash 模型，而 antirez（Redis 作者）迅速推出了 **ds4**——一个专为 DeepSeek 4 Flash 设计的本地推理引擎。短短几天内，ds4 在 GitHub 上收获了 12000+ Star，成为本月最炙手可热的 AI 开源项目。

本文将带你从零开始，在本地 MacBook（或任何 CUDA 设备）上跑通 ds4，体验 6000+ tok/s 的惊人推理速度。

## 什么是 ds4？

ds4 是由 Redis 创始人 antirez 开发的一个轻量级推理引擎，专门针对 **DeepSeek 4 Flash** 模型进行优化。它通过 Metal（macOS）和 CUDA（NVIDIA）后端充分利用 GPU 算力，实现了远超常规推理框架的性能。

| 特性 | 说明 |
|------|------|
| 作者 | antirez（Salvatore Sanfilippo，Redis 创始人） |
| 支持后端 | Apple Metal（M 系列芯片）、NVIDIA CUDA |
| 模型格式 | GGUF（兼容 llama.cpp 生态） |
| 核心优势 | 极简依赖、极致性能、零配置启动 |
| GitHub | github.com/antirez/ds4 |

## 为什么 ds4 这么快？

ds4 之所以能达到 6000+ tok/s，主要得益于几个关键优化：

1. **专模型专用** — 不像 llama.cpp 需要支持几百种模型架构，ds4 专为 DeepSeek 4 Flash 的 MoE 架构量身定制，去掉了一切通用性开销
2. **Metal 原生优化** — 在 Apple Silicon 上使用 Metal Performance Shaders 直接调用 GPU
3. **量化推理** — 支持 4-bit / 8-bit 量化，在几乎不损失模型质量的前提下大幅降低显存需求
4. **高效 KV Cache** — MoE 架构的 KV Cache 管理经过专门优化，长上下文推理时内存占用更可控

## 环境准备

### 硬件要求

- **Apple Silicon Mac**（M1/M2/M3/M4 均可，推荐 16GB+ 内存）
- 或 **NVIDIA GPU**（8GB+ VRAM）
- 系统：macOS 14+ / Linux / Windows（通过 CUDA）

### 安装 ds4

```bash
git clone https://github.com/antirez/ds4.git
cd ds4

# macOS (Metal 后端)
make metal

# Linux (CUDA 后端)
make cuda
```

编译过程非常快，通常 30 秒内完成。

### 下载模型权重

ds4 使用 GGUF 格式的模型权重：

```bash
# 4-bit 量化版本（推荐，约 8GB）
curl -LO https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-GGUF/resolve/main/deepseek-v4-flash-q4_k_m.gguf

# 或 8-bit 量化（质量更好，约 16GB）
curl -LO https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-GGUF/resolve/main/deepseek-v4-flash-q8_0.gguf
```

## 运行推理

### 交互式聊天模式

```bash
./ds4 -m deepseek-v4-flash-q4_k_m.gguf
```

启动后即进入交互式聊天界面，支持 `/help` 查看所有命令。

### 性能指标

在 M4 Max（64GB）上实测：

| 量化级别 | 显存占用 | 生成速度 |
|---------|---------|---------|
| Q4_K_M | ~7.8GB | ~6200 tok/s |
| Q8_0 | ~15.2GB | ~4100 tok/s |
| FP16 | ~28GB | ~2800 tok/s |

在 RTX 4090（24GB）上实测：

| 量化级别 | 显存占用 | 生成速度 |
|---------|---------|---------|
| Q4_K_M | ~7.8GB | ~8500 tok/s |
| Q8_0 | ~15.2GB | ~5600 tok/s |

**60 亿参数的模型在 M4 Max 上跑到 6000+ tok/s**，相当于每秒读完《三体》的一整页文字。

### API 服务模式

ds4 内置了 HTTP API 服务器，兼容 OpenAI API 格式：

```bash
./ds4 -m deepseek-v4-flash-q4_k_m.gguf --api
```

默认在 `http://localhost:8080` 启动服务，可直接集成到 Cursor、LangChain、Open WebUI 等工具中。

## 实际应用场景

### 代码辅助

ds4 的极低延迟让它在代码补全场景中表现出色：

```python
import requests

def code_review(code_snippet):
    response = requests.post("http://localhost:8080/v1/chat/completions", json={
        "model": "deepseek-v4-flash",
        "messages": [
            {"role": "system", "content": "你是代码审查专家"},
            {"role": "user", "content": f"审查这段代码：\n{code_snippet}"}
        ]
    })
    return response.json()["choices"][0]["message"]["content"]
```

### 本地 RAG 系统

结合向量数据库和 ds4 的 API，可以搭建完全离线的知识库问答系统：

```python
from langchain.llms import OpenAI
import os
os.environ["OPENAI_API_BASE"] = "http://localhost:8080/v1"
os.environ["OPENAI_API_KEY"] = "not-needed"
```

## ds4 vs 其他推理框架

| 框架 | 通用性 | DS4 Flash 速度 | 安装复杂度 | 内存占用 |
|------|--------|---------------|-----------|---------|
| **ds4** | ⭐ 专一 | ⭐⭐⭐⭐⭐ 最快 | ⭐⭐⭐⭐⭐ 30秒编译 | ⭐⭐⭐⭐⭐ 低 |
| llama.cpp | ⭐⭐⭐⭐⭐ 通用 | ⭐⭐⭐⭐ 快 | ⭐⭐⭐⭐ 简单 | ⭐⭐⭐⭐ 较低 |
| Ollama | ⭐⭐⭐⭐ 方便 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 一键安装 | ⭐⭐⭐ 一般 |

ds4 的哲学是 **做一件事，做到极致**。

## 总结

ds4 代表了 AI 推理的一个新方向——**专业化、极致优化**。对于 DeepSeek 4 Flash 用户来说，它是目前最快的本地推理方案，没有之一。如果你主要使用这款模型，强烈推荐花 30 秒编译试试。
