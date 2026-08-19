---
name: map-tools
description: 使用 @ym/map-tools 地图工具库开发 minemap（元图科技 Minedata）地图应用、进行多框架（Vue2/Vue3/React/原生 HTML）接入、查询图层/数据源/视野控制/PBF 矢量瓦片/Popup/useMap 等 API 用法时使用。
---

# @ym/map-tools 地图工具库

基于 `@turf/turf` 与 minemap（Minedata）SDK 的地图工具库，当前版本 **2.0.1**，发布于 Verdaccio 私仓。提供数据源/图层管理、视野控制、PBF 矢量瓦片、Popup、多框架事件 Hook（useMap）等能力。

## 一、安装与私仓配置

私仓地址：`http://192.168.3.180:4873/`。二选一：

- 项目 `.npmrc` 配置（推荐，pnpm 与 npm 通用）：

```ini
@ym:registry=http://192.168.3.180:4873/
```

- 或安装时指定：

```bash
pnpm add @ym/map-tools --registry http://192.168.3.180:4873
```

`vue`(>=2.7.0)、`react`/`react-dom`(>=18.0.0) 均为可选 peerDependencies，按所用框架自行安装，不装也不报错。

## 二、五种接入方式

| 场景 | 导入路径 | 说明 |
| --- | --- | --- |
| 纯 JS/TS 核心 | `@ym/map-tools` | 全量核心函数，不依赖任何框架 |
| Vue 3 | `@ym/map-tools/vue3` | 导出 `getPopupDom`、`useMap` |
| Vue 2（2.7+） | `@ym/map-tools/vue2` | 与 vue3 共用同一套 vue-demi 实现 |
| React（18+） | `@ym/map-tools/react` | 导出 `getPopupDom`、`useMap` |
| 原生 HTML（UMD） | `script` 标签 | 全局名 `FE_utils`，产物 `dist/umd/index.umd.js` |

UMD 的 unpkg/jsdelivr 字段均已配置为 `dist/umd/index.umd.js`，若包同步至公网 npm 可用：

```html
<script src="https://unpkg.com/@ym/map-tools@2.0.1/dist/umd/index.umd.js"></script>
```

私仓环境下请改为私仓静态资源地址或本地 `dist/umd/index.umd.js`。UMD 建议仅通过 `<script>` 标签引入使用（全局 `FE_utils`）；`import "@ym/map-tools/umd"` 仅作副作用加载且无类型声明，不建议在 TS 项目中使用。

## 三、核心 API 速查（`@ym/map-tools` 主入口）

