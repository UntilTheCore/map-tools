# API 总览

以下清单从 `packages/map-tools` 源码与 `dist/types` 提取，与真实导出保持一致。

## 模块划分

| 模块 | 来源文件 | 页面 |
| --- | --- | --- |
| mapTool | `src/core/mapTool.ts` | [查看](/api/mapTool) |
| layerTool | `src/core/layerTool.ts` | [查看](/api/layerTool) |
| sourceTools | `src/core/sourceTools.ts` | [查看](/api/sourceTools) |
| pointTool | `src/core/pointTool.ts` | [查看](/api/pointTool) |
| lineTool | `src/core/lineTool.ts` | [查看](/api/lineTool) |
| polygonTool | `src/core/polygonTool.ts` | [查看](/api/polygonTool) |
| popupTool | `src/core/popupTool.ts` | [查看](/api/popupTool) |
| useMap | `src/vue/useMap.ts` / `src/react/useMap.ts` | [查看](/api/useMap) |

## 根入口导出清单（`@ym/map-tools`）

```ts
// mapTool
destroyMap, clearAllSourceAndLayer,
setSourceData, setMultipleLayerSourceData, setPbfSourceData,
moveAndZoom, moveMap, setZoom,
removeMarkers, removeMarkersOrPopups,
getBearing, getRotation, getRotationByCoordinate,
getCenterBetweenRightPointIntersection, checkCoordinate,
setViewPortByPolygon, setViewPort, setPbfLayerViewport,
getFeatureTypeList, FeatureTypeEnum, ViewPortOption,

// layerTool
setSourceIdName, setLayerIdName,
showLayer, hideLayer, hideLayers, showLayers, toggleLayer,
getPbfFeatureListSync, getPbfFeatureListAsync,

// sourceTools
checkSourceLoaded,

// pointTool
pointListToCoordList,

// lineTool
getLineStringEndpoint,

// polygonTool
getPolygonVertex,

// popupTool
getPopupDom,
```

## 子路径导出

| 子路径 | 导出 |
| --- | --- |
| `@ym/map-tools/vue2` | `{ getPopupDom, useMap }` |
| `@ym/map-tools/vue3` | `{ getPopupDom, useMap }` |
| `@ym/map-tools/react` | `{ getPopupDom, useMap }` |

- vue 版 `useMap` 返回的 `mapInstance` 为 `Ref<minemap.Map>`（`.value` 访问）；
- react 版 `useMap` 返回的 `mapInstance` 为 `MutableRefObject<minemap.Map>`（`.current` 访问）。

## 关键类型

```ts
export type RenderedFeature = Feature & { layer: { id: string } };

export type EventDispatcherData = {
    layerId: string;
    feature: Feature | FeatureCollection;
    mapEvent: any;
};

export type ZoomLayerEventData = {
    zoom: number;
    mouseCoordinate: number[];
    mapCenterCoordinate: number[];
} & EventDispatcherData;

export type MapHookOption = {
    map?: minemap.Map;
    bindClickLayers?: string[];
    bindMouseMoveLayers?: string[];
    bindZoomLayers?: string[];
    zoomQueryBy?: "map" | "mouse";
};

export type ViewPortOption = {
    boundary?: number[]; // [上, 右, 下, 左]
};

export enum FeatureTypeEnum {
    Point = "Point",
    LineString = "LineString",
    MultiLineString = "MultiLineString",
    Polygon = "Polygon",
    MultiPolygon = "MultiPolygon",
}
```

## 快速索引

- 地图操作：`destroyMap` / `moveAndZoom` / `moveMap` / `setZoom` / `setViewPort` / `setViewPortByPolygon` / `setPbfLayerViewport`
- 数据源与图层：`setSourceData` / `setMultipleLayerSourceData` / `setPbfSourceData` / `checkSourceLoaded` / `setSourceIdName` / `setLayerIdName`
- 图层显隐：`showLayer` / `hideLayer` / `showLayers` / `hideLayers` / `toggleLayer`
- PBF 要素：`getPbfFeatureListSync` / `getPbfFeatureListAsync`
- 覆盖物清理：`removeMarkers` / `removeMarkersOrPopups`
- 几何计算：`getBearing` / `getRotation` / `getRotationByCoordinate` / `getCenterBetweenRightPointIntersection` / `checkCoordinate` / `pointListToCoordList` / `getLineStringEndpoint` / `getPolygonVertex` / `getFeatureTypeList`
- 弹窗：`getPopupDom`
- 框架 Hook：`useMap`
