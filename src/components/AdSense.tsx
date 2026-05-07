'use client';

/**
 * AdSense 广告位占位组件
 * 
 * 当域名审核通过后：
 * 1. 在 layout.tsx 的 <head> 中添加 AdSense 脚本
 * 2. 取消下方注释，替换 data-ad-slot 和 data-ad-format
 * 3. 启用实际广告渲染
 */

export function AdSlot({ className = '' }: { className?: string }) {
  // ── AdSense 激活后取消注释 ──
  // useEffect(() => {
  //   try {
  //     (window.adsbygoogle = window.adsbygoogle || []).push({});
  //   } catch {}
  // }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* 占位块 — 替换为 AdSense 代码 */}
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-muted)] py-8 text-center text-xs text-[var(--text-muted)]">
        <p>广告位</p>
        {/* 
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-xxxxxxxxxxxxxx"
          data-ad-slot="xxxxxxxxxx"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        */}
      </div>
    </div>
  );
}

/** 文章内嵌广告 — 窄条横幅 */
export function AdInline() {
  return (
    <div className="my-8">
      <AdSlot />
    </div>
  );
}
