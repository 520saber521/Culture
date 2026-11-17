# 江苏地图水体：来源、坐标与实现

提取日期：2026-11-17。水体数据 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，按 ODbL 使用；页面保留可点击署名。`water-source.geo.json` 是保留来源对象 ID 的 WGS84 提取数据，`water-geometry.json` 是本项目的衍生渲染数据，二者随代码公开。行政区数据来源仍为 DataV，不应将其署名为 OSM。

## 来源与范围

- 太湖湖岸及 60 个岛屿：OSM [relation 1126533](https://www.openstreetmap.org/relation/1126533)，通过 Nominatim 的完整 `polygon_geojson` 获取，不是根据图片描边。
- 长江主流及分汊中心线：OSM [relation 9392345](https://www.openstreetmap.org/relation/9392345)。首条线为向下游定向的主流；其余为真实分汊，分汊的起终点沿程坐标对齐主流。
- 河岸面：Overpass 提取 `water=river` 多边形，与上述中心线相交筛选，最终 10 个 relation：28656、1999842、2001172、2001173、2001174、2001175、2001176、2464312、2538928、2562596。所有来源 ID 也写入源 GeoJSON。
- 入海口：OSM 从河流面改用 `natural=coastline` 描述岸线。因此将真实海岸线与既有河流面边界构成平面网络后 polygonize，选择中心线穿过的水面，保留岛屿孔洞。提取窗口为 `[120.8,31.45,122.1,32.1]`（西、南、东、北）；窗口边为离岸数据截取边，不是虚构岸线。最终水面再裁切到现有江苏行政区展示范围；河口附近包括省域内的沿岸水域，没有另加整片海洋背景。
- 太湖完整显示，包括浙江一侧的湖面；省域外的湖岛补充为同色陆地。完整湖岸不以省界截断，城市可选范围仍是原来的江苏十三市。

## 坐标与精度

OSM 数据为 WGS84。依据 [阿里云 DataV 地图数据格式说明](https://help.aliyun.com/en/datav/datav-7-0/user-guide/map-data-format-1)，已有底图按 GCJ-02 处理。离线脚本执行 WGS84 → GCJ-02，再使用 `geometry.js` 相同的局部等距投影：`x=(lng-119.25)*cos(33°)*100, y=(lat-33)*100`。

水面拓扑保持简化阈值为 0.012 地图单位，约 13 米；坐标保留五位小数。已有行政区边界是概化数据，两种来源的岸线与省界精度不等，不代表测绘级定位。地形厚度为设计浅浮雕，水面反光是视觉模拟，不代表实际海拔、流量、潮汐或水动力计算。

`land` 是原城市多边形减去真实水面后的几何，渲染时实际挖空；行政边界、中心点、选城命中面及转场轮廓仍使用原数据。湖岛保持干燥。水面 z=6.85，陆地顶面 z=7；没有通过抬高透明贴片掩盖原来的陆地。

## 重建

安装开发期工具 `python -m pip install shapely`（浏览器没有新增依赖）。缓存文件放在指定源目录：

| 文件 | 请求 |
| --- | --- |
| `taihu-search.json` | `https://nominatim.openstreetmap.org/search?q=太湖&format=jsonv2&viewbox=119.8,31.6,120.8,30.8&bounded=1&polygon_geojson=1&limit=3`，确认 relation 1126533 |
| `yangtze-search.json` | `https://nominatim.openstreetmap.org/search?q=Yangtze%20River&format=jsonv2&polygon_geojson=1&limit=1`，确认 relation 9392345 |
| `river-surfaces.json` | Overpass：`[out:json][timeout:60];rel["water"="river"](31.3,118.3,32.5,122);out geom;` |
| `river-ways.json` | Overpass：`[out:json][timeout:60];way["water"="river"](31.3,120.9,32.1,122);out geom;` |
| `estuary.json` | Overpass：`[out:json][timeout:45];(rel["natural"="water"](31.4,121,32.1,121.9);way["waterway"="riverbank"](31.4,121,32.1,121.9);rel["waterway"="riverbank"](31.4,121,32.1,121.9);way["natural"="coastline"](31.4,121,32.1,121.9););out geom;` |

服务入口 `https://overpass-api.de/api/interpreter`，以 `data` 参数传查询。请求使用项目 User-Agent，并缓存成功 JSON，避免反复请求公共服务。此次输入 SHA-256 记录于 `water-source-checksums.json`；源数据会随 OSM 更新，不能假定未来 Nominatim 排序不变。

```sh
python scripts/build-atlas-water.py
python scripts/test-atlas-water.py
```

默认从仓库内的 `water-source.geo.json` 离线重建，无需再次下载。更新源数据时使用 `python scripts/build-atlas-water.py --source tmp`。简化后的水面再次裁回源水域，防止岸线外扩；序列化采用保持拓扑的精度网格，避免取整产生自相交。脚本在河道覆盖缺失或拓扑无效时失败，不自动补画河岸。离线生成后的页面不依赖 OSM API 的可用性。

## 材质与性能

`water.js` 的 `waterStyle` 集中管理色彩、反射、流速及帧率。河道材质使用沿程距离、横向偏移和局部切线；宽河段有细微横向速度差，噪声扰动叠加短波，避免整层平移和完全平行纹理。长三角河口是沿主流的视觉化表现，不模拟潮汐反向流。太湖使用独立的低幅交叠风波，时间直接进入连续函数，不按周期归零。

纹理坐标绑定地图局部空间；相机缩放/移动和物体变换不会改变纹理采样坐标。没有顶点位移，因此水岸与孔洞边界稳定。没有外部贴图、粒子、反射渲染通道或新动画循环。

- 复用地图单一 RAF；桌面目标上限 40 fps、移动端 24 fps，实际帧率受屏幕刷新率与设备能力影响。
- DPR 桌面上限 1.5、手机 1；CPU 流场和三角形细分只在场景初始化时执行。
- 页面隐藏、地图离屏或城市展场完全遮挡时停止持续绘制；回来继续已累计时间，不重新初始化水材质。
- 减少动态效果时冻结水纹并按需绘制；WebGL 不可用/上下文丢失时使用同一水陆几何的静态 SVG。
- 水面悬停仅局部增强微光，城市点击仍使用原行政区命中面。资源在卸载和上下文降级时统一释放。

当前地图没有自由旋转/手动缩放控件；保留并验证了原有选城镜头缩放及返回。真实低端移动 GPU 性能仍需实机测量，桌面浏览器的手机尺寸模拟不能代替硬件测试。

## 验证记录（2026-11-18）

- `python scripts/test-atlas-water.py`：5 项通过，检查序列化后拓扑、水陆分离、源岸线约束、60 个湖岛和下游沿程方向。
- 现有 `node --test apps/web/src/data/atlas/*.test.mjs`：5 项通过；浏览器原有回归覆盖十三市、104 条目、主题恢复、详情与返回。
- Chrome WebGL：水面时间递增且选城不重置；减少动态效果后停止连续绘制；移动端持续动画，路由卸载后停止。帧差检查中变化仅落在水域。
- 水面局部悬停与淡出通过；768、390、320px 布局和来源署名通过；主动丢失 WebGL 上下文后，静态水体及城市选择正常。
- `npm run build --prefix apps/web` 通过，仍有大 chunk 提示。地图延迟加载包约 1.85 MB（gzip 655 kB），包含精确水陆几何；没有新增浏览器依赖。低端手机性能和实际网络加载时间尚未实机验证。
