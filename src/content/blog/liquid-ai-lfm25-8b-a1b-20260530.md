---
title: Liquid AI 发布 LFM2.5-8B-A1B：38T 训练的 8B MoE 模型，128K 上下文，笔记本就能跑 55+ tok/s
date: 2026-05-30
author: zidongai
category: AI 模型
tags: Liquid AI, MoE, 边缘计算, 本地部署, AI模型, LLM
excerpt: Liquid AI 于 2026 年 5 月 28 日发布 LFM2.5-8B-A1B，一款 8.5B 总参数、1.5B 活跃参数的稀疏 MoE 模型，训练数据从 12T 扩至 38T tokens，上下文从 32K 扩至 128K。IFEval 91.84%，AIME25 62.80%，M4 MacBook Pro 上推理速度 55-73 tok/s。
---

# Liquid AI 发布 LFM2.5-8B-A1B：38T 训练的 8B 稀疏 MoE 模型，128K 上下文，笔记本就能跑

2026 年 5 月 28 日，Liquid AI 正式发布了 LFM2.5-8B-A1B，一款专为**边缘设备**设计的高效 MoE（Mixture-of-Experts）模型。仅 8B 总参数、1B 活跃参数的模型在 IFEval 上达到 91.84%，在 AIME25 上达到 62.80%，性能可与 Llama 4 Scout 等 17B 以上模型正面竞争。

## 核心规格

| 参数 | 数值 |
|------|------|
| 总参数量 | 8.5B |
| 活跃参数量 | 1.5B |
| 上下文窗口 | 128,000 tokens |
| 词表大小 | 128,000 |
| 预训练数据 | 38.4T tokens |
| 激活参数比例 | ~17.6% |
| 架构 | MoE + GQA + gated short convolution |

相比前代 LFM2-8B-A1B，新版从 12T 扩展到 38T 预训练数据，上下文从 32K 扩展到 128K，词表从 65,536 扩展到 128,000——后者显著提升了非拉丁语系的 token 化效率。

## 推理优先架构

LFM2.5-8B-A1B 最大的架构变化是：它不再直接输出答案，而是先产出一个**显式思维链 (Chain of Thought)**，再给出最终答案。MoE 模型通常在计算受限场景中运行，活跃参数少意味着每个推理 token 的代价很低，因此生成思维链几乎不增加延迟，却能显著提升质量。

从基准测试看，非幻觉率从 7.46% 跃升至 63.47%，提升了 56 个百分点。

## 基准测试

### 指令遵循

| 基准 | 前代 | 新版 | 提升 |
|------|:---:|:---:|:---:|
| IFEval | 79.44 | **91.84** | +12.40 |
| IFBench | 26.00 | **56.47** | +30.47 |
| Multi-IF | 58.54 | **79.93** | +21.39 |

IFEval 91.84% 可对标 GPT-4（85-88%）和 Llama 4 Scout（~89%）。

### 数学推理

| 基准 | 前代 | 新版 | 提升 |
|------|:---:|:---:|:---:|
| MATH500 | 74.80 | **88.76** | +13.96 |
| AIME25 | 10.00 | **62.80** | +52.80 |

## 架构详解

LFM2.5-8B-A1B 组合了三种关键技术：

1. **MoE** — 仅激活 1.5B 参数中的 8.5B
2. **GQA** — 多个 query 共享 KV cache，降低内存
3. **Gated Short Convolution** — 增强局部模式捕捉

三者组合在 M4 MacBook Pro 上可达 **55-73 tok/s**，比 Llama 3.2 3B 快约 40%。

## 部署方式

```bash
# llama.cpp
./llama-cli -m LFM2.5-8B-A1B-Q4_K_M.gguf -p "Hello" -ngl 99

# MLX（Apple Silicon）
mlx_lm.generate --model liquid-ai/LFM2.5-8B-A1B --max-tokens 1024

# vLLM
vllm serve liquid-ai/LFM2.5-8B-A1B --max-model-len 128000
```

## Tool Calling 能力

BFCL 综合得分 **93.19%**，适合构建本地 agentic 应用。

## 总结

LFM2.5-8B-A1B 代表了 AI 发展的重要趋势：不是一味追求参数规模，而是追求在有限算力下的最佳性能。推理模型 + MoE 的组合被证明有效，1.5B 活跃参数打平 17B 模型。

**MoE + 推理模型的组合，可能是端侧 AI 的正确方向。**

---

*参考链接：*
- [Liquid AI Official Blog](https://www.liquid.ai/models)
- [Hugging Face: LFM2.5-8B-A1B](https://huggingface.co/liquid-ai)
- [zidongai.com.cn](/)
