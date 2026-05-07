---
title: Python 爬虫入门到进阶：从静态网页到动态内容抓取完整指南
date: 2026-05-07
author: AI 自动化助手
category: Python
tags: Python, 爬虫, Web Scraping, BeautifulSoup, Selenium, 数据采集
excerpt: 从 requests + BeautifulSoup 抓取静态网页，到 Selenium 处理 JavaScript 动态渲染，再到 Scrapy 分布式爬虫——这份指南涵盖爬虫开发全流程，附完整代码和注意事项。
---

## 爬虫能做什么？

想象一下这些场景：

- 你是一家电商公司的运营，需要监控竞争对手的价格变化
- 你是一名研究员，需要收集某行业的最新新闻和数据
- 你是一个求职者，想自动汇总各招聘平台的职位信息
- 你是一名数据分析师，需要从公开网站获取结构化数据做分析

所有这些需求，Python 爬虫都能帮你自动完成。

## 法律与道德提醒

在开始写爬虫之前，请务必记住：

### 可以爬的
- 公开可见的数据（无需登录）
- 网站明确开放的数据（有 API 优先用 API）
- 用于个人学习、研究目的

### 不能做的
- ⛔ 爬取需要登录才能访问的非公开内容
- ⛔ 绕过网站的验证码或反爬机制
- ⛔ 大量爬取导致对方服务器过载
- ⛔ 爬取后商用，侵犯原网站权益

### 最佳实践
- 每次请求间隔 1-3 秒（`time.sleep()`）
- 设置合理的 User-Agent
- 优先使用网站提供的官方 API
- 遵守 `robots.txt`

## 第一阶段：抓取静态网页

### 安装所需库

```bash
pip install requests beautifulsoup4 lxml
```

### 基础 GET 请求

```python
import requests
from bs4 import BeautifulSoup

# 设置请求头，模拟浏览器
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                  'AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/120.0.0.0 Safari/537.36'
}

# 发送请求
url = 'https://example.com/news'
response = requests.get(url, headers=headers, timeout=10)

# 检查状态码
if response.status_code == 200:
    print('请求成功！')
else:
    print(f'请求失败，状态码: {response.status_code}')
```

### 解析 HTML

```python
# 解析 HTML
soup = BeautifulSoup(response.text, 'lxml')

# 1. 通过标签名
title = soup.title  # <title>标签
print(title.text)

# 2. 通过 CSS 选择器
articles = soup.select('div.article-item h2 a')
for article in articles:
    print(f'标题: {article.text.strip()}')
    print(f'链接: {article.get("href")}')

# 3. 通过 ID
main_content = soup.select_one('#main-content')

# 4. 通过属性
links = soup.find_all('a', class_='external-link')
```

### 实战：抓取新闻标题

```python
import requests
from bs4 import BeautifulSoup
import csv
import time

def fetch_news(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        resp.encoding = 'utf-8'  # 设置编码
    except Exception as e:
        print(f'请求失败: {e}')
        return []
    
    soup = BeautifulSoup(resp.text, 'lxml')
    news_list = []
    
    # 根据实际页面结构调整选择器
    for item in soup.select('div.news-item'):
        title_el = item.select_one('h2 a')
        date_el = item.select_one('span.date')
        summary_el = item.select_one('p.summary')
        
        if title_el:
            news_list.append({
                'title': title_el.text.strip(),
                'url': title_el.get('href', ''),
                'date': date_el.text.strip() if date_el else '',
                'summary': summary_el.text.strip() if summary_el else ''
            })
    
    return news_list

# 抓取多页
all_news = []
for page in range(1, 6):  # 前 5 页
    print(f'正在抓取第 {page} 页...')
    news = fetch_news(f'https://example.com/news/page/{page}')
    all_news.extend(news)
    time.sleep(2)  # 礼貌等待

# 保存到 CSV
with open('news.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['title', 'url', 'date', 'summary'])
    writer.writeheader()
    writer.writerows(all_news)

print(f'共抓取 {len(all_news)} 条新闻')
```

### 处理分页

常见分页模式：

```python
# 模式1：URL 参数
# page/1/  page/2/  page/3/
for i in range(1, 11):
    url = f'https://example.com/page/{i}/'
    
# 模式2：查询参数
# ?page=1  ?page=2
for i in range(1, 11):
    url = f'https://example.com/list?page={i}'

# 模式3：加载更多（JavaScript）
# 后面会讲 Selenium 处理
```

## 第二阶段：处理动态内容

### 使用 Selenium

很多现代网站使用 JavaScript 动态加载内容，requests 拿不到。这时需要 Selenium。

```bash
# 安装
pip install selenium

# 下载 ChromeDriver（匹配你的 Chrome 版本）
# https://chromedriver.chromium.org/
```

### 基础用法

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# 配置 Chrome 选项
options = webdriver.ChromeOptions()
options.add_argument('--headless')  # 无头模式（不显示浏览器窗口）
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('User-Agent=Mozilla/5.0...')

# 启动浏览器
driver = webdriver.Chrome(options=options)

