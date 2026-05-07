# AI 自动化工作站 - 部署说明

## 快速部署（约 30 分钟）

### 1. 购买服务器

推荐配置：
- 阿里云 / 腾讯云 / 华为云
- 最低配：2 核 2G 内存，40GB 系统盘
- 费用：约 50-100 元/月
- 系统：Ubuntu 22.04 LTS
- 如果之前做了学校财报系统，用同一台机器也可以

### 2. 购买域名

- 阿里云万网 / 腾讯云 DNSPod
- 推荐：nicetool.cn 或 aiauto.work 类短域名
- 费用：约 30-50 元/年

### 3. 部署代码

服务器上执行：

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# 克隆代码（或者上传代码）
git clone 你的仓库地址 /var/www/ai-saas
# 或者用 scp 上传
# scp -r ./ai-saas root@你的服务器IP:/var/www/

cd /var/www/ai-saas
npm install
npm run build

# 使用 PM2 管理进程
npm install -g pm2
pm2 start npm --name "ai-saas" -- start
pm2 save
pm2 startup
```

### 4. 配置 Nginx

```nginx
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # 文件上传大小限制（工具需要）
        client_max_body_size 50m;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/ai-saas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 配置 SSL（免费）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com
```

### 5. 验证

访问 https://你的域名.com 确认网站正常运行。

---

## 自动化内容更新（我帮你）

上线后，我可以设置 **cron 定时任务**，每天自动：

1. 生成一篇新的 SEO 博客文章
2. 更新网站代码
3. 提交到百度收录

你需要做的是：告诉我 VPS 的 SSH 连接信息，我来配置自动化。

---

## 收入模式上线步骤

### 第 1 周：流量冷启动

- 我写 5 篇小红书笔记 + 5 篇知乎回答
- 你发布到各平台引流
- 网站已有 5 篇 SEO 文章 + 2 个工具

### 第 2 周：开通支付

- 注册个体工商户（或找个有资质的支付渠道）
- 接入微信支付 / 支付宝
- 开启付费功能（如每天免费 5 次，付费无限次）

### 第 3-4 周：迭代

- 根据用户反馈优化工具（我改代码）
- 持续发布内容（我写）

### 第 2 个月起：稳定运营

- 每天自动生成内容
- 用户量增长
- 开始有付费转化

---

## 本地开发

```bash
cd ~/ai-saas
npm run dev
# 访问 http://localhost:3000
```
