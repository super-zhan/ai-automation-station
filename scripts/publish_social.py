#!/usr/bin/env python3
"""
CSDN 博客发布脚本 (Playwright版 - CKEditor API方式)
发布 /tmp/social-content/csdn_article.md 到 CSDN
使用 CKEditor API + 标签选择 + 发布按钮触发
"""

import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright
import markdown

COOKIE_FILE = "/Users/zhanzidong/.hermes/browser-profiles/imported-cookies.json"
ARTICLE_FILE = "/tmp/social-content/csdn_article.md"
USERNAME = "m0_58868237"
RESULT_FILE = "/tmp/csdn_publish_result.json"


def parse_article(md_content):
    """提取标题和正文"""
    lines = md_content.split('\n')
    title = ''
    for line in lines:
        if line.startswith('# ') and not line.startswith('# >'):
            title = line[2:].strip()
            break
    if not title:
        title = 'AI技术分享文章'
    body = '\n'.join(lines[1:]).strip()
    return title, body


def md_to_html(body_md):
    """将Markdown转换为HTML"""
    return markdown.markdown(body_md, extensions=['fenced_code', 'codehilite', 'tables'])


def load_cookies(context):
    """加载CSDN cookies"""
    with open(COOKIE_FILE) as f:
        state = json.load(f)
    cookies = [c for c in state.get("cookies", []) if "csdn.net" in c.get("domain", "")]
    if cookies:
        context.add_cookies(cookies)
        print(f"  ✅ 已加载 {len(cookies)} 个CSDN cookies")
    else:
        print("  ⚠️ 未找到CSDN cookies")
    return context


def set_title(page, title):
    """填写标题"""
    page.evaluate("""(t) => {
        const ta = document.getElementById('txtTitle');
        if (ta) {
            const s = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            s.call(ta, t);
            ta.dispatchEvent(new Event('input', {bubbles: true}));
            ta.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }""", title)
    print("  ✅ 标题已设置")


def set_content_via_ckeditor(page, body_html):
    """通过CKEditor API设置正文内容"""
    page.evaluate("""(html) => {
        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances && CKEDITOR.instances['editor']) {
            CKEDITOR.instances['editor'].setData(html);
        }
    }""", body_html)
    page.wait_for_timeout(2000)

    # 验证内容是否已设置
    content_len = page.evaluate("""() => {
        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances && CKEDITOR.instances['editor']) {
            return CKEDITOR.instances['editor'].getData().length;
        }
        return 0;
    }""")
    print(f"  ✅ 正文已设置 ({content_len} HTML字符)")
    return content_len > 0


def add_tag(page, tag_name="人工智能"):
    """添加文章标签"""
    # 点击"添加文章标签"按钮
    tag_btn = page.locator('button:has-text("添加文章标签")')
    if tag_btn.is_visible():
        tag_btn.click()
        page.wait_for_timeout(2000)
    else:
        print("  ⚠️ 标签按钮不可见")
        return False

    # 点击指定标签
    tag_span = page.locator(f'span.el_mcm-tag:has-text("{tag_name}")').first
    if tag_span.is_visible():
        tag_span.click()
        print(f"  ✅ 标签 \"{tag_name}\" 已选择")
        page.wait_for_timeout(2000)
        return True
    else:
        # 尝试第一个可见标签
        any_tag = page.locator('span.el_mcm-tag__content').first
        if any_tag.is_visible():
            t = any_tag.text_content() or "标签"
            any_tag.click()
            print(f"  ✅ 标签 \"{t}\" 已选择")
            page.wait_for_timeout(2000)
            return True
        print("  ⚠️ 未找到可用标签")
        return False


def click_publish(page):
    """点击发布按钮"""
    btn = page.locator('button:has-text("发布博客")')
    if btn.is_visible():
        btn.click()
        print("  ✅ 已点击'发布博客'")
        return True
    print("  ❌ 未找到发布按钮")
    return False


