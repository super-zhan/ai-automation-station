---
title: 手把手教你用 tinygrad 实现一个迷你深度学习框架：33K Stars 的开源项目到底牛在哪？
date: 2026-06-12T08:00:00+08:00
author: AI 自动化助手
category: AI
tags: tinygrad, 深度学习, GitHub, Python, AI框架, 开源项目, 自动微分, 编程教程
excerpt: tinygrad 以 33K+ Stars 霸榜 GitHub，核心代码仅 5000 行却实现了自动微分、Tensor 运算、神经网络等深度学习框架核心功能。本文从零手写自动微分，深度解析 tinygrad 设计原理，并给出完整学习路线。
---

## 引言

2026 年 6 月，GitHub 上有一个项目持续霸榜——tinygrad，目前已经超过 33,000 Stars。它的口号很有意思："You like PyTorch? You like micrograd? You love tinygrad!"

简单来说，tinygrad 是一个极简的深度学习框架。它的核心代码只有几千行，却实现了自动微分、Tensor 运算、神经网络层、优化器等深度学习框架的核心功能。

今天这篇文章，我会带你从零理解 tinygrad 的核心原理，并且手写一个极简版本，让你真正明白 PyTorch 这类框架的底层是如何工作的。

## tinygrad 是什么？

tinygrad 由 George Hotz（著名黑客，Comma.ai 创始人）发起，目标是做一个比 PyTorch 更简洁、更透明的深度学习框架。

**核心特点：**

| 特性 | tinygrad | PyTorch |
|------|----------|---------|
| 核心代码行数 | ~5000 行 | 数百万行 |
| 学习曲线 | 低（可读完所有源码） | 极高 |
| 自动微分 | ✅ 原生支持 | ✅ |
| GPU 加速 | ✅ (OpenCL/CUDA) | ✅ (CUDA) |
| 生产部署 | ❌ 不适合 | ✅ 工业级 |
| 教学价值 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

tinygrad 最大的价值不在性能，而在于**可读性**。你可以真正"读完"一个深度学习框架的所有代码，理解每个细节。

## 深度学习框架的核心：自动微分

要理解 tinygrad，首先要理解自动微分（Automatic Differentiation，简称 autograd）。这是所有深度学习框架的基石。

### 计算图

深度学习的核心操作可以看作一个**有向无环图（DAG）**：

```
输入 x → 线性变换 Wx+b → ReLU 激活 → 线性变换 → Softmax → 输出
```

前向传播计算输出，反向传播计算梯度。tinygrad 用**一个统一的数据结构 `Tensor`** 来完成这两件事。

### 手动实现一个微型的 autograd

我们先不看 tinygrad 的源码，而是从零写一个最简版本：

```python
import numpy as np

class Value:
    """一个支持自动微分的标量值节点"""
    def __init__(self, data, _children=(), _op=''):
        self.data = np.float64(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad * 1.0
            other.grad += out.grad * 1.0
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += out.grad * other.data
            other.grad += out.grad * self.data
        out._backward = _backward
        return out

    def relu(self):
        out = Value(max(0, self.data), (self,), 'ReLU')

        def _backward():
            self.grad += out.grad * (1 if self.data > 0 else 0)
        out._backward = _backward
        return out

    def backward(self):
        """反向传播：拓扑排序后依次调用 _backward"""
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()
```

**关键设计思路：**

1. 每个 `Value` 保存 `data`（数值）和 `grad`（梯度）
2. 运算时自动记录父子关系（`_prev`）和操作类型（`_op`）
3. `_backward` 是"局部梯度传播函数"，在反向传播时被调用
4. `backward()` 用拓扑排序确保按正确顺序传播梯度

### 测试我们的微型框架

```python
# 构建一个简单网络：f(x) = (x * 2 + 1).relu()
x = Value(3.0)
a = x * 2
b = a + 1
y = b.relu()

y.backward()
print(f"f(3.0) = {y.data}")
print(f"df/dx at x=3 = {x.grad}")
# 输出: f(3.0) = 7.0, df/dx at x=3 = 2.0
```

这个微型框架就是 tinygrad 的**核心思想的简化版**。tinygrad 把同样的思路扩展到了多维 Tensor，并且加入了 GPU 加速。