| 模块 | 导出 | 用途 |
| --- | --- | --- |
| mapTool | `destroyMap(map)` | 销毁地图实例（`map.remove()`） |
| mapTool | `clearAllSourceAndLayer(map, constant)` | 按命名常量对象批量清除图层与数据源 |
| mapTool | `setSourceData(map, sourceId, layer, featureCollection, option?)` | 设置 GeoJSON 数据源与图层；option 支持 `afterSetData`/`afterSetLayer`/`sourceOption` 回调与源配置 |
| mapTool | `setMultipleLayerSourceData(map, sourceId, layers[], featureCollection, option?)` | 多个图层共用一个数据源，每个 layer 各触发一次回调 |
| mapTool | `setPbfSourceData(map, sourceId, layer, tiles[])` | 设置 vector(PBF) 数据源，重复设置时自动删除重建旧源 |
| mapTool | `moveAndZoom(map, coordinate, zoom=12)` | `easeTo` 平滑移动并缩放 |
| mapTool | `moveMap(map, coordinate)` | `panTo` 平移地图 |
| mapTool | `setZoom(map, zoom)` | 设置缩放级别（仅 `zoom > 10` 生效） |
| mapTool | `removeMarkers(markers)` | 移除 Marker，支持单个 Marker 或 Marker 数组（批量清理） |
| mapTool | `removeMarkersOrPopups(list[])` | 批量移除 Marker 或 Popup 混合数组 |
| mapTool | `getBearing(currentPoint, nextPoint)` | 计算两坐标方位角 |
| mapTool | `getRotation(bearing, compensation=180)` | 方位角换算旋转角（默认补偿 180°） |
| mapTool | `getRotationByCoordinate(currentPoint, nextPoint, compensation=180)` | 两坐标直接得旋转角 |
| mapTool | `getCenterBetweenRightPointIntersection(coordinates)` | 求多边形中心点与最右侧点连线的交叉点坐标 |
| mapTool | `checkCoordinate(coordinate)` | 校验坐标是否为 `[lng, lat]` 两元素数值数组，非法抛错 |
| mapTool | `setViewPortByPolygon(map, polygon, boundary)` | 按单个多边形 bbox 设置视野（fitBounds） |
| mapTool | `setViewPort(map, overlays[], option?)` | 按点/线/面覆盖物集合计算最优视野；option.boundary 默认 `[150,250,150,250]` |
| mapTool | `setPbfLayerViewport({map, layerId, sourceId, limit?, autoZoom?, zoom?, zoomFn?})` | 设置 PBF 图层视口：等待源加载完成后按图层要素 setViewPort |
| mapTool | `getFeatureTypeList(featureList, featureType)` | 按要素类型过滤 feature 数组 |
| mapTool | `FeatureTypeEnum` | 枚举：Point/LineString/MultiLineString/Polygon/MultiPolygon |
| mapTool | `ViewPortOption` | 类型：`{ boundary?: number[] }` |
| layerTool | `setSourceIdName(prefix, name="")` | 生成数据源 id：`${prefix}-${name}-source` |
| layerTool | `setLayerIdName(prefix, name="")` | 生成图层 id：`${prefix}-${name}-layer` |
| layerTool | `showLayer(map, layerId)` | 显示单个图层 |
| layerTool | `hideLayer(map, layerId)` | 隐藏单个图层 |
| layerTool | `showLayers(map, layerIdList[])` | 显示多个图层 |
| layerTool | `hideLayers(map, layerIdList[])` | 隐藏多个图层 |
| layerTool | `toggleLayer({map, layerId, sourceId?, visible?, getData?})` | 切换图层显隐；传入 `getData` 为受控模式（数据驱动），否则为非受控纯显隐切换 |
| layerTool | `getPbfFeatureListSync(map, pbfLayerId)` | 同步获取 PBF 图层渲染要素（`queryRenderedFeatures`），转 turf Feature 数组 |
| layerTool | `getPbfFeatureListAsync(map, layerId, sourceId, option?)` | 异步获取 PBF 要素：等待源加载，`option.limit` 超时秒数（默认 30），超时返回 `[]` |
| sourceTools | `checkSourceLoaded({map, sourceId, limit?})` | 轮询检查数据源是否加载完成，返回 `Promise<boolean>` |
| pointTool | `pointListToCoordList(list)` | Point feature 数组转坐标数组 |
| lineTool | `getLineStringEndpoint(featureCollection)` | 获取线（含 MultiLineString）端点坐标，供视野计算 |
| polygonTool | `getPolygonVertex(featureCollection)` | 获取多边形（含 MultiPolygon）顶点坐标，供视野计算 |
| popupTool | `getPopupDom(content, opts?, mount?)` | 创建 popup 容器 DOM；无 mount 时支持 string/HTMLElement，有 mount 时由框架适配器挂载 |
| popupTool | `PopupOptions` / `PopupMountFn` | 挂载选项与挂载函数类型 |
| types | `MapHookOption` / `BindFn` / `EventDispatcherData` / `ZoomLayerEventData` / `RenderedFeature` | useMap 相关类型（vue/react 子路径同样重导出） |

## 四、useMap 用法（Vue2/Vue3/React 子路径）

参数 `MapHookOption`：

| 字段 | 说明 |
| --- | --- |
| `map?` | 地图实例；不传则需用返回的 `mapInitialize` 手动绑定 |
| `bindClickLayers?` | 监听点击事件的图层 id 数组 |
| `bindMouseMoveLayers?` | 监听鼠标移动事件的图层 id 数组 |
| `bindZoomLayers?` | 监听缩放事件的图层 id 数组 |
| `zoomQueryBy?` | 缩放查询基准：`"mouse"`（默认）或 `"map"`（坐标查询有偏移，慎用） |
| `destroyOnUnmount?` | 仅 React 版：卸载时是否销毁地图实例，默认 `false`（只解绑不销毁，与 vue 版一致） |

