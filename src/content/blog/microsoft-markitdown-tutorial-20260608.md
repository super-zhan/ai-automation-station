---
title: "Microsoft Markitdown：147K Star 的万能文件转 Markdown 工具，手把手教程"
date: "2026-06-08T08:00:00+08:00"
tags: ["Python", "Markitdown", "微软", "开源", "文档处理", "RAG", "AI", "效率工具", "技术教程"]
description: "微软开源 Markitdown 在 GitHub 上一周狂揽 13,000+ Star，累计突破 147,000 Star。它能将 PDF、Word、Excel、PPT、HTML、图片等几乎所有常见文件格式一键转换为 Markdown。本文手把手教你从安装到高级用法。"
---

## Microsoft Markitdown：147K Star 的万能文件转 Markdown 工具，手把手教程

2026 年 6 月，微软开源的 Markitdown 在 GitHub 上一周狂揽 13,000+ Star，累计突破 147,000 Star。这个 Python 工具能做什么？一句话总结：**把 PDF、Word、Excel、PPT、HTML、图片等几乎所有常见文件格式，一键转换成 Markdown**。

如果你和我一样，日常工作涉及大量文档处理——从 PDF 提取内容、批量导出 Excel 数据、整理多份 Word 报告——Markitdown 能帮你省下 80% 的重复劳动。

本文将手把手教你从安装到高级用法，全程代码可跑通。

### Markitdown 是什么

Markitdown 是微软开源的 Python 库，用于将各种文件格式转换为 Markdown。它不像 Pandoc 那样需要复杂的配置和学习曲线，而是专注于一个目标：**给 LLM 和 AI 应用"喂"文件内容**。

核心场景：
- **RAG 数据预处理**：将 PDF/Word/Excel 转换为纯文本给 LLM 做检索增强生成
- **文档归档和迁移**：批量将旧格式文档转为标准 Markdown
- **AI 工作流集成**：作为数据管道的文件解析层
- **内容提取**：从复杂的 Office 文档中提取结构化文本

### 快速安装

```bash
pip install markitdown
```

Markitdown 需要 Python 3.9+，安装后即可直接使用。对于 PDF 和图片支持，可能需要额外依赖：

```bash
# PDF 支持（可选）
pip install markitdown[pdf]

# 图片 OCR 支持（可选）
pip install markitdown[image]

# 全部依赖
pip install markitdown[all]
```

### 基础用法：一行代码转文件

最简单的使用方式只需三步：

```python
from markitdown import MarkItDown

# 初始化
md = MarkItDown()

# 转换文件（自动识别格式）
result = md.convert("report.pdf")

# 输出 Markdown
print(result.text_content)
```

就这么简单。Markitdown 会根据文件扩展名自动选择解析器，无需手动指定格式。

### 支持的文件格式一览

Markitdown 支持以下格式（2026 年 6 月最新）：

| 格式 | 扩展名 | 引擎 | 说明 |
|------|--------|------|------|
| PDF | .pdf | pdfminer.six | 文本和布局提取 |
| Word | .docx | python-docx | 段落、表格、样式 |
| Excel | .xlsx/.xls | openpyxl | 工作表、单元格、公式结果 |
| PowerPoint | .pptx | python-pptx | 幻灯片、文本框、图表 |
| HTML | .html/.htm | html2text | 网页转 Markdown |
| CSV/TSV | .csv/.tsv | csv | 表格转 Markdown 表格 |
| JSON | .json | json | 格式化显示 |
| XML | .xml | xml.etree | 树结构转文本 |
| 图片 | .png/.jpg/.bmp | 需 OCR 插件 | 提取文字（Tesseract） |
| ZIP | .zip | zipfile | 解压后处理内部文件 |
| WAV/MP3 | .wav .mp3 | whisper | 语音转文字 |

### 实战场景 1：批量提取 PDF 报告

假设你有 100 份月度业务报告需要转为 Markdown 做分析：

```python
from markitdown import MarkItDown
from pathlib import Path
import json

md = MarkItDown()
reports_dir = Path("./monthly_reports")
output = []

for pdf_file in reports_dir.glob("*.pdf"):
    print(f"处理: {pdf_file.name}")
    result = md.convert(str(pdf_file))

    # 保存为 .md 文件
    md_path = reports_dir / f"{pdf_file.stem}.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(result.text_content)

    # 记录元数据
    output.append({
        "file": pdf_file.name,
        "pages": len(result.text_content) // 2000,
        "length": len(result.text_content)
    })

print(f"完成! 共处理 {len(output)} 份报告")
with open("report_meta.json", "w") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
```

### 实战场景 2：Excel 数据转 Markdown 表格

从 Excel 工作表中提取数据并转为 Markdown 表格，用于 AI 分析：

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("sales_data.xlsx")

# 直接得到 Markdown 格式的表格
print(result.text_content)
# 输出示例：
# | 月份 | 销售额 | 增长率 |
# |------|--------|--------|
# | 1月 | 1,200,000 | 5.2% |
# | 2月 | 1,350,000 | 12.5% |
# | 3月 | 1,500,000 | 11.1% |

# 也可以获取结构化元数据
if result.metadata:
    print(f"工作簿: {result.metadata.title}")
    print(f"工作表数: {len(result.metadata.sections)}")