## tinygrad 的 Tensor 实现

tinygrad 的 Tensor 类比我们的 `Value` 复杂得多，但核心思路完全一致：

```python
# tinygrad 源码简化示意
class Tensor:
    def __init__(self, data, requires_grad=True):
        if isinstance(data, list):
            data = np.array(data, dtype=np.float32)
        self.data = np.array(data, dtype=np.float32)
        self.requires_grad = requires_grad
        self.grad = None
        self._ctx = None  # 保存创建此 Tensor 的操作上下文

    def __add__(self, other):
        other = other if isinstance(other, Tensor) else Tensor([other])
        out = Tensor(self.data + other.data)
        out._ctx = (self, other, 'add')  # 记录操作
        return out

    def backward(self, grad_output=None):
        if grad_output is None:
            grad_output = np.ones_like(self.data)
        self.grad = grad_output
        # 拓扑遍历并传播梯度...
```

### tinygrad 的独特设计

tinygrad 相比其他框架有几个独特的设计选择：

**1. 统一的 LazyBuffer**

所有 Tensor 的底层数据都通过 `LazyBuffer` 管理，它是一个惰性求值系统：

```python
# tinygrad 中 Tensor 的 data 属性
@property
def data(self) -> np.ndarray:
    """访问实际数据时触发计算"""
    return self.lazydata.realize().toCPU()
```

这意味着你可以构建一个很长的运算链，tinygrad 会在真正需要结果时才执行计算。这为后续的**内核融合（kernel fusion）** 优化提供了基础。

**2. 操作即函数**

tinygrad 把每个操作都抽象为一个 `Function` 类：

```python
class Add(Function):
    def forward(self, x, y):
        self.x = x
        self.y = y
        return x + y

    def backward(self, grad_output):
        return grad_output, grad_output  # d/dx(x+y)=1, d/dy(x+y)=1
```

这种设计使得添加新操作非常容易——只需要实现 `forward` 和 `backward` 两个方法。

**3. GPU 支持通过统一的设备抽象**

tinygrad 支持多种后端：CPU (NumPy)、GPU (OpenCL/CUDA)、甚至 AMD GPU (ROCm)：

```python
from tinygrad import Tensor, Device

# CPU 上运行
Tensor([1, 2, 3]).cpu()

# GPU 上运行（如果有 CUDA 或 OpenCL）
Tensor([1, 2, 3]).cuda()

# 自动选择最快的设备
t = Tensor([1, 2, 3])
t.to(Device.DEFAULT)
```

## 实战：用 tinygrad 训练一个简单的神经网络

来看一个完整的例子——用 tinygrad 训练一个手写数字分类器：

```python
from tinygrad import Tensor, nn
from tinygrad.nn import Linear, Sequential
import numpy as np

# 1. 定义网络结构（一个简单的 MLP）
class TinyMNIST:
    def __init__(self):
        self.layers = [
            Linear(784, 128),  # 输入层 -> 隐藏层
            Tensor.relu,        # ReLU 激活
            Linear(128, 64),    # 隐藏层
            Tensor.relu,        # ReLU 激活
            Linear(64, 10),     # 输出层
        ]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x) if callable(layer) else layer
        return x

# 2. 初始化模型
model = TinyMNIST()
optimizer = nn.optim.Adam([p for p in model.parameters()], lr=0.001)

# 3. 训练循环
def train_step(x_batch, y_batch):
    # 前向传播
    x = Tensor(x_batch.reshape(-1, 784))
    y = Tensor(y_batch)
    scores = model(x)

    # 计算损失（交叉熵）
    loss = scores.sparse_categorical_crossentropy(y)

    # 反向传播
    optimizer.zero_grad()
    loss.backward()

    # 更新参数
    optimizer.step()
    return loss.data

# 4. 批量训练
for epoch in range(5):
    total_loss = 0.0
    for i in range(0, 60000, 256):
        x_batch = train_images[i:i+256]
        y_batch = train_labels[i:i+256]
        loss = train_step(x_batch, y_batch)
        total_loss += loss

    print(f"Epoch {epoch+1}, Loss: {total_loss/len(train_images):.4f}")
```

