---
name: map-tools
description: 使用 @ym/map-tools v3 开发 minemap地图应用，处理 GeoJSON/vector 资源、图层显隐、渲染要素查询、视野控制、Popup 生命周期、Vue2/Vue3/React useMap，以及 CDN Script 的 minemap 和 UMD 类型入口时使用。
---

# @ym/map-tools v3

`@ym/map-tools` 是基于 `@turf/turf` 的 minemap 工具库。minemap SDK 由页面 Script 从 CDN 注入，本库不引入 minemap npm 运行时依赖。当前目标版本为 **3.0.0**，采用破坏性 API 重构，不保留 v2 兼容别名。

## 安装与 SDK

私仓：`http://192.168.3.180:4873/`。

```ini
@ym:registry=http://192.168.3.180:4873/
```

```bash
pnpm add @ym/map-tools
```

index.html 页面先加载 minemap v2.1.0：

```html
<!-- minemap 基础样式 css -->
<link rel="stylesheet" href="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css" />
<!-- minemap 的核心 js api-->
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js"></script>
<!-- 提供地图绘图和编辑特性 -->
<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/edit/minemap-edit.js"></script>
<!-- 提供地理位置计算相关的计算功能 -->
<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/2d-util/minemap-util.js"></script>
<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/lbs/v1/minemap-service.js"></script>
<!-- 提供echarts 支持，地图内echarts效果必须使用提供的插件，不能自行安装依赖替换 -->
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/plugins/echarts/echarts.3.8.5.min.js"></script>
<!-- template 插件中包含 echarts 的模块内容 -->
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/plugins/template/template.js"></script>
<!-- 部分3D 效果需要此插件 -->
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/plugins/deckgl/deckgl.min.js"></script>
```

SDK 没有官方 npm 类型包；类型由独立包 `@ym/minemap-types` 提供（经 `@ym/map-tools` 的 dependencies 自动传递，无需单独安装）。CDN Script 用户在 TypeScript 中显式启用补充声明：

```ts
/// <reference types="@ym/map-tools/minemap" />
```

不使用 `@ym/map-tools`、只加载 minemap SDK 的项目，可直接安装并激活类型包：`/// <reference types="@ym/minemap-types" />`（或 tsconfig `"types": ["@ym/minemap-types"]`）。声明覆盖 `minemap` / `minemaputil` / `minemap.edit` / `minemap.lbsUtil`，是依据官方 skill 参考文档与 minemap v2.1.0 实际使用维护的经验型声明（唯一定义源在 monorepo `packages/minemap-types`）；未确认字段使用 `unknown`，不得依赖 SDK 私有字段如 `_data`。

## 入口

| 场景      | 导入路径                  | 能力                                      |
| --------- | ------------------------- | ----------------------------------------- |
| 核心      | `@ym/map-tools`           | 全部框架无关 core API 与模块类型          |
| Resources | `@ym/map-tools/resources` | source/layer 创建、替换、清理、id         |
| Layers    | `@ym/map-tools/layers`    | 图层显隐                                  |
| Query     | `@ym/map-tools/query`     | source 等待、渲染要素查询                 |
| Viewport  | `@ym/map-tools/viewport`  | 相机与 bbox 视野                          |
| Geometry  | `@ym/map-tools/geometry`  | 坐标与纯几何工具                          |
| Overlays  | `@ym/map-tools/overlays`  | marker/popup 覆盖物清理                   |
| Popup     | `@ym/map-tools/popup`     | 框架无关 `createPopupDom`                 |
| Events    | `@ym/map-tools/events`    | `createMapEventController` 与统一事件类型 |
| Vue 3     | `@ym/map-tools/vue3`      | `useMap`、Vue `createPopupDom`            |
| Vue 2.7   | `@ym/map-tools/vue2`      | `useMap`、Vue 2.7 `createPopupDom`        |
| React     | `@ym/map-tools/react`     | `useMap`、React `createPopupDom`          |
| UMD 类型  | `@ym/map-tools/umd`       | `FE_utils` 与 minemap 全局声明            |

UMD 运行时继续使用：

```html
<script src="./dist/umd/index.umd.js"></script>
```

全局名固定为 `FE_utils`。TS Script 页面加：

```ts
/// <reference types="@ym/map-tools/umd" />
```

## 核心 API

### Resources

```ts
import {
  createLayerId,
  createSourceId,
  ensureLayers,
  removeResources,
  replaceVectorSource,
  updateSourceData,
  upsertGeoJSONSource,
} from "@ym/map-tools";

const sourceId = createSourceId("demo", "district");
const layerId = createLayerId("demo", "district");

upsertGeoJSONSource(map, { id: sourceId, data: featureCollection });
ensureLayers(map, [{ id: layerId, type: "fill", source: sourceId }]);
```

