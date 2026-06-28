#!/usr/bin/env python3
"""
CSDN 博客发布脚本 (Playwright版)
发布 /tmp/social-content/csdn_article.md 到 CSDN
使用 Playwright 浏览器自动化，绕过 REST API 网关签名限制
"""

import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright


COOKIE_FILE = "/Users/zhanzidong/.hermes/browser-profiles/imported-cookies.json"
ARTICLE_FILE = "/tmp/social-content/csdn_article.md"
USERNAME = "m0_58868237"
RESULT_FILE = "/tmp/csdn_publish_result.json"


def parse_article(md_content):
    """提取标题和正文（去掉第一行标题）"""
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


def load_context(context):
    """加载CSDN cookies到浏览器上下文"""
    with open(COOKIE_FILE) as f:
        state = json.load(f)
    csdn_cookies = [c for c in state.get("cookies", []) if "csdn.net" in c.get("domain", "")]
    if csdn_cookies:
        context.add_cookies(csdn_cookies)
        print(f"  ✅ 已加载 {len(csdn_cookies)} 个CSDN cookies")
    else:
        print("  ⚠️ 未找到CSDN cookies")
    return context


def check_login(page):
    """检查是否已登录"""
    if "passport" in page.url.lower():
        print("  ❌ 需要重新登录 - cookies已过期")
        return False
    return True


