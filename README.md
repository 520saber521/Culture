# 江苏文化传承与创新平台

这是一个前后端分离的单仓库项目。当前主后端为 Node.js Serverless API；原 Spring Boot 实现保留在 `legacy` 中，便于对照和迁移数据。

## 目录结构

```text
Cultural/
├── apps/
│   ├── web/                    # Vue 3 + Vite 前端
│   └── api/                    # Node.js + Hono Serverless API
├── docs/
│   ├── technical/              # 技术实现与页面说明
│   ├── presentation/           # 项目展示与作品介绍
│   └── copyright/              # 软件著作权材料
├── legacy/
│   └── spring-backend/         # 原 Spring Boot 后端（只作兼容参考）
├── .github/workflows/          # 常规构建与测试 CI
├── package.json                # 根目录统一命令
└── README.md
```

## 快速开始

要求 Node.js 20 或更高版本。

```bash
# 安装前端和 API 依赖
npm run install:all

# 终端 1：启动 API（http://localhost:8787）
npm run dev:api

# 终端 2：启动前端（http://localhost:3000）
npm run dev:web
```

API 启动前需复制 `apps/api/.env.example` 为 `apps/api/.env`，填写 Supabase 环境变量，并执行：

```text
apps/api/supabase/migrations/001_initial_schema.sql
apps/api/supabase/migrations/002_work_images.sql
```

## 常用命令

```bash
npm run build       # 构建前端并检查 API 语法
npm test            # 运行 API 测试
npm run build:web   # 仅构建前端
npm run check:api   # 仅检查 API
```

更多部署、数据库和接口说明见：

- [`apps/api/README.md`](apps/api/README.md)
- [`apps/web/README.md`](apps/web/README.md)
- [`docs/README.md`](docs/README.md)
- [`docs/technical/技术实现文档.md`](docs/technical/技术实现文档.md)

## 说明

- `apps/api` 是当前维护的后端。
- `legacy/spring-backend` 不参与默认构建。
- 本地生成的 `node_modules`、`dist`、`target` 和日志不会进入 Git。

## 已接入的复用模块

- 首页文化星图：Apache ECharts。无需地图密钥，展示十三市的相对位置与文化档案；它是概念星图，不是行政区划地图。
- 可选地图漫游：MapLibre GL JS。设置前端 `VITE_MAP_STYLE_URL` 为你有权使用的底图样式 URL 后，首页出现模式切换；地图服务、瓦片和样式需另行准备。
- 城市信息面板动效：Motion for Vue。
- 作品上传：现有 Supabase JS + Storage，登录后在 `/works` 上传图片并创建作品。运行第二个 SQL migration 后才可上传。
- 新闻正文编辑：Tiptap，在 `/admin/news` 编辑现有新闻；仅 `profiles.role = 'admin'` 的账户能保存。没有自动创建管理员的开放接口。

接入条件、维护边界与部署核对项见 [复用模块说明](docs/technical/复用模块接入.md)。