- `upsertGeoJSONSource`：source 不存在则创建并返回 `"created"`；已存在的 GeoJSON source 只调 `setData` 并返回 `"updated"`；source 类型不匹配时抛出错误，不静默替换。
- `updateSourceData`：仅更新已存在 GeoJSON source 的数据，返回 `boolean`；缺失或类型不符返回 `false`。
- `ensureLayer` / `ensureLayers`：layer 缺失时补建；`ensureLayers` 返回实际添加数量。
- `replaceVectorSource(map, { id, tiles, layers })`：只删除本次明确传入关联 layer，删除旧 vector source，再按传入顺序重建。
- `removeResources`：固定先删 layer、后删 source；不存在资源忽略。

### Layers

```ts
setLayerVisibility(map, layerId, true);
setLayersVisibility(map, [layerIdA, layerIdB], false);
const visibility = toggleLayerVisibility(map, layerId);
```

显隐 API 只负责显隐，不负责数据加载。不存在图层时：`setLayerVisibility` 返回 `false`，`toggleLayerVisibility` 返回 `undefined`。

### Query 与 Viewport

```ts
const loaded = await waitForSourceLoaded(map, sourceId, {
  timeoutMs: 30_000,
  intervalMs: 1_000,
  signal,
});

const features = queryRenderedFeatures(map, { layers: [layerId] });
fitToFeatures(map, features, {
  padding: { top: 60, right: 60, bottom: 60, left: 60 },
});
```

- `waitForSourceLoaded` 立即检查，超时或取消返回 `false`。
- `queryRenderedFeatures` 返回当前已渲染要素，空结果返回 `[]`。
- `fitToFeatures` / `fitToGeometry` 用 Turf `bbox` 处理完整几何。
- `fitToRenderedLayer` 默认不改变 zoom；需要扩大抓取范围时放在 `beforeQuery` 中显式处理。
- `easeTo`、`panTo`、`setZoom` 直接映射相机行为，`setZoom` 没有硬编码阈值。

### Geometry 与覆盖物

```ts
assertCoordinate([106.55, 29.56]);
const bearing = getBearing(from, to);
const endpoints = getLineEndpoints(lineFeatures);
const removed = removeOverlays([marker, popup]);
```

`Coordinate` 严格为只读 `[longitude, latitude]`，两个元素必须为有限数。业务化 `getPolygonRightIntersection` 只从 `@ym/map-tools/geometry` 导出。

### Popup

```ts
const handle = createPopupDom({ kind: "text", value: "详情" });
popup.setDOMContent(handle.element);
handle.dispose();
```

- 文本用 `{ kind: "text" }`，走 `textContent`。
- HTML 必须显式用 `{ kind: "html" }`，调用方负责输入安全。
- Vue/React 子路径的 `createPopupDom` 接受组件或 ReactElement，`dispose()` 会卸载框架根节点。

## `useMap`

```ts
const { mapRef, setMap, on, off, unbindAll } = useMap({
  layers: {
    click: ["district-fill"],
    mousemove: ["district-fill"],
    zoomend: ["district-fill"],
  },
  zoomQueryBy: "mouse",
  mapLifecycle: "external",
});

const unsubscribe = on("click:layer", ({ features, layerIds }) => {
  console.log(features, layerIds);
});

setMap(map);
unsubscribe();
unbindAll();
```

事件名：`loaded`、`click:layer`、`click:empty`、`mousemove:layer`、`mousemove:empty`、`zoomend:layer`、`zoomend:empty`。

- 事件 payload 传递完整 `features` 数组、`layerIds`、原始事件、地图实例及适用坐标。
- `setMap` 可重复调用，替换实例时会解绑旧监听。
- 默认 `mapLifecycle: "external"`；`"owned"` 才在框架卸载时 `map.remove()`。
- Vue `mapRef.value` 是 `shallowRef + markRaw`；React 使用 `mapRef.current`。

## 错误与类型约定

`MapToolsError.code`：`INVALID_ARGUMENT`、`SDK_ERROR`、`DOM_UNAVAILABLE`。

模块类型：

```ts
import type { Coordinate, MapLayer, MapSource, Padding, RenderedFeature } from "@ym/map-tools";
```

`MapSource` 是 `geojson | vector` 判别联合。不要向 Vector source 调用 `setData`；使用 `isGeoJSONSource` 进行运行时缩窄。

## v2 删除项

禁止继续建议或生成以下 v2 API：

- `setSourceData`、`setMultipleLayerSourceData`、`setPbfSourceData`
- `showLayer`、`hideLayer`、`toggleLayer`
- `checkSourceLoaded`、`getPbfFeatureListSync`、`getPbfFeatureListAsync`
- `setViewPort`、`setViewPortByPolygon`、`setPbfLayerViewport`
- `moveAndZoom`、`moveMap`
- `removeMarkers`、`removeMarkersOrPopups`
- `mapInitialize`、`unBindMapEvent`、旧事件 setter
- `getPopupDom`

使用 `packages/docs-preview/guide/migration.md` 的 v2→v3 对照表完成迁移。