def find_article_on_blog(page, title_keywords):
    """在博客主页上查找刚发布的文章"""
    page.goto(f"https://blog.csdn.net/{USERNAME}", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(3000)

    articles = page.evaluate("""() => {
        const links = document.querySelectorAll('a[href*="/article/details/"]');
        const results = [];
        const seen = new Set();
        for (let link of links) {
            const t = link.textContent?.trim() || '';
            if (t.length > 15 && !seen.has(link.href)) {
                seen.add(link.href);
                results.push({href: link.href, title: t.substring(0, 120)});
            }
        }
        return results;
    }""")

    for art in articles[:10]:
        for kw in title_keywords:
            if kw in art['title']:
                aid = re.findall(r'article/details/(\d+)', art['href'])
                if aid:
                    print(f"  ✅ 在博客列表中找到文章: ID={aid[0]}")
                    return aid[0], art['href']
    return None, None


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


def switch_to_md_editor_and_fill(page, body_md):
    """切换到MD编辑器并填入内容"""
    print("\n  切换到MD编辑器...")

    # 查找"使用 MD 编辑器"按钮
    for selector_text in ['使用 MD 编辑器', 'MD编辑器', '使用Markdown编辑器', '切换编辑器']:
        btn = page.locator(f'text={selector_text}')
        if btn.count() > 0 and btn.first.is_visible():
            print(f"  ✅ 点击 '{selector_text}'")
            btn.first.click()
            page.wait_for_timeout(3000)
            break
    else:
        print("  ⚠️ 未找到编辑器切换按钮")
        return False

    # 检测编辑器类型
    editor_type = page.evaluate("""() => {
        if (document.querySelector('.vditor')) return 'vditor';
        if (document.querySelector('.CodeMirror')) return 'codemirror';
        const textareas = document.querySelectorAll('textarea');
        for (let ta of textareas) {
            if (ta.offsetParent !== null && ta.id !== 'txtTitle' && ta.id !== 'txtSammary') {
                return 'textarea:' + (ta.id || 'no-id');
            }
        }
        return 'unknown';
    }""")
    print(f"  编辑器类型: {editor_type}")

    if editor_type == 'vditor':
        page.evaluate("""(md) => {
            if (window.vditor && window.vditor.setValue) {
                window.vditor.setValue(md);
                return;
            }
            const vditorEl = document.querySelector('.vditor');
            if (vditorEl) {
                for (let key of Object.getKeys(vditorEl)) {
                    if (key.startsWith('__vditor')) {
                        try { vditorEl[key].setValue(md); return; } catch(e) {}
                    }
                }
            }
        }""", body_md)
    elif editor_type == 'codemirror':
        page.evaluate("""(md) => {
            const cm = document.querySelector('.CodeMirror');
            if (cm && cm.CodeMirror) { cm.CodeMirror.setValue(md); return; }
        }""", body_md)
    else:
        # textarea fallback
        page.evaluate("""(md) => {
            const tas = document.querySelectorAll('textarea');
            for (let ta of tas) {
                if (ta.offsetParent !== null && ta.id !== 'txtTitle' && ta.id !== 'txtSammary') {
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype, 'value'
                    ).set;
                    nativeSetter.call(ta, md);
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    return;
                }
            }
        }""", body_md)

    page.wait_for_timeout(2000)
    return True


def fill_title(page, title):
    """填写文章标题"""
    page.evaluate("""(t) => {
        const ta = document.getElementById('txtTitle');
        if (ta) {
            const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            ).set;
            nativeSetter.call(ta, t);
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }""", title)
    print(f"  ✅ 标题已设置")


def click_publish(page):
    """点击发布按钮"""
    try:
        btn = page.locator('button:has-text("发布博客")')
        if btn.count() > 0:
            btn.first.click()
            print("  ✅ 已点击'发布博客'")
            return True
    except:
        pass
    print("  ❌ 未找到发布按钮")
    return False


def check_publish_result(page, title_keywords):
    """检查发布结果"""
    print("\n  📝 检查发布结果...")
    page.wait_for_timeout(5000)

    # 检查 URL 中是否有 article ID
    article_ids = re.findall(r'article/details/(\d+)', page.url)
    if article_ids:
        aid = article_ids[0]
        url = f"https://blog.csdn.net/{USERNAME}/article/details/{aid}"
        print(f"  ✅ 发布成功! 文章ID: {aid}")
        save_result(aid, url)
        return True

    # 检查弹窗
    try:
        confirm = page.locator('button:has-text("确定"), button:has-text("确认"), button:has-text("发表")')
        if confirm.count() > 0 and confirm.first.is_visible():
            confirm.first.click()
            print("  ✅ 已确认发布")
            page.wait_for_timeout(5000)
    except:
        pass

    page.wait_for_timeout(3000)
    article_ids = re.findall(r'article/details/(\d+)', page.url)
    if article_ids:
        aid = article_ids[0]
        url = f"https://blog.csdn.net/{USERNAME}/article/details/{aid}"
        print(f"  ✅ 发布成功! 文章ID: {aid}")
        save_result(aid, url)
        return True

    # 去博客页查找
    print("  🔍 去博客页面查找...")
    page.screenshot(path="/tmp/csdn_after_publish.png")
    aid, url = find_article_on_blog(page, title_keywords)
    if aid:
        save_result(aid, url)
        return True
    return False


def main():
    print("=" * 60)
    print("CSDN 文章发布工具 (Playwright版)")
    print("=" * 60)

    if not os.path.exists(ARTICLE_FILE):
        print(f"❌ 文件不存在: {ARTICLE_FILE}")
        return False

    with open(ARTICLE_FILE) as f:
        md_content = f.read()

    title, body_md = parse_article(md_content)
    print(f"  标题: {title}")
    print(f"  正文: {len(body_md)} 字符")
    title_keywords = list(filter(None, re.split(r'[：:，,\s]', title)[:3]))

    print("\n🌐 启动浏览器...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        load_context(context)
        page = context.new_page()

        print("\n[1/5] 打开CSDN首页...")
        page.goto("https://www.csdn.net", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2000)

        print("[2/5] 打开文章编辑器...")
        page.goto("https://mp.csdn.net/mp_blog/creation/editor", wait_until="domcontentloaded", timeout=30000)
        if not check_login(page):
            browser.close()
            return False
        page.wait_for_timeout(5000)
        print("  ✅ 编辑器已加载")

        print("\n[3/5] 设置标题...")
        fill_title(page, title)

        print("\n[4/5] 设置正文...")
        # 切换到MD编辑器并填入内容（最可靠的方式）
        content_set = switch_to_md_editor_and_fill(page, body_md)
        if not content_set:
            print("❌ 无法设置正文内容")
            page.screenshot(path="/tmp/csdn_error.png")
            browser.close()
            return False
        print("  ✅ 正文已设置")

        print("\n[5/5] 发布文章...")
        page.wait_for_timeout(2000)
        page.screenshot(path="/tmp/csdn_before_publish.png")

        if not click_publish(page):
            browser.close()
            return False

        success = check_publish_result(page, title_keywords)
        browser.close()

        if success:
            print(f"\n{'='*60}")
            print(f"✅ 发布成功! 🎉")
            print(f"{'='*60}")
            return True
        else:
            print(f"\n{'='*60}")
            print(f"❌ 发布失败，截图: /tmp/csdn_after_publish.png")
            print(f"{'='*60}")
            return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