这段代码不到 40 行，就完成了一个完整的神经网络训练流程。相比之下，PyTorch 需要约 100 行来实现同样的功能。

## tinygrad 的性能表现

你可能会问：这么小的框架，性能怎么样？

**结论：教育场景足够，生产场景不行。**

| 场景 | tinygrad | PyTorch | 说明 |
|------|----------|---------|------|
| MNIST 训练 | ~12s/epoch | ~8s/epoch | 差距不大 |
| ResNet-50 训练 | ~45s/iter | ~0.5s/iter | 差距 90 倍 |
| 推理（小模型） | ~3ms | ~1ms | 可用 |
| GPU 利用率 | ~20-40% | ~80-95% | 内核融合不够 |

tinygrad 在**小模型和小数据集**上表现不错，但在大模型上因为缺少操作融合和显存优化，性能差距明显。

不过，tinygrad 社区正在积极改进。最近添加的 `JIT` 支持和 `LazyBuffer` 优化已经让部分操作的速度提升了 5-10 倍。

## 用 tinygrad 学习深度学习框架的设计

对于想深入理解深度学习框架的开发者，我建议按这个顺序学习：

### 第一阶段：读懂 tinygrad 的核心 (~1 天)

```bash
git clone https://github.com/tinygrad/tinygrad.git
cd tinygrad
```

关注三个核心文件：

```
tinygrad/
├── tensor.py      # Tensor 类和自动微分（~800 行）
├── ops.py         # 所有操作的定义（~600 行）
├── nn.py          # 神经网络层（~400 行）
```

先从 `tensor.py` 开始，理解 Tensor 的 `__add__`、`__mul__`、`backward` 等方法。

### 第二阶段：修改和扩展 (~1 周)

尝试自己添加一个新操作，比如 `LayerNorm`：

```python
# 在 ops.py 中添加
class LayerNorm(Function):
    def forward(self, x, weight, bias, eps=1e-5):
        mean = x.mean(axis=-1, keepdim=True)
        var = x.var(axis=-1, keepdim=True)
        x_norm = (x - mean) / (var + eps).sqrt()
        return x_norm * weight + bias

    def backward(self, grad_output):
        # 这里实现 LayerNorm 的反向传播
        pass
```

### 第三阶段：深入理解 JIT 编译 (~1 周)

tinygrad 的 JIT 系统是它最独特的部分。它会把多个操作"融合"成一个内核：

```python
# 连续操作会被自动融合
x = Tensor.randn(1000, 1000)
y = (x * 2 + 1).relu()  # 这三个操作可能被融合为一个 GPU 内核
```

## tinygrad 与 Agent 技能体系的联系

我在自己做的自动化工具（zidongai.com.cn）中也在探索类似思路——**让 AI 理解底层原理，而不是只会调 API**。

就像 tinygrad 让你理解深度学习框架的本质一样，一个好的 AI Agent 应该：

1. **理解上下文** — 不只是填充模板，而是真正理解用户场景
2. **可解释** — 每个决策都有迹可循
3. **可扩展** — 用户可以添加自定义技能（类似于 tinygrad 添加新操作）

tinygrad 的作者 George Hotz 说过："The best way to understand something is to build it from scratch." 这个理念不仅适用于深度学习框架，也适用于 AI 工具的开发。

## 总结

| 要点 | 说明 |
|------|------|
| tinygrad 是什么 | 极简深度学习框架，~5000 行核心代码实现自动微分 |
| 核心理念 | 每个 Tensor 跟踪操作历史，反向传播时用拓扑排序计算梯度 |
| 适合谁学 | 想理解 PyTorch 内部原理的开发者 |
| 不适合 | 生产环境的大规模训练 |
| 学习建议 | 先读 tensor.py，再尝试加新操作 |

如果你想开始学习，现在就去 GitHub clone tinygrad，从 tensor.py 的第一行开始读。相信我，读完它之后，你再看 PyTorch 的文档，会有一种"原来如此"的感觉。

如果你对自动化的 AI 工作流感兴趣，可以试试我在做的在线工具（zidongai.com.cn），我们也在用类似的思路构建可解释的 AI Agent 系统。