返回值：`mapInstance`、`mapInitialize(map)`、`onMapLoaded(fn)`、`onClickLayerEventDispatcher(fn)`、`onClickNoInLayers(fn)`、`onMouseMoveLayerEventDispatcher(fn)`、`onMoveNoInLayers(fn)`、`onZoomLayerEventDispatcher(fn)`、`onZoomNoInLayers(fn)`、`unBindMapEvent()`。

事件分发回调收到 `{ layerId, feature, mapEvent }`；缩放分发额外带 `zoom`、`mouseCoordinate`、`mapCenterCoordinate`。

框架差异：

- **Vue 版**：`mapInstance` 是 `Ref`（经 `.value` 访问）；组件卸载时自动解绑事件（不销毁地图）。
- **React 版**：`mapInstance` 是 `MutableRefObject`（经 `.current` 访问）；组件卸载时自动解绑事件，默认**不销毁地图**（与 vue 版一致），仅当 `destroyOnUnmount: true` 时调用 `destroyMap`。默认不销毁可避免 React StrictMode 双挂载把外部传入的地图实例意外销毁。
- vue2 与 vue3 子路径共用同一实现，由 vue-demi 按项目中安装的 vue 版本自动切换。

## 五、minemap 前置依赖

- minemap 是元图科技（Minedata）地图 JS SDK，**无 npm 包**，使用前必须经 CDN 引入（v3.0.0 官方地址，实际以项目内网/官方文档为准）：

```html
<script src="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js"></script>
```

- 初始化前需配置 token 与 solution：`minemap.key = "..."`、`minemap.solution = ...`（部分版本为 `accessToken`），再 `new minemap.Map({...})`。
- **类型为全局声明**：包内置 `src/types/minemap.d.ts`（`declare namespace minemap`），随 `dist/types` 发布且产物 d.ts 已自动补三斜线引用。TS 项目无需 import，直接用 `minemap.Map`、`MapLayer`、`MapSource` 等全局类型。

## 六、各框架最小示例（Vue 组件 getPopupDom 必须用渲染函数定义，禁止 .vue SFC）

**核心 TS：**

```ts
import { setSourceData, setViewPort } from "@ym/map-tools";
const map = new minemap.Map({ container: "map", style: STYLE_URL, center: [116.46, 39.92], zoom: 10 });
const fc = { type: "FeatureCollection", features: [] };
setSourceData(map, "demo-source", { id: "demo-layer", type: "circle", source: "demo-source" }, fc);
setViewPort(map, fc.features);
```

**Vue 3：**

```ts
import { useMap, getPopupDom } from "@ym/map-tools/vue3";
const { mapInstance, mapInitialize, onClickLayerEventDispatcher } = useMap({ bindClickLayers: ["demo-layer"] });
onClickLayerEventDispatcher(({ layerId, feature }) => console.log(layerId));
map.on("load", () => mapInitialize(map));
new minemap.Popup().setDOMContent(getPopupDom(Comp, { data: 1 }));
```

**Vue 2（2.7+，setup 语法）：**

```js
import { useMap } from "@ym/map-tools/vue2";
export default {
  setup() {
    const { mapInstance, mapInitialize, onClickLayerEventDispatcher } = useMap({});
    onClickLayerEventDispatcher(({ layerId }) => console.log(layerId));
    return { mapInstance, mapInitialize };
  },
};
```

**React（18+）：**

```tsx
import { useMap } from "@ym/map-tools/react";
import { useEffect } from "react";
function MapPanel() {
  const { mapInstance, mapInitialize, onClickLayerEventDispatcher } = useMap({});
  useEffect(() => mapInitialize(map), []);
  onClickLayerEventDispatcher(({ layerId }) => console.log(layerId));
  return <div id="map" />; // 访问实例用 mapInstance.current
}
```

**原生 HTML（UMD）：**

