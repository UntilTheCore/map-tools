---
name: minemap
description: MineMap 地图开发技能总入口。MineMap 是一套 GIS 地图全家桶，本仓库按能力划分为五个子技能：核心库（minemap.Map、图层/数据源、Marker/Popup、事件、要素查询、相机动画）、2D 工具库（minemaputil 测距测面积 + SpaceUtil 空间计算）、编辑/标绘插件（minemap.edit，画点线面/箭头/草图、二次编辑、undo/redo）、LBS 服务插件（minemap.service/component，路径规划、POI 搜索、地理编码、行政区域、轨迹处理、到达圈）、Web 服务 API（服务端 HTTP 接口，数据服务/位置服务/功能服务三大类，切片地址、要素编辑、WMTS、3D 服务、地理编码、POI 搜索、路径规划、几何运算、坐标转换）。本文件是总入口，先判断用户要做哪类 MineMap 开发任务，再路由到对应子技能获取完整 API 参考。涵盖地图初始化、addLayer、数据源、标记弹窗、事件绑定、要素查询、飞行动画、测距、测面积、空间计算、fitBounds、地图标绘、画点画线画面、二次编辑、路径规划、驾车/货车/步行导航、POI 搜索、关键字/周边/沿线搜索、地理编码、逆地理编码、行政区域、行政区划边界、输入提示、里程桩、轨迹纠偏、轨迹美化、到达圈、reacharea、矢量切片、WMTS、3D Tiles、地形切片、要素服务、缓冲区分析、几何运算、坐标投影。Use whenever the user works with minemap、minemap.Map、minemaputil、minemap.edit、minemap.service、天镜 Web 服务 API、tianjing-server、地图、GIS、地图编辑器、地图标绘、画点画线画面、测量、测距、测面积、空间计算、路径规划、POI 搜索、地理编码、行政区域、轨迹、切片服务、几何运算——即使没有明确提到 "minemap" 或 "api"。
---

# MineMap 开发技能

MineMap 是一套 GIS 地图能力全家桶，本仓库按能力拆成五个子技能。本文件是**总入口**：先判断本次任务属于哪一类，再路由到对应子技能文件查完整 API。子技能文件 = 唯一权威参考，本入口只负责「判断 + 引导 + 收拢通用约定」。

判断流程：**看下面路由表 → 确定子技能 → 读对应 SKILL.md → 需要细节再读其 `references/`。**

## 1. 任务路由表

| 用户想做的事                                                                                                                                                                                                                                                                             | 子技能            | 暴露的命名空间                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| 初始化地图、加图层/数据源（GeoJSON/Image/Video/Canvas）、Marker/Popup、UI 控件、事件绑定（click 的 layerId 过滤）、要素查询、featureState、相机动画（flyTo/easeTo/fitBounds）、自定义图层/图标                                                                                           | `minemap-2d-api`  | `minemap`                                                          |
| 测距/测面积工具（RangingTool）、输入 GeoJSON 让视口框住全部数据（fitBounds）、空间计算（两点距离、点到线距离、最近点、点在面内、中点、中心、形心）                                                                                                                                       | `minemap-2d-util` | `minemaputil`                                                      |
| 在图上画点/线/面/圆/矩形/三角形/扇形/箭头/草图等 30+ 模式、编辑已有几何（选中/移动/改形状点）、undo/redo 历史、自定义样式、吸附/锁定、合并拆分                                                                                                                                           | `minemap-edit`    | `minemap.edit`                                                     |
| 路径规划（驾车/货车/步行）、POI 搜索（关键字/周边/沿线/多边形/ID）、地理编码/逆地理编码、行政区域查询与边界、输入提示、道路搜索、里程桩、轨迹美化/匹配纠偏/重合度/停留点、到达圈、行政区划 GeoJSON 转换                                                                                  | `minemap-lbs`     | `minemap.service` / `minemap.component` / `minemap.lbsUtil`        |
| 服务端 HTTP 接口：矢量/栅格切片地址、地图服务与要素服务（含要素编辑）、OGC WMTS、3D Tiles/地形/模型服务、地图样式方案、行政区划与地理编码 HTTP 接口、POI 综合搜索、驾车/步行/骑行/公交路径规划、几何运算（面积周长、距离、缓冲区、凸包、切割、差集、交集、简化、合并等）、坐标转换与投影 | `minemap-service` | HTTP（`tianjing-server/mapdata-api` / `lbs-api` / `function-api`） |

**无法一眼确定时**：任务涉及"网页地图展示/交互/渲染" → 先查 `minemap-2d-api`；涉及"纯几何计算/测量数据" → `minemap-2d-util`；涉及"让用户在地图上画出/改图形" → `minemap-edit`；涉及"按位置查数据/算路径/地理信息转换"且用前端插件 → `minemap-lbs`；涉及"服务端接口地址/HTTP 请求/拿数据自己做渲染" → `minemap-service`。

## 2. 各子技能概览

### minemap-2d-api — 核心库（minemap.js）

