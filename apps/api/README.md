# Cultural Node.js Backend

这是原 Spring Boot 后端的 Serverless Node.js 版本。它保留现有 Vue 前端的 `/api` 路径、`code/message/data` 响应结构与主要业务接口，并替换为：

- Hono：Node.js / Vercel / Cloudflare Workers 共用的 HTTP 层
- Supabase PostgreSQL + Auth：数据库和用户认证
- Upstash Redis：可选缓存；未配置时接口仍可运行

## 本地启动

没有 Supabase 凭据时，运行 `npm run dev` 会启动本地开发后端，账号、会话、作品与图片保存在被 Git 忽略的 `.local-data` 目录中。它只供本机开发使用，不会由 Vercel 或 Cloudflare 入口加载。配置完整的 Supabase 变量后，`npm run dev` 自动使用正式 API；也可设置 `LOCAL_API_MODE=1` 强制使用本地后端。

本地管理员账号可在 `apps/api` 目录执行 `npm run create-local-admin` 创建。命令随机生成初始密码，只显示一次；新建账号要重启本地 API 后才会被正在运行的进程读取。本地管理员可在 `/admin/news` 创建、编辑、发布和撤回新闻。正式 Supabase 环境的角色仍通过下文的 `set-role` 命令管理。

1. 在 Supabase 新建项目，在 SQL Editor 依次执行 `supabase/migrations/001_initial_schema.sql`、`002_work_images.sql`、`003_private_work_images.sql`。第三份迁移将作品图片 bucket 改为私有，并增加点赞、内容来源、操作日志和 AI 额度所需表与函数。已有图片的公开 URL 会由 API 转换成短期签名 URL；已被外部复制或缓存的旧链接无法追溯撤回。
2. 复制 `.env.example` 为 `.env`，填入 Supabase 项目地址、Publishable Key 与 Secret Key。
3. 安装并启动：

```bash
npm install
npm run dev
```

健康检查地址为 `http://localhost:8787/api/health`。前端开发环境默认连接这个地址。
`/api/health/ready` 会实际查询数据库，适合部署后的就绪检查；数据库不可用时返回 503。

Secret Key 只能放在服务端环境变量中，绝不能使用 `VITE_` 前缀或提交到 Git。

管理员权限由可信任的部署者在服务端分配或撤销：在 `apps/api` 目录运行 `npm run set-role -- <用户名> admin` 或 `npm run set-role -- <用户名> user`。此命令需要 Secret Key，并将操作写入 `operation_logs`；不要放到前端或开放 HTTP 接口。

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
- `POST /api/works/upload`：登录后上传 5 MB 以内的 JPG/PNG/WebP 图片到私有 Storage；返回图片路径，创建作品时传 `imagePath`。`DELETE /api/works/upload?path=...` 可清理未关联作品的本人图片。
- `GET/POST/PUT/DELETE /api/admin/content/:type`：管理员维护城市、分类、非遗、传统艺术、名人和新闻；新内容默认草稿。`POST /api/admin/content/:type/:id/status` 可发布或撤回，`GET /api/admin/operation-logs` 可查操作记录。
- `PUT /api/admin/news/:id`：兼容旧新闻编辑接口；仅 `profiles.role = 'admin'` 可编辑。管理员角色需在可信任的管理端分配。
- `GET /api/admin/metrics`：管理员查看各类内容当前数量和最近 7 天搜索有结果率、作品记录保存成功率的原始计数。搜索率按返回至少一条结果计算；作品保存率按图片验证通过后的数据库写入尝试计算。
- `GET /api/city-features/list`：已发布的城市景点、活动与美食资料；管理员通过 `cityFeatures` 内容类型维护。
- `POST /api/reports`：登录用户举报公开作品或评论；`GET /api/admin/reports` 和 `POST /api/admin/reports/:id/review` 供管理员处理。
- `comments` / `collections`
- `search`：全局搜索、热门关键词、个人历史

旧版 `/heritage/:id`、`/art/:id`、`/celebrity/:id`、`/news/:id` 路径也保留了兼容别名。

私密作品仅作者和管理员可通过详情读取；公开图库、搜索和收藏列表只返回公开作品。作品图片由 API 签发一小时有效的访问链接。新部署需要配置持久化 Redis 才能在多实例之间共享接口限流计数；未配置时限流只在单实例内生效。AI 生图另由数据库维护每日额度，默认每位用户每日 5 次，可通过 `AI_DAILY_LIMIT` 调整。新闻正文在写入和读取时都按允许标签清洗。

## 目标环境验收

1. 依次执行三份迁移，确认 `user-works` bucket 为私有；配置服务端变量和受控管理员账号。
2. 导入有来源和授权信息的内容，分别验收游客浏览、注册登录、公开与私密作品、图库发布、评论收藏、新闻草稿发布、举报处理和 AI 额度。
3. 将 `/api/health/ready` 纳入部署监控，配置数据库及 Storage 的定期备份，并定期验证恢复。备份策略和告警渠道依实际 Supabase 项目及托管平台配置。

## 数据迁移说明

原库是 MySQL，Supabase 是 PostgreSQL，不能直接执行旧的 `init_v3_normalized.sql`。新 migration 已处理自增主键、布尔逻辑删除、JSONB、时区和计数器函数。已有业务数据需要从 MySQL 导出为 CSV，再按外键顺序导入 Supabase：`categories/cities -> content -> profiles -> works/comments/collections`。