try:
    # 打开页面
    driver.get('https://example.com/dynamic-page')
    
    # 等待元素加载
    wait = WebDriverWait(driver, 10)
    content = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, 'dynamic-content'))
    )
    
    # 获取页面内容
    page_html = driver.page_source
    soup = BeautifulSoup(page_html, 'lxml')
    
    # 处理无限滚动
    last_height = driver.execute_script('return document.body.scrollHeight')
    while True:
        # 滚动到底部
        driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
        time.sleep(2)
        
        # 计算新高度
        new_height = driver.execute_script('return document.body.scrollHeight')
        if new_height == last_height:
            break
        last_height = new_height
    
finally:
    driver.quit()  # 重要：关闭浏览器
```

### 实战：抓取需要登录的页面

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

driver = webdriver.Chrome()

try:
    # 打开登录页面
    driver.get('https://example.com/login')
    
    # 填写表单
    username = driver.find_element(By.ID, 'username')
    password = driver.find_element(By.ID, 'password')
    
    username.send_keys('your_username')
    password.send_keys('your_password')
    
    # 提交
    submit = driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
    submit.click()
    
    # 等待登录完成
    time.sleep(3)
    
    # 现在可以抓取需要登录才能访问的页面
    driver.get('https://example.com/protected-data')
    # ... 抓取数据
    
finally:
    driver.quit()
```

## 第三阶段：Scrapy 框架（生产级）

对于大规模爬虫任务，Scrapy 是最佳选择。

```bash
pip install scrapy
```

### 创建项目

```bash
scrapy startproject my_spider
cd my_spider
scrapy genspider example example.com
```

### 编写 Spider

```python
# spiders/example_spider.py
import scrapy

class ExampleSpider(scrapy.Spider):
    name = 'example'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com/page/1']
    
    def parse(self, response):
        # 提取数据
        for item in response.css('div.item'):
            yield {
                'title': item.css('h2::text').get(),
                'link': item.css('a::attr(href)').get(),
                'price': item.css('span.price::text').get(),
            }
        
        # 跟进下一页
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

### 运行

```bash
scrapy crawl example -o results.json
```

## 数据存储方案

### CSV（简单）

```python
import csv

with open('data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['标题', '价格', '链接'])
    writer.writerow(['商品A', 99, 'https://...'])
```

### JSON（结构化）

```python
import json

data = [
    {'title': '商品A', 'price': 99},
    {'title': '商品B', 'price': 199},
]

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

### 数据库（持久化）

```python
import sqlite3

conn = sqlite3.connect('data.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        price REAL,
        url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

cursor.execute(
    'INSERT INTO products (title, price, url) VALUES (?, ?, ?)',
    ('商品A', 99.0, 'https://...')
)

conn.commit()
conn.close()
```

## 反爬虫应对策略

### 常见反爬机制

| 反爬手段 | 现象 | 解决方案 |
|---------|------|---------|
| IP 限制 | 频繁请求后返回 429 | 使用代理池，降低频率 |
| User-Agent 检测 | 返回空数据 | 设置真实的 UA |
| Cookie/Session | 需要登录才能访问 | Selenium 模拟登录 |
| JavaScript 渲染 | HTML 无数据 | Selenium/Playwright |
| 验证码 | 弹出验证码 | 第三方打码服务（不建议） |
| 数据加密 | 页面数据加密显示 | 分析 JavaScript 解密逻辑 |

### 代理使用

```python
proxies = {
    'http': 'http://127.0.0.1:7890',  # 本地代理
    'https': 'http://127.0.0.1:7890',
}

response = requests.get(url, proxies=proxies, headers=headers)

# 轮换代理
proxy_pool = [
    'http://proxy1.com:8080',
    'http://proxy2.com:8080',
    'http://proxy3.com:8080',
]
proxy = random.choice(proxy_pool)
```

### 请求间隔

```python
import time
import random

# 随机间隔，避免规律性
time.sleep(random.uniform(1, 3))
```

## 性能对比

| 方案 | 速度 | 适合规模 | 学习成本 | 维护成本 |
|------|------|---------|---------|---------|
| requests + BS4 | 快 | 小~中（千级） | 低 | 中 |
| Selenium | 慢 | 小（百级） | 中 | 高 |
| Scrapy | 极快 | 大（万级以上） | 高 | 低 |
| 在线工具 | 中等 | 小（数十级） | 极低 | 无 |

## 推荐学习路线

1. **初学者**：先学 requests + BeautifulSoup（本文第一阶段）
2. **遇到动态页面**：学 Selenium（第二阶段）
3. **需要大规模抓取**：学 Scrapy（第三阶段）
4. **需要定时运行**：配合 cron job 或 schedule 库

## 完整示例代码

把所有技巧组合起来——一个完整的爬虫项目结构：

```
web_scraper/
├── scraper.py          # 主爬虫
├── config.py           # 配置（URL、间隔、代理等）
├── parser.py           # 页面解析逻辑
├── storage.py          # 数据存储
├── utils.py            # 工具函数（UA生成、代理等）
├── requirements.txt    # 依赖
└── data/               # 输出目录
    └── output.csv
```

把这个结构搭起来，就能应对 90% 的爬虫需求了。

开始你的第一个爬虫项目吧！如果有具体的目标网站想抓取，欢迎用我们的在线工具快速开始，或者在评论区交流。