```html
<script src="https://unpkg.com/@ym/map-tools@2.0.1/dist/umd/index.umd.js"></script>
<script>
  const map = new minemap.Map({ container: "map", style: STYLE_URL, center: [116.46, 39.92], zoom: 10 });
  FE_utils.setViewPort(map, features);
  FE_utils.getPopupDom("<div>hello</div>");
</script>
```

## 七、注意事项与破坏性变更

- **包名变更**：v1 为 `@rainroad/map-tools`，v2 为 `@ym/map-tools`（私仓 `http://192.168.3.180:4873`）。
- **主入口 useMap/getPopupDom 移除**：主入口不再导出 `useMap` / 框架版 `getPopupDom`，改由子路径提供：`@ym/map-tools/vue3`、`@ym/map-tools/vue2`、`@ym/map-tools/react`。
- **CDN URL 变化**：UMD 新直链 `https://unpkg.com/@ym/map-tools@2.0.1/dist/umd/index.umd.js`（jsdelivr：`https://cdn.jsdelivr.net/npm/@ym/map-tools@2.0.1/dist/umd/index.umd.js`）；私仓环境需自托管 `dist/umd/index.umd.js`。
- **浏览器最低版本**：Chrome/Edge 107+、Firefox 104+、Safari 16+，不支持 IE；老打包器自动回退 CJS 入口。
- **getPopupDom 语义变化**：主入口（核心）的 `getPopupDom` 为纯 DOM 版（string 走 innerHTML / HTMLElement 直接 append），框架组件挂载版由各子路径导出。
- **skipLibCheck 建议**：消费者项目建议开启 `skipLibCheck: true`，规避 `@turf/turf@6` 类型与新版 TypeScript 的解析问题。
- **popup 字符串内容转义警示**：纯 DOM 分支 string 按 HTML 解析（innerHTML），存在 XSS 风险，传入不可信内容前必须自行转义。
- **useMap 的 destroyOnUnmount 选项**：仅 React 版生效，默认 `false`（卸载只解绑不销毁，与 vue 版一致）；设为 `true` 时卸载调用 `destroyMap`。

- **已删除 API**：`getLineEndpoint` 在 v2.0.0 已彻底移除，请改用 `getLineStringEndpoint`。
- **已弃用 API**：`hiddenLayer`、`hiddenLayers` 已标记 `@deprecated`，请改用 `hideLayer`、`hideLayers`，勿在新代码中使用。
- **vue-demi 机制**：`/vue2` 与 `/vue3` 导出完全一致，由 vue-demi 根据项目安装的 vue 版本（2.7+ 或 3.x）自动切换，不要在 vue2 项目误导入 `/vue3` 路径（反之亦然，虽能运行但语义混乱）。
- **UMD 全局名**：script 引入后挂在 `window.FE_utils` 上，unpkg/jsdelivr 字段已配置；私仓发布环境请从私仓静态资源或本地 `dist/umd/index.umd.js` 获取。
- **minemap 类型为全局声明**：由包内 `dist/types/types/minemap.d.ts` 提供，无需 import minemap；若类型未生效，检查 tsconfig 是否包含 node_modules 类型解析，并确认已通过 CDN 实际引入 minemap.js。
- **setZoom 陷阱**：`setZoom` 仅当 `zoom > 10` 才生效；与 `moveMap` 连用需将 `setZoom` 用 setTimeout 延后，同时移动+缩放推荐直接 `map.easeTo`（即 `moveAndZoom`）。
- **vue getPopupDom 限制**：组件必须用渲染函数定义（`h` 函数），禁止传 .vue SFC 文件导入的组件。
- **React useMap 卸载行为**：卸载时自动 `unBindMapEvent`；默认不销毁地图（与 vue 版一致），仅当 `destroyOnUnmount: true` 时调用 `destroyMap`。外部传入的地图实例保持默认值，避免 React StrictMode 双挂载将其意外销毁。
- **PBF 相关**：`getPbfFeatureListAsync`/`checkSourceLoaded` 超时上限由 `limit`（秒，默认 30）控制，超时返回空数组；`setPbfLayerViewport` 会先等源加载再设视野。
