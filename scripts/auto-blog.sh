#!/bin/bash
# auto-blog.sh — 自动生成博客文章并部署
# 用法: ./auto-blog.sh
# 通过 launchd 每天凌晨 5 点运行，内部判断是否够 3 天
# 依赖: node, vercel CLI

set -e
cd "$(dirname "$0")/.."
LOG_DIR="$(pwd)/logs"
mkdir -p "$LOG_DIR"

echo "[$(date)] ⏰ auto-blog.sh started" >> "$LOG_DIR/cron.log"

# === 调度控制：每 3 天跑一次 ===
STATE_FILE="$LOG_DIR/.last-run"
INTERVAL_HOURS=72  # 3 天

if [ -f "$STATE_FILE" ]; then
  LAST_RUN=$(cat "$STATE_FILE")
  NOW=$(date +%s)
  ELAPSED=$(( (NOW - LAST_RUN) / 3600 ))
  if [ "$ELAPSED" -lt "$INTERVAL_HOURS" ]; then
    echo "[$(date)] ⏳ 距离上次运行仅 $ELAPSED 小时，不足 $INTERVAL_HOURS 小时，跳过本次" >> "$LOG_DIR/cron.log"
    exit 0
  fi
fi

# 记录本次运行时间
date +%s > "$STATE_FILE"

echo "[$(date)] 📝 生成新文章开始..." >> "$LOG_DIR/cron.log"

# 生成新文章
if node scripts/generate-post.mjs >> "$LOG_DIR/cron.log" 2>&1; then
  echo "[$(date)] ✅ 文章生成成功" >> "$LOG_DIR/cron.log"
else
  echo "[$(date)] ❌ 文章生成失败，跳过部署" >> "$LOG_DIR/cron.log"
  exit 1
fi

# 部署到 Vercel
if [ -n "$VERCEL_TOKEN" ]; then
  echo "[$(date)] 🚀 部署到 Vercel..." >> "$LOG_DIR/cron.log"
  if npx vercel --prod --token "$VERCEL_TOKEN" --yes >> "$LOG_DIR/deploy.log" 2>&1; then
    echo "[$(date)] ✅ Vercel 部署成功" >> "$LOG_DIR/cron.log"
  else
    echo "[$(date)] ❌ Vercel 部署失败" >> "$LOG_DIR/cron.log"
  fi
else
  echo "[$(date)] ⚠️ VERCEL_TOKEN 未设置，跳过部署" >> "$LOG_DIR/cron.log"
fi

echo "[$(date)] ✅ Done." >> "$LOG_DIR/cron.log"
