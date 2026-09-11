# API 总览

`@ym/map-tools` v3 按领域导出。根入口导出全部核心运行时 API 和模块类型；需要控制打包边界时可使用领域子路径。

| 领域        | 子路径                                                            | 主要 API                                                                                                                           |
| ----------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 资源        | `@ym/map-tools/resources`                                         | `upsertGeoJSONSource`、`updateSourceData`、`replaceVectorSource`、`ensureLayer`、`ensureLayers`、`removeResources`                 |
| 图层        | `@ym/map-tools/layers`                                            | `setLayerVisibility`、`getLayerVisibility`、`toggleLayerVisibility`、`setLayersVisibility`、`setSourceFilter`、`getSourceLayerIds` |
| 查询        | `@ym/map-tools/query`                                             | `waitForSourceLoaded`、`queryRenderedFeatures`                                                                                     |
| 视野        | `@ym/map-tools/viewport`                                          | `easeTo`、`panTo`、`setZoom`、`fitToFeatures`、`fitToGeometry`、`fitToRenderedLayer`                                               |
| 几何        | `@ym/map-tools/geometry`                                          | 坐标断言、方位角、要素过滤、线端点、面顶点、业务交点                                                                               |
| 覆盖物      | `@ym/map-tools/overlays`                                          | `removeOverlays`                                                                                                                   |
| Popup       | `@ym/map-tools/popup`                                             | `createPopupDom`、`PopupDomHandle`                                                                                                 |
| 事件        | `@ym/map-tools/events`                                            | `createMapEventController`、统一 `on` / `off` 事件类型                                                                             |
| 框架适配    | `@ym/map-tools/vue2`、`@ym/map-tools/vue3`、`@ym/map-tools/react` | `useMap`、框架版 `createPopupDom`                                                                                                  |
| Script 类型 | `@ym/map-tools/minemap`、`@ym/map-tools/umd`                      | `minemap` 与 `FE_utils` 显式全局声明                                                                                               |

所有参数校验失败都会抛出 `MapToolsError`，其 `code` 为 `INVALID_ARGUMENT`、`SDK_ERROR` 或 `DOM_UNAVAILABLE`。查询无命中返回空数组；删除不存在的资源会忽略。

## 类型入口

模块用户从根入口导入类型：

```ts
import type { Coordinate, MapLayer, MapSource, Padding, RenderedFeature } from "@ym/map-tools";
```

副作用 API 可接受最小能力接口，例如 `CameraMap`、`SourceMap`、`LayerMap`、`FilterMap`、`RenderedFeatureQueryMap` 与 `RemovableMap`；完整地图实例使用 `MapLike`。

minemap SDK 通过 CDN 的 Script 注入时，显式启用插件维护的补充声明：

```ts
/// <reference types="@ym/map-tools/minemap" />
```

UMD Script 用户改为：

```ts
/// <reference types="@ym/map-tools/umd" />
```

`minemap.d.ts` 仅覆盖本库、文档与示例实际使用过的 minemap v2.1.0 API，是经验型补充声明而非服务商官方类型包。
