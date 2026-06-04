---
title: "Stanford CS336：从零构建语言模型，6周带你写出自己的 LLM"
date: 2026-06-02
description: "斯坦福大学 2026 春季开设 CS336: Language Modeling from Scratch 课程，要求学生从零实现 BPE Tokenizer、Transformer 架构、Triton FlashAttention 和分布式训练。本文深度解读课程设计思路、六个作业的核心内容和对 AI 开发者的自学建议。"
tags: [AI,大模型,Transformer,深度学习,斯坦福,LLM,技术教程,工程化]
---

## 引言

2026 年春季，斯坦福大学开设了一门全新的课程 **CS336: Language Modeling from Scratch**，由 Tatsunori Hashimoto 和 Percy Liang 联合授课。这门课的理念很直接——像操作系统课程让学生写一个完整 OS 一样，CS336 要求学生从零构建一个完整的语言模型，包括数据收集、模型架构、训练到部署的全流程。

课程在 Hacker News 上获得了 340+ 分的热度，社区反响强烈。本文带你深入了解这门课的设计思路和核心内容。

## 课程定位：把黑盒拆开

大多数深度学习课程教学生如何使用预训练模型调参、微调、做推理。CS336 反过来——它假设你什么都不要，从裸数据开始造轮子。

这不是一门"讲概念"的课。课程页面明确标注了前置要求：

- **熟练掌握 Python**（代码量远超其他 AI 课）
- **熟悉 PyTorch 和深度学习系统优化**（内存层次结构、GPU 算子）
- **线性代数、概率论、机器学习基础**

而且这是 **5 学分** 的课。言下之意：如果你的日常还有其他课要上，恐怕时间不够。

## Assignment 1：从零实现 Transformer

第一个作业就把门槛拉满了：

1. **Tokenizer**：实现 BPE（Byte Pair Encoding）分词器，处理原始文本数据
2. **模型架构**：实现完整的 Transformer（Multi-Head Attention、Feed-Forward、LayerNorm、Positional Encoding）
3. **优化器**：实现 AdamW 优化器
4. **训练循环**：在小规模数据集上完成训练

这个阶段的目标是让学生理解 Transformer 的每一个组件如何工作。**没有 HuggingFace，没有 PyTorch Lightning，没有现成的 Trainer**——你写的就是框架。

```python
# 学生需要自己实现的 Attention（简化示例）
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int):
        super().__init__()
        self.n_heads = n_heads
        self.d_head = d_model // n_heads
        self.w_q = nn.Linear(d_model, d_model)
        self.w_k = nn.Linear(d_model, d_model)
        self.w_v = nn.Linear(d_model, d_model)
        self.w_o = nn.Linear(d_model, d_model)

    def forward(self, x, mask=None):
        B, T, C = x.shape
        q = self.w_q(x).view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        k = self.w_k(x).view(B, T, self.n_heads, self.d_head).transpose(1, 2)
        v = self.w_v(x).view(B, T, self.n_heads, self.d_head).transpose(1, 2)

        attn = q @ k.transpose(-2, -1) / (self.d_head ** 0.5)
        if mask is not None:
            attn = attn.masked_fill(mask == 0, float('-inf'))
        attn = F.softmax(attn, dim=-1)

        out = (attn @ v).transpose(1, 2).contiguous().view(B, T, C)
        return self.w_o(out)
```

## Assignment 2：系统优化 — 自己写 FlashAttention

第二个作业进入系统优化层面。在前一个作业的基础上：

1. **Profiling**：用 PyTorch Profiler 分析和基准测试模型的每一层
2. **Triton FlashAttention2**：用 OpenAI Triton 语言自己实现 FlashAttention2 内核
3. **分布式训练**：实现支持多 GPU 并行训练的内存高效版本

这是 CS336 的独特之处——大多数课程只讲怎么用模型，但这门课让学生深入到 CUDA kernel 级别去理解 attention 的计算模式。

```python
# 学生用 Triton 实现的 FlashAttention2（简化示意）
@triton.jit
def flash_attn_fwd_kernel(
    q_ptr, k_ptr, v_ptr, o_ptr,
    stride_qh, stride_qt, stride_qd,
    stride_kh, stride_kt, stride_kd,
    stride_vh, stride_vt, stride_vd,
    stride_oh, stride_ot, stride_od,
    T, D: tl.constexpr, BLOCK_T: tl.constexpr, BLOCK_D: tl.constexpr,
):
    # Triton kernel 实现 FlashAttention 的分块计算
    # 通过 tiling 避免完整注意力矩阵的内存开销
    ...
```

## Assignment 3：Scaling — 理解规模效应

第三个作业聚焦于理解和验证 LLM 的 Scaling 规律：

1. 在不同规模的模型（Small / Medium / Large）上训练
2. 验证 Chinchilla 法则：在给定计算预算下，模型参数和训练 token 的最优比例
3. 分析和可视化 Scaling 曲线

这个阶段的实验直接验证了 Kaplan et al. (2020) 和 Hoffmann et al. (2022) 的 Scaling Law 论文。

## 为什么这门课值得关注

### 1. 填补了"会用"和"会造"之间的空白

目前大部分开发者处于两个极端：要么只会 `from transformers import AutoModel`，要么是工业界做预训练的大厂研究员。CS336 瞄准的是中间地带——让你理解 LLM 的内部机制，达到可以自己训练小模型、调优训练流程的水平。

### 2. 系统 + ML 的交叉训练

这不是一门纯 ML 课。它要求你写 Triton kernel、做分布式训练、分析和优化内存带宽。这种 ML + Systems 的交叉能力正是目前 AI 人才市场上最稀缺的。

### 3. 对抗"框架黑盒化"

随着 HuggingFace 等工具链的成熟，进入 AI 领域的门槛降低了，但开发者也越来越不理解底层原理。CS336 的设计理念是**知其所以然**——即使最终你还是用 HuggingFace 和 PyTorch，但你知道每一行代码背后对应的是什么。

## 对中国开发者的自学建议

CS336 的课程资源在 GitHub 上公开（github.com/stanford-cs336），这也是它上 Hacker News 榜首的原因之一。对于无法选修这门课的中国开发者来说，完全可以按照课程大纲自学：

| 阶段 | 内容 | 建议时间 |
|------|------|---------|
| Phase 1 | 实现 BPE Tokenizer + DataLoader | 1 周 |
| Phase 2 | 从零实现 Transformer（Attention + FFN + LayerNorm） | 2 周 |
| Phase 3 | 训练循环 + 小规模验证 | 1 周 |
| Phase 4 | 用 Triton 实现 FlashAttention | 2 周 |
| Phase 5 | 分布式训练（DDP/FSDP） | 1 周 |
| Phase 6 | Scaling Law 实验分析 | 1 周 |

如果你正在做 AI 应用开发，不必完全复刻全部作业，但至少理解 Transformer 的内部实现原理——这能在你调试模型行为、选择合适的预训练模型、甚至设计新的模型架构时提供底层直觉。

## 总结

CS336 不是一门"轻松的"课。它要求你写大量代码、理解 GPU 架构、分析系统性能。但正是这种"从零开始"的硬核方式，才能培养出真正理解语言模型的工程师和研究者。

- 课程主页：[cs336.stanford.edu](https://cs336.stanford.edu/)
- GitHub：[github.com/stanford-cs336](https://github.com/stanford-cs336)