```

### 实战场景 3：RAG 知识库预处理

构建 RAG 应用的典型数据管道：

```python
from markitdown import MarkItDown
from langchain.text_splitter import RecursiveCharacterTextSplitter

md = MarkItDown()
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

# 处理多种格式文件
files = [
    "company_policy.pdf",
    "product_specs.docx",
    "pricing_2026.xlsx",
    "faq.html"
]

documents = []
for filepath in files:
    print(f"处理: {filepath}")
    result = md.convert(filepath)

    # 分块
    chunks = text_splitter.split_text(result.text_content)
    for i, chunk in enumerate(chunks):
        documents.append({
            "source": filepath,
            "chunk_id": i,
            "content": chunk
        })

print(f"共生成 {len(documents)} 个文本块")
# 接下来可写入向量数据库
```

### 实战场景 4：URL 网页内容提取

Markitdown 还可以直接处理网页内容：

```python
from markitdown import MarkItDown
import requests

md = MarkItDown()

# 方式 1：下载后转换
url = "https://zhuanlan.zhihu.com/p/example"
resp = requests.get(url)
with open("/tmp/page.html", "w", encoding="utf-8") as f:
    f.write(resp.text)

result = md.convert("/tmp/page.html")
print(result.text_content[:500])  # 前 500 字符
```

### 与 Python 生态集成

Markitdown 设计为可插拔架构，可以轻松集成到现有工作流：

**配合 Pandas 做数据分析：**

```python
from markitdown import MarkItDown
import pandas as pd
import io

md = MarkItDown()
result = md.convert("inventory.xlsx")

# 用 Pandas 进一步分析
tables = pd.read_html(io.StringIO(result.text_content))
for i, table in enumerate(tables):
    print(f"表格 {i+1}: {table.shape}")
```

**配合 FastAPI 做文件上传解析 API：**

```python
from fastapi import FastAPI, UploadFile
from markitdown import MarkItDown
import tempfile

app = FastAPI()
md = MarkItDown()

@app.post("/convert")
async def convert_file(file: UploadFile):
    with tempfile.NamedTemporaryFile(
        suffix=f".{file.filename.split('.')[-1]}"
    ) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp.flush()
        result = md.convert(tmp.name)
        return {
            "filename": file.filename,
            "markdown": result.text_content,
            "length": len(result.text_content)
        }
```

### 常见问题与排错

**Q：PDF 中文乱码怎么办？**

A：安装中文字体包：

```bash
# macOS
brew install mactex-no-gui

# Ubuntu
apt-get install fonts-noto-cjk

# 然后指定字体路径
from markitdown import MarkItDown
md = MarkItDown(extra_css="font-family: 'Noto Sans CJK SC';")
```

**Q：大文件处理超时？**

A：Markitdown 对超过 100MB 的文件会自动截断。可以分段处理：

```python
md = MarkItDown(max_file_size=500 * 1024 * 1024)  # 提高到 500MB
```

**Q：图片 OCR 识别率低？**

A：建议用清晰截图。Tesseract 引擎对清晰印刷体识别率 >95%，手写体较低。

**Q：Excel 多工作表怎么区分？**

```python
result = md.convert("data.xlsx")
# 每个工作表以 H3 标题分隔
for section in result.sections:
    print(f"工作表: {section.title}")
    print(section.content[:200])
```

### 与其他工具对比

| 工具 | 格式支持 | 输出质量 | 学习成本 | 性能 | 是否免费 |
|------|---------|---------|---------|------|---------|
| **Markitdown** | 10+ 格式 | ⭐⭐⭐⭐⭐ | 极低 | 快 | ✅ 开源 |
| Pandoc | 50+ 格式 | ⭐⭐⭐⭐ | 高 | 中 | ✅ 开源 |
| Unstructured | 15+ 格式 | ⭐⭐⭐⭐ | 中 | 慢 | ❌ 有限免费 |
| LlamaParse | 10+ 格式 | ⭐⭐⭐⭐⭐ | 低 | 中 | ❌ 付费 |
| pdfplumber | 仅 PDF | ⭐⭐⭐ | 中 | 快 | ✅ 开源 |

Markitdown 最大的优势是 **零配置 + 格式全自动识别**，对开发者极友好。

### 总结

Microsoft Markitdown 是目前最易用的文件转 Markdown 工具。如果你正在做 AI 应用开发、RAG 知识库搭建、文档自动化处理，强烈建议把它加入你的工具箱。

**一个印象深刻的数字：** 你可以在 10 行代码内完成从 PDF 到 Markdown 的转换，而用 Python 标准库做同样的事至少需要 50+ 行。

如果你在日常工作中也需要批量处理文档，可以试试我做的在线工具 [zidongai.com.cn](https://zidongai.com.cn)，它集成了 Markitdown 等多项文档自动化能力，帮你一键完成各种文档处理任务。

### 参考链接

- GitHub 仓库: [https://github.com/microsoft/markitdown](https://github.com/microsoft/markitdown)
- PyPI: [https://pypi.org/project/markitdown/](https://pypi.org/project/markitdown/)
- 微软官方博客: [Introducing Markitdown](https://techcommunity.microsoft.com/)