核心库是地图引擎主体，全局命名空间 `minemap`。提供地图初始化、图层/样式、数据源、要素查询、事件、Marker/Popup、控件、交互、几何对象。**所有其他子技能都依赖它先加载。**

```html
<link rel="stylesheet" href="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css" />
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js"></script>
```

完整参考：`minemap-2d-api/SKILL.md`（内含任务路由表 → `references/map-core.md | marker.md | popup.md | controls.md | events-handlers.md | sources.md | geometry.md | custom-render.md`）。

### minemap-2d-util — 2D 工具库（minemap-util.js）

工具库暴露全局命名空间 `minemaputil`。RangingTool 测距测面积、fitBounds GeoJSON 视口适配、SpaceUtil 纯空间计算。单文件，无 references。

```html
<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/2d-util/minemap-util.js"></script>
```

完整参考：`minemap-2d-util/SKILL.md`。

### minemap-edit — 编辑/标绘插件（minemap-edit.js）

挂载在 `minemap.edit` 下。图形绘制（30+ 模式）、编辑（选中/移动/改形状点）、样式自定义、线面吸附、undo/redo 历史。**必须在地图 `load` 事件回调中初始化。**

```html
<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/edit/minemap-edit.js"></script>
```

完整参考：`minemap-edit/SKILL.md`。

### minemap-lbs — LBS 服务插件（minemap-service.js）

挂载在 `minemap` 下，提供位置服务封装：`minemap.service` 22 个静态 Promise 接口、`minemap.component` 8 个 UI 组件、`minemap.lbsUtil` 行政区划转换。

```html
<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/lbs/v1/minemap-service.js"></script>
```

完整参考：`minemap-lbs/SKILL.md`（Service 参数表在 `references/service-api.md`）。

### minemap-service — Web 服务 API（服务端 HTTP 接口）

不是前端脚本，无需 `<script>` 引入：直接对平台服务地址发起 HTTP/HTTPS 请求，返回 JSON / GeoJSON / PBF / 栅格图片。覆盖数据服务、位置服务、功能服务三大类共 40 个接口，全部需要 `key` 鉴权。适合"取切片地址交给地图加载""服务端做几何运算""批量查 POI/规划路径后自行渲染"等场景。

```text
数据服务  http(s)://<host>/tianjing-server/mapdata-api/services/...
位置服务  http(s)://<host>/tianjing-server/lbs-api/...
功能服务  http(s)://<host>/tianjing-server/function-api/services/geometryUtilities/GeometryServer/...
```

完整参考：`minemap-service/SKILL.md`（内含任务路由表 → 40 个 `references/*.md`，一页一接口）。

## 3. 通用约定

- **依赖顺序**：先引核心库 `minemap`，再引对应插件库（util / edit / lbs）。
- **命名空间**：核心库 `minemap`；工具库 `minemaputil`；编辑 `minemap.edit`；LBS 服务 `minemap.service`、组件 `minemap.component`、工具 `minemap.lbsUtil`。
- **坐标格式**：核心库与工具库统一 `[经度, 纬度]`（`lng, lat`），与 GeoJSON 一致。LBS 接口用 `"经度,纬度"` **字符串**：点内用 `,`、点间用 `;`、多区域/多点组用 `|`。Web 服务 API 的位置服务沿用同一套字符串约定，功能服务则用 Esri 几何 JSON（`rings` / `paths` / `points`）。
- **初始化时机**：地图本身 `new minemap.Map(...)` 立即可用；但 `minemap-edit` 初始化、LBS `PathAnalysis.on()` 都必须在 `map` 的 `load` 事件回调中调用。
- **版本**：核心库文档实测版本 2.1.1（文件夹名 2.1.4）；编辑插件 v2.1.0；LBS 文档 v2.2.1（脚本按 `.../lbs/v1/minemap-service.js` 加载）。资源统一从 `gmap.cqphx.cn:4443` 加载。
- **样式方案**：核心库需先设 `minemap.key` 与 `minemap.solution`（或 direct 传 `style` URL），LBS 各 `service` 请求必须带 `serviceUrl`。
- **两条调用路径不要混淆**：`minemap-lbs` 是**前端插件**，浏览器里 `minemap.service.*` 帮你封装好请求与组件 UI；`minemap-service` 是**服务端 HTTP 接口**，自己拼 URL 发请求拿原始 JSON/GeoJSON/PBF，需要自己渲染。同一个需求（如 POI 搜索）两者都能做，选一条即可，不要重复请求。

## 4. 官方 demo 参考

官网 demo 入口：https://minedata.cn/mine-support/web/v2/demo

- 地图初始化/飞行：`/map/base/map-show`、`/map/state/map-fly`
- 图层：`/layer/manage/layer-add`、`/layer/base/line-layer`
- Marker/Popup：`/overlay/marker/marker-add`、`/overlay/popup/popup-add`
- 事件：`/event/map/map-load`、`/event/mouse/mouse-click/`