def check_result(page):
    """检查发布结果，返回 (success, article_id, url)"""
    page.wait_for_timeout(5000)

    # 检查URL是否有成功的文章ID
    url = page.url

    # 模式1: 成功页面 /creation/success/{article_id}
    m = re.search(r'/creation/success/(\d+)', url)
    if m:
        aid = m.group(1)
        article_url = f"https://blog.csdn.net/{USERNAME}/article/details/{aid}"
        print(f"  ✅ 发布成功! 文章ID: {aid}")
        return True, aid, article_url

    # 模式2: URL中直接有article/details/{id}
    m = re.search(r'article/details/(\d+)', url)
    if m:
        aid = m.group(1)
        article_url = f"https://blog.csdn.net/{USERNAME}/article/details/{aid}"
        print(f"  ✅ 发布成功! 文章ID: {aid}")
        return True, aid, article_url

    # 检查是否有API响应数据 - 查看页面中是否有success参数
    success_info = page.evaluate("""() => {
        // Check if we're on a success page
        if (window.location.href.includes('creation/success/')) {
            return window.location.href;
        }
        return null;
    }""")
    if success_info:
        aid = re.search(r'creation/success/(\d+)', success_info)
        if aid:
            article_url = f"https://blog.csdn.net/{USERNAME}/article/details/{aid.group(1)}"
            print(f"  ✅ 发布成功! 文章ID: {aid.group(1)}")
            return True, aid.group(1), article_url

    print("  ⚠️ 未在URL中找到文章ID，保存截图")
    page.screenshot(path="/tmp/csdn_after_publish.png")
    return False, None, None


def save_result(article_id, url):
    """保存发布结果"""
    result = {
        'success': True,
        'article_id': str(article_id),
        'url': url or f"https://blog.csdn.net/{USERNAME}/article/details/{article_id}",
        'message': '发布成功',
    }
    with open(RESULT_FILE, 'w') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"  ✅ 结果已保存到 {RESULT_FILE}")


def main():
    print("=" * 60)
    print("CSDN 文章发布工具 (Playwright + CKEditor API版)")
    print("=" * 60)

    if not os.path.exists(ARTICLE_FILE):
        print(f"❌ 文件不存在: {ARTICLE_FILE}")
        return False

    with open(ARTICLE_FILE) as f:
        md_content = f.read()

    title, body_md = parse_article(md_content)
    body_html = md_to_html(body_md)
    print(f"  标题: {title}")
    print(f"  正文: {len(body_md)} 字符 -> {len(body_html)} HTML")

    print("\n🌐 启动浏览器...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        load_cookies(context)
        page = context.new_page()

        print("\n[1/6] 打开文章编辑器...")
        page.goto("https://mp.csdn.net/mp_blog/creation/editor",
                   wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(5000)

        if "passport" in page.url.lower():
            print("  ❌ cookies已过期，需要重新登录")
            browser.close()
            return False
        print("  ✅ 编辑器已加载")

        print("\n[2/6] 设置标题...")
        set_title(page, title)

        print("\n[3/6] 设置正文 (CKEditor API)...")
        content_ok = set_content_via_ckeditor(page, body_html)
        if not content_ok:
            page.screenshot(path="/tmp/csdn_set_content_fail.png")
            print("  ❌ CKEditor内容设置失败")
            # 尝试CKEditor源码模式
            print("  ⚠️ 尝试其他方式...")

        print("\n[4/6] 添加文章标签...")
        add_tag(page, "人工智能")

        print("\n[5/6] 发布文章...")
        page.wait_for_timeout(2000)

        if not click_publish(page):
            browser.close()
            return False

        print("\n[6/6] 检查发布结果...")
        page.wait_for_timeout(5000)

        # 等待可能的页面跳转（最多15秒）
        for i in range(3):
            success, aid, article_url = check_result(page)
            if success:
                save_result(aid, article_url)
                browser.close()
                print(f"\n{'='*60}")
                print(f"✅ 发布成功! 🎉")
                print(f"   文章ID: {aid}")
                print(f"   链接: {article_url}")
                print(f"{'='*60}")
                return True
            page.wait_for_timeout(5000)

        browser.close()
        print(f"\n{'='*60}")
        print(f"❌ 发布失败，截图: /tmp/csdn_after_publish.png")
        print(f"{'='*60}")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
