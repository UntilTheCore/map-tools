# v2 → v3 迁移

v3 是破坏性版本，不提供旧 API 兼容层。核心重构为领域模块，且 minemap 与 UMD 类型改为显式入口。

| v2 API                                             | v3 API                                                        |
| -------------------------------------------------- | ------------------------------------------------------------- |
| `setSourceData` / `setMultipleLayerSourceData`     | `upsertGeoJSONSource` + `ensureLayers`                        |
| `setSourceData`（仅更新）                          | `updateSourceData`                                            |
| `setPbfSourceData`                                 | `replaceVectorSource`                                         |
| `showLayer` / `hideLayer`                          | `setLayerVisibility`                                          |
| `showLayers` / `hideLayers`                        | `setLayersVisibility`                                         |
| `toggleLayer({ getData })`                         | 显式完成数据加载，再调用 `setLayerVisibility`                 |
| `checkSourceLoaded`                                | `waitForSourceLoaded`                                         |
| `getPbfFeatureListSync` / `getPbfFeatureListAsync` | `queryRenderedFeatures`                                       |
| `setViewPort`                                      | `fitToFeatures`                                               |
| `setViewPortByPolygon`                             | `fitToGeometry`                                               |
| `setPbfLayerViewport`                              | `fitToRenderedLayer`                                          |
| `moveAndZoom`                                      | `easeTo`                                                      |
| `moveMap`                                          | `panTo`                                                       |
| `removeMarkers` / `removeMarkersOrPopups`          | `removeOverlays`                                              |
| `mapInitialize`                                    | `setMap`                                                      |
| `unBindMapEvent`                                   | `unbindAll`                                                   |
| 事件 setter                                        | `on` / `off`                                                  |
| `getPopupDom`                                      | `createPopupDom`，使用 `handle.element` 与 `handle.dispose()` |

## 类型变更

- 根入口不自动污染全局 `minemap`。
- Script SDK 用户：`/// <reference types="@ym/map-tools/minemap" />`。
- UMD 用户：`/// <reference types="@ym/map-tools/umd" />`。
- `Coordinate` 为只读二元组，`Padding` 改为 `{ top, right, bottom, left }`，不再接受顺序不明确的 padding 数组。
- source/layer 扩展字段统一为 `unknown`，不再暴露 `[key: string]: any`。

## 行为变更

- `setZoom` 不再限制 `zoom > 10`。
- 资源删除固定先 layer 后 source。
- `fitToRenderedLayer` 默认不改变 zoom；需要改变视野抓取范围时通过 `beforeQuery` 明确执行。
- Popup 文本默认用 `textContent`；只有 `{ kind: "html" }` 才会写入 HTML。
- `useMap` 命中事件提供完整 `features` 数组，而不再只传第一个要素。
