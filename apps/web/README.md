# Cultural Web

江苏文化传承与创新平台的 Vue 3 前端，使用 Vite、Vue Router 和 Element Plus。

首页默认使用 ECharts 的十三市文化星图，不再依赖高德密钥。设置 `VITE_MAP_STYLE_URL` 后可切换 MapLibre 地图漫游；该 URL 对应的瓦片、字体及样式必须由部署方提供并确认使用权限。城市面板使用 Motion for Vue。`/works` 使用后端图片上传接口，`/admin/news` 使用 Tiptap 编辑已存在的新闻（服务端限制管理员保存）。

## 本地运行

从仓库根目录执行：

```bash
npm run install:all
npm run dev:web
```

开发环境默认请求 `http://localhost:8787/api`。如需连接远程 API，可设置：

```text
VITE_API_BASE_URL=https://你的后端域名/api
VITE_MAP_STYLE_URL=https://你的地图服务/style.json
```

生产构建：

```bash
npm run build:web
```

辅助脚本位于 `scripts/`：`npm run crawl:images` 下载图库素材，`npm run serve:dist` 预览已构建的静态文件。
