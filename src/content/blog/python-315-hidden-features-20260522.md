---
title: "Python 3.15 那些没上头条的特性：TaskGroup 取消、线程安全迭代器、Counter XOR 与不可变 JSON"
date: 2026-05-22
description: "Python 3.15 即将发布，除了 lazy imports 和 tachyon profiler 两大头条特性，还有多个极大改善日常开发体验的小改进——TaskGroup.cancel()、线程安全迭代器三件套、Counter XOR 和 frozendict。这篇文章带你逐一实测盘点。"
tags: [Python,编程,教程,后端开发,asyncio,多线程,技术干货]
---

## 引言

Python 3.15 即将发布，lazy imports 和 tachyon profiler 两大重磅特性已经刷屏各大技术媒体。但如果你只知道这两个大特性，那你就错过了 3.15 版本中许多**每天都在帮开发者省心省力的小改进**。

本文带你逐一盘点和实测这些"没上头条"但极其实用的 Python 3.15 新特性。

> 本文所有代码均可在 Python 3.15.0b1+ 环境中运行测试。

## Asyncio TaskGroup.cancel()：优雅地取消一组协程

### 问题：在 TaskGroup 中"中途退出"有多麻烦？

Python 3.11 引入的 `TaskGroup` 提供了结构化并发。但当你需要**在满足某个条件时取消正在运行的一组任务**时，代码会变得相当绕：

```python
import asyncio
from contextlib import suppress

class Interrupt(Exception):
    pass

async def main():
    with suppress(Interrupt):
        async with asyncio.TaskGroup() as tg:
            tg.create_task(run())
            tg.create_task(run())
            if await wait_for_signal():
                raise Interrupt()
```

这个模式利用了 TaskGroup 的一个特性——在 with 块内抛出异常会自动取消所有子任务。但我们必须自定义一个 `Interrupt` 异常，再用 `contextlib.suppress` 来过滤掉它，代码既不直观也不优雅。

### 解决方案：tg.cancel() 一行搞定

Python 3.15 新增了 `TaskGroup.cancel()` 方法，直接取消整个任务组且不抛出异常：

```python
import asyncio

async def main():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(run())
        tg.create_task(run())
        if await wait_for_signal():
            tg.cancel()  # 优雅取消，无异常抛出
```

简洁、清晰、无黑魔法。如果你的代码中有类似的"提前退出"逻辑，3.15 的这行改动能让代码整洁度提升一个档次。

## Context Manager 作为 Decorator：终于支持 async 和 generator 了

### 背景：一直存在的"双重身份"

Python 3.3 开始，`@contextmanager` 装饰的上下文管理器也可以作为函数装饰器使用：

```python
from contextlib import contextmanager
from time import perf_counter

@contextmanager
def duration(message: str):
    start = perf_counter()
    try:
        yield
    finally:
        print(f"{message} elapsed {perf_counter() - start:.2f} seconds")

@duration('workload')
def workload():
    ...  # 自动计时
```

但长期以来有一个严重限制——**它不支持 async 函数、生成器和 async 生成器**：

```python
@duration('async workload')
async def async_workload():
    ...  # ❌ 只计时了协程创建，没等到执行完成
```

### Python 3.15 的改进

`ContextDecorator` 现在会检查被装饰函数的类型，确保装饰器覆盖函数的完整生命周期：

```python
@duration('async workload')
async def async_workload():
    await asyncio.sleep(1)
    # ✅ 现在正确计时整个异步函数的执行时间

@duration('generator')
def gen_workload():
    for i in range(100):
        yield i
    # ✅ 现在正确计时整个生成器的生命周期
```

这个改动让 `@contextmanager` 成为编写装饰器的最佳实践——比手动写 `functools.wraps` 更简洁，比写类装饰器更安全。

## 线程安全迭代器：告别手动加锁

### 痛点：迭代器不是线程安全的

Python 的迭代器默认不是线程安全的。在多线程环境中消费同一个生成器时，你会遇到数据竞争和内部状态破坏：

```python
def stream_events():
    while True:
        yield blocking_get_event()

events = stream_events()
# 两个线程同时消费 events → 数据错乱！
```

传统的解决方案是用 `queue.Queue` 包装，但这会改变代码架构。

### Python 3.15 三件套

3.15 新增了三个线程安全迭代器工具：

**1. `threading.serialize_iterator`** — 包装任意迭代器为线程安全：

```python
import threading
from concurrent.futures import ThreadPoolExecutor

events = threading.serialize_iterator(stream_events())

with ThreadPoolExecutor() as executor:
    fut1 = executor.submit(consume, events)
    fut2 = executor.submit(consume, events)  # ✅ 线程安全
```

**2. `threading.synchronized_iterator`** — 装饰器版本，直接应用到生成器函数：

```python
@threading.synchronized_iterator
def stream_events():
    while True:
        yield blocking_get_event()
```

**3. `threading.concurrent_tee`** — 类似于 `itertools.tee`，但支持多线程并发消费：

```python
source1, source2 = threading.concurrent_tee(squares(10), n=2)

with ThreadPoolExecutor() as executor:
    executor.submit(consume, source1)
    executor.submit(consume, source2)  # 两个线程互不干扰
```

这三个工具解决了多线程编程中**最常见的迭代器数据竞争问题**。

## Counter 的 XOR 运算：补齐集合操作的最后一块拼图

`collections.Counter` 一直支持 `+`、`-`、`&`、`|` 四种集合运算。3.15 新增了 `^`（异或）操作：

```python
from collections import Counter

c = Counter(a=3, b=1)
d = Counter(a=1, b=2)

print(c ^ d)  # Counter({'a': 2, 'b': 1})
```

异或 = 并集 - 交集，相当于两个 Counter 中**不重叠的计数之和**。

对于数据分析和统计场景来说，补齐这个操作意味着 Counter 现在拥有完整的集合代数支持。

## 不可变 JSON 对象：frozendict + json.loads 新参数

Python 3.15 正式引入了 `frozendict`（不可变字典）。配合 `json.loads` 新增的 `array_hook` 参数，我们可以直接将 JSON 解析为完全不可变的数据结构：

```python
from types import frozendict
import json

result = json.loads(
    '{"a": [1, 2, 3, 4]}',
    array_hook=tuple,
    object_hook=frozendict
)
# result == frozendict({'a': (1, 2, 3, 4)})
```

这个特性对以下场景非常有价值：
- **缓存键**：不可变对象可直接用作 dict 键或 set 元素
- **配置管理**：防止运行时代码意外修改配置字典
- **并发安全**：不可变对象天然线程安全

## 总结

| 特性 | 实用性 | 推荐操作 |
|------|--------|----------|
| TaskGroup.cancel() | ⭐⭐⭐⭐⭐ | 立即替换现有 workaround |
| ContextManager decorator 改进 | ⭐⭐⭐⭐ | 重构现有装饰器代码 |
| 线程安全迭代器 | ⭐⭐⭐⭐⭐ | 多线程项目必用 |
| Counter XOR | ⭐⭐⭐ | 锦上添花 |
| frozendict + array_hook | ⭐⭐⭐⭐ | 配置和缓存场景强烈推荐 |

Python 3.15 的 RC 版本已经可用，生产环境建议等正式版发布后开始测试升级。

---

**延伸阅读：** 如果你对 Python 3.15 的更大特性感兴趣，可以查看 PEP 768（lazy imports）和 tachyon profiler 的详细信息。

**在线工具推荐：** 访问 [zidongai.com.cn](https://zidongai.com.cn) 使用在线 Python 运行环境。
