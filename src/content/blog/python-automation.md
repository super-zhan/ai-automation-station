---
title: Python 自动化办公入门：5 个脚本解决日常重复工作
date: 2026-03-18
author: AI 自动化助手
category: Python自动化
tags: Python, 自动化, 办公, 脚本
excerpt: 如果你每天花 1 小时以上做重复性的办公操作，这 5 个 Python 脚本可以帮你把时间省下来。附完整代码，复制即用。
---

作为程序员，最不能忍的事情之一就是**重复性手工操作**。

但很多非技术同事——甚至一些开发者在处理数据时——仍然在用最原始的方式：手动复制粘贴、一个一个文件打开另存为、肉眼对比数据差异。

这篇文章分享 5 个最实用的办公自动化脚本，覆盖日常工作中最常见的重复场景。

## 脚本 1：批量重命名文件

```python
import os

def batch_rename(directory, prefix, extension=None):
    """批量重命名文件，添加前缀"""
    files = os.listdir(directory)
    for i, f in enumerate(files, 1):
        if extension and not f.endswith(extension):
            continue
        name, ext = os.path.splitext(f)
        new_name = f"{prefix}_{i:03d}{ext}"
        os.rename(
            os.path.join(directory, f),
            os.path.join(directory, new_name)
        )
    print(f"已重命名 {len(files)} 个文件")

# 使用：给 downloads 文件夹下所有 .jpg 文件加上前缀
batch_rename("./downloads", "photo", ".jpg")
```

## 脚本 2：合并多个 CSV 文件

```python
import pandas as pd
import glob

def merge_csv(pattern, output="merged.csv"):
    """合并符合匹配规则的所有 CSV 文件"""
    files = glob.glob(pattern)
    if not files:
        print("未找到匹配的文件")
        return

    dfs = [pd.read_csv(f) for f in files]
    merged = pd.concat(dfs, ignore_index=True)
    merged.to_csv(output, index=False)
    print(f"合并完成：{len(files)} 个文件 → {output}")
    print(f"总行数：{len(merged)}")

# 使用：合并所有销售报表
merge_csv("sales_*.csv")
```

## 脚本 3：自动整理文件夹

```python
import os
import shutil
from pathlib import Path

EXTENSION_MAP = {
    '图片': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    '文档': ['.pdf', '.doc', '.docx', '.xlsx', '.pptx'],
    '压缩包': ['.zip', '.rar', '.7z', '.tar.gz'],
    '代码': ['.py', '.js', '.ts', '.html', '.css', '.json'],
    '视频': ['.mp4', '.avi', '.mkv', '.mov'],
}

def organize_downloads(folder):
    """按文件类型自动归类到子文件夹"""
    folder = Path(folder)
    for f in folder.iterdir():
        if f.is_file():
            moved = False
            for dir_name, exts in EXTENSION_MAP.items():
                if f.suffix.lower() in exts:
                    dest = folder / dir_name
                    dest.mkdir(exist_ok=True)
                    shutil.move(str(f), str(dest / f.name))
                    moved = True
                    break
            if not moved:
                other = folder / '其他'
                other.mkdir(exist_ok=True)
                shutil.move(str(f), str(other / f.name))

    print("整理完成！")

# 使用：整理下载文件夹
organize_downloads("~/Downloads")
```

## 脚本 4：批量压缩图片

```python
from PIL import Image
import os

def compress_images(folder, quality=85):
    """批量压缩文件夹内的所有图片"""
    for f in os.listdir(folder):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')):
            path = os.path.join(folder, f)
            img = Image.open(path)
            # 保持宽高比，最长边不超过 1920px
            max_size = 1920
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = tuple(int(d * ratio) for d in img.size)
                img = img.resize(new_size, Image.LANCZOS)

            output = path  # 覆盖原文件
            if f.lower().endswith('.png'):
                img.save(output, optimize=True)
            else:
                img.save(output, quality=quality, optimize=True)

            old_size = os.path.getsize(path) / 1024
            print(f"已压缩：{f} ({old_size:.1f} KB)")

# 使用
compress_images("./screenshots")
```

## 脚本 5：定期备份配置文件

```python
import shutil
import datetime
import os
from pathlib import Path

def backup_files(source, dest, extensions=None):
    """备份指定目录下的文件，按日期归档"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d")
    backup_dir = Path(dest) / f"backup_{timestamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)

    count = 0
    for f in Path(source).rglob("*"):
        if f.is_file():
            if extensions and f.suffix not in extensions:
                continue
            rel_path = f.relative_to(source)
            target = backup_dir / rel_path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, target)
            count += 1

    # 打包成压缩包
    archive_name = str(backup_dir)
    shutil.make_archive(archive_name, 'zip', backup_dir)
    shutil.rmtree(backup_dir)

    print(f"备份完成：{count} 个文件 → {archive_name}.zip")

# 使用：备份所有 .env 和 .yaml 配置文件
backup_files("./config", "./backups", ['.env', '.yaml', '.yml', '.json'])
```

## 怎么运行这些脚本

如果你不是 Python 开发者，也别担心：

1. **安装 Python**：去 python.org 下载安装（勾选"Add to PATH"）
2. **安装依赖**：`pip install pandas pillow`
3. **把脚本保存为 .py 文件**
4. **运行**：`python 脚本名.py`

或者更简单——直接使用在线工具处理，不用装任何东西。

## 总结

这 5 个脚本可以覆盖你日常工作中 80% 的重复性文件操作。把脚本保存起来，每天执行一次，能省下大量时间。

真正高效的程序员，不是跑得快，而是懂得把重复的事情交给代码。
