# Cultural Node.js Backend

这是原 Spring Boot 后端的 Serverless Node.js 版本。它保留现有 Vue 前端的 `/api` 路径、`code/message/data` 响应结构与主要业务接口，并替换为：

- Hono：Node.js / Vercel / Cloudflare Workers 共用的 HTTP 层
- Supabase PostgreSQL + Auth：数据库和用户认证
- Upstash Redis：可选缓存；未配置时接口仍可运行

## 本地启动

1. 在 Supabase 新建项目，在 SQL Editor 执行 `supabase/migrations/001_initial_schema.sql`。
   如需作品图片上传，再执行 `supabase/migrations/002_work_images.sql`，创建公开的 `user-works` Storage bucket。
2. 复制 `.env.example` 为 `.env`，填入 Supabase 项目地址、Publishable Key 与 Secret Key。
3. 安装并启动：

```bash
npm install
npm run dev
```

健康检查地址为 `http://localhost:8787/api/health`。前端开发环境默认连接这个地址。

Secret Key 只能放在服务端环境变量中，绝不能使用 `VITE_` 前缀或提交到 Git。

## 部署

### Vercel

把 Vercel 项目的 Root Directory 设为 `apps/api`，加入 `.env.example` 中的环境变量后部署。`api/index.js` 和 `vercel.json` 已包含路由入口。

> Vercel Hobby 免费计划按当前官方条款仅限个人、非商业用途。商业产品应使用 Vercel Pro，或选择符合自身条款与限额的 Cloudflare Workers 部署。

如果前端与 API 是两个独立的 Vercel/Cloudflare 项目，在前端项目中设置 `VITE_API_BASE_URL=https://你的后端域名/api`；只有同域反向代理时才使用默认的 `/api`。

### Cloudflare Workers

安装 Wrangler（`npm i -D wrangler`），用 `wrangler secret put` 写入三个 Supabase 变量和可选的两个 Upstash 变量，然后运行 `npx wrangler deploy`。同一份 Hono 应用由 `src/worker.js` 导出。

Cloudflare Workers Free 不是“无限请求”，当前上限是每天 100,000 次请求，并有单次 CPU 时间等限制；超过限额时需等待重置或升级。

## 登录兼容方式

现有页面只要求用户名而不要求邮箱。API 会把用户名稳定映射为内部 Auth 邮箱，真实邮箱仍保存在 `profiles.email`，所以前端不用改登录表单。注册由服务端 Admin API 创建已确认用户。

## 已迁移接口

- `auth`：注册、登录、登出、资料、修改密码
- `auth/refresh`：刷新 Supabase 短期访问令牌（前端已自动调用）
- `cities` / `categories`
- `heritage` / `traditional-arts` / `celebrities` / `news`
- `works`：公开列表、我的作品、增删改、点赞
- `POST /api/works/upload`：登录后上传 5 MB 以内的 JPG/PNG/WebP 图片到 Supabase Storage；返回公开 URL。
- `PUT /api/admin/news/:id`：仅 `profiles.role = 'admin'` 可编辑现有新闻标题、摘要与正文。管理员角色需在可信任的管理端分配。
- `comments` / `collections`
- `search`：全局搜索、热门关键词、个人历史

旧版 `/heritage/:id`、`/art/:id`、`/celebrity/:id`、`/news/:id` 路径也保留了兼容别名。

## 数据迁移说明

原库是 MySQL，Supabase 是 PostgreSQL，不能直接执行旧的 `init_v3_normalized.sql`。新 migration 已处理自增主键、布尔逻辑删除、JSONB、时区和计数器函数。已有业务数据需要从 MySQL 导出为 CSV，再按外键顺序导入 Supabase：`categories/cities -> content -> profiles -> works/comments/collections`。
