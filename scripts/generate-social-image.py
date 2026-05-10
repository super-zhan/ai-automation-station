#!/usr/bin/env python3
"""自动生成社交媒体配图（小红书/知乎/CSDN风格）"""

from PIL import Image, ImageDraw, ImageFont
import os, sys, textwrap, random, math

FONT_DIRS = [
    "/System/Library/Fonts",
    "/Library/Fonts",
    os.path.expanduser("~/Library/Fonts"),
]

def find_font(name):
    for d in FONT_DIRS:
        if os.path.exists(d):
            for f in os.listdir(d):
                if name in f:
                    return os.path.join(d, f)
    return None

FONT_BOLD = find_font("PingFang.ttc") or find_font("STHeiti Medium.ttc")
FONT_LIGHT = find_font("STHeiti Light.ttc") or FONT_BOLD

# Color themes
THEMES = [
    {"bg": ["#667eea", "#764ba2"], "fg": "#ffffff", "accent": "#f093fb"},
    {"bg": ["#4facfe", "#00f2fe"], "fg": "#ffffff", "accent": "#fff9c4"},
    {"bg": ["#a18cd1", "#fbc2eb"], "fg": "#ffffff", "accent": "#ffecd2"},
    {"bg": ["#43e97b", "#38f9d7"], "fg": "#1a1a2e", "accent": "#1a1a2e"},
    {"bg": ["#fa709a", "#fee140"], "fg": "#1a1a2e", "accent": "#667eea"},
    {"bg": ["#0c3483", "#a2b6df"], "fg": "#ffffff", "accent": "#f5af19"},
    {"bg": ["#1a1a2e", "#16213e"], "fg": "#ffffff", "accent": "#e94560"},
]

def create_gradient(draw, size, colors):
    """Create a linear gradient background"""
    w, h = size
    for y in range(h):
        ratio = y / h
        r, g, b = [], [], []
        for i in range(len(colors) - 1):
            if ratio >= i / (len(colors) - 1) and ratio <= (i + 1) / (len(colors) - 1):
                local_ratio = (ratio - i / (len(colors) - 1)) * (len(colors) - 1)
                c1 = tuple(int(colors[i][j:j+2], 16) for j in (1, 3, 5))
                c2 = tuple(int(colors[i+1][j:j+2], 16) for j in (1, 3, 5))
                r = int(c1[0] + (c2[0] - c1[0]) * local_ratio)
                g = int(c1[1] + (c2[1] - c1[1]) * local_ratio)
                b = int(c1[2] + (c2[2] - c1[2]) * local_ratio)
                break
        draw.rectangle([0, y, w, y+1], fill=(r, g, b))

def wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width"""
    words = list(text)
    lines = []
    current_line = ""
    for char in text:
        test_line = current_line + char
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w = bbox[2] - bbox[0]
        if w > max_width and current_line:
            lines.append(current_line)
            current_line = char
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)
    return lines

def generate_image(
    title="效率提升 10 倍的 AI 工具",
    subtitle="自动处理PDF、Excel、文档，释放你的生产力",
    tags=None,
    platform="xiaohongshu",
    output_path=None,
):
    """Generate a social media image card"""
    
    if platform == "xiaohongshu":
        w, h = 1080, 1440  # 3:4 portrait
    elif platform == "zhihu":
        w, h = 1200, 675   # 16:9 landscape
    else:
        w, h = 1200, 800   # CSDN wide
    
    theme = random.choice(THEMES)
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    
    # Background gradient
    create_gradient(draw, (w, h), theme["bg"])
    
    # Decorative circles
    for _ in range(3):
        cx = random.randint(50, w - 50)
        cy = random.randint(50, h - 50)
        r = random.randint(60, 200)
        c = tuple(int(theme["accent"][j:j+2], 16) for j in (1, 3, 5))
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(*c, 30), outline=None)
    
    # Title
    try:
        title_font = ImageFont.truetype(FONT_BOLD, 72, index=0)
        subtitle_font = ImageFont.truetype(FONT_LIGHT, 36, index=0)
        tag_font = ImageFont.truetype(FONT_LIGHT, 28, index=0)
        url_font = ImageFont.truetype(FONT_LIGHT, 24, index=0)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = title_font
        tag_font = title_font
        url_font = title_font
    
    fg_color = tuple(int(theme["fg"][j:j+2], 16) for j in (1, 3, 5))
    accent_color = tuple(int(theme["accent"][j:j+2], 16) for j in (1, 3, 5))
    
    # Title area
    title_lines = wrap_text(title, title_font, w - 120, draw)
    max_lines = 4 if platform == "xiaohongshu" else 3
    title_lines = title_lines[:max_lines]
    
    y_start = h // 3 if platform == "xiaohongshu" else h // 4
    y = y_start
    
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        x = (w - tw) // 2
        draw.text((x, y), line, fill=fg_color, font=title_font)
        y += bbox[3] - bbox[1] + 10
    
    y += 20
    
    # Decorative line
    line_w = min(200, w // 3)
    draw.rectangle([(w - line_w)//2, y, (w + line_w)//2, y + 4], fill=accent_color)
    y += 30
    
    # Subtitle
    if subtitle:
        subtitle_lines = wrap_text(subtitle, subtitle_font, w - 160, draw)
        subtitle_lines = subtitle_lines[:3]
        for line in subtitle_lines:
            bbox = draw.textbbox((0, 0), line, font=subtitle_font)
            tw = bbox[2] - bbox[0]
            x = (w - tw) // 2
            draw.text((x, y), line, fill=fg_color, font=subtitle_font)
            y += bbox[3] - bbox[1] + 5
    
    # Tags at bottom
    if tags and platform == "xiaohongshu":
        y = h - 100
        tag_text = "  ".join(f"#{t}" for t in tags)
        tag_lines = wrap_text(tag_text, tag_font, w - 60, draw)
        for line in tag_lines:
            bbox = draw.textbbox((0, 0), line, font=tag_font)
            tw = bbox[2] - bbox[0]
            x = (w - tw) // 2
            draw.text((x, y), line, fill=accent_color, font=tag_font)
            y += bbox[3] - bbox[1] + 5
    
    # URL footer
    url_text = "zidongai.com.cn"
    bbox = draw.textbbox((0, 0), url_text, font=url_font)
    tw = bbox[2] - bbox[0]
    draw.text((w - tw - 30, h - 30), url_text, fill=fg_color, font=url_font)
    
    # Save
    if not output_path:
        output_path = f"/tmp/social-image-{random.randint(10000,99999)}.png"
    img.save(output_path, "PNG")
    return output_path


if __name__ == "__main__":
    import json
    
    title = sys.argv[1] if len(sys.argv) > 1 else "AI 工具推荐"
    subtitle = sys.argv[2] if len(sys.argv) > 2 else ""
    platform = sys.argv[3] if len(sys.argv) > 3 else "xiaohongshu"
    tags = sys.argv[4].split(",") if len(sys.argv) > 4 else None
    
    path = generate_image(
        title=title,
        subtitle=subtitle,
        platform=platform,
        tags=tags,
    )
    print(json.dumps({"path": path, "size": os.path.getsize(path)}))
