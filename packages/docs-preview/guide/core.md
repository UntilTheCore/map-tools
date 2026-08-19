# 接入方式 · 核心（core）

核心入口导出全部纯函数 API，不依赖任何框架，适用于任意框架项目或无框架环境。

## 安装

```bash
pnpm add @ym/map-tools
```

## 导入

```ts
import {
  destroyMap,
  clearAllSourceAndLayer,
  setSourceData,
  setMultipleLayerSourceData,
  setPbfSourceData,
  moveAndZoom,
  moveMap,
  setZoom,
  removeMarkers,
  removeMarkersOrPopups,
  getBearing,
  getRotation,
  getRotationByCoordinate,
  getCenterBetweenRightPointIntersection,
  checkCoordinate,
  setViewPortByPolygon,
  setViewPort,
  setPbfLayerViewport,
  getFeatureTypeList,
  FeatureTypeEnum,
  setSourceIdName,
  setLayerIdName,
  showLayer,
  hideLayer,
  hideLayers,
  showLayers,
  toggleLayer,
  getPbfFeatureListSync,
  getPbfFeatureListAsync,
  checkSourceLoaded,
  pointListToCoordList,
  getLineStringEndpoint,
  getPolygonVertex,
  getPopupDom,
} from "@ym/map-tools";
```

## 基础用法

### 初始化与销毁

```ts
import { destroyMap } from "@ym/map-tools";

const map = new minemap.Map({
  container: "map",
  style: "https://service.minedata.cn/map/solu/style/11003",
  center: [116.4026, 39.9494],
  zoom: 10,
});

// 销毁地图
destroyMap(map); // 内部等价 map.remove()
```

### 添加 GeoJSON 图层

```ts
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";

const sourceId = setSourceIdName("demo", "district"); // "demo-district-source"
const layerId = setLayerIdName("demo", "district");   // "demo-district-layer"

map.on("load", () => {
  setSourceData(
    map,
    sourceId,
    {
      id: layerId,
      type: "fill",
      source: sourceId,
      paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
    },
    {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "核心区" },
          geometry: {
            type: "Polygon",
            coordinates: [[[116.35, 39.88], [116.42, 39.88], [116.42, 39.93], [116.35, 39.93], [116.35, 39.88]]],
          },
        },
      ],
    }
  );
});
```

### 图层显隐

```ts
import { showLayer, hideLayer, showLayers, hideLayers, toggleLayer } from "@ym/map-tools";

hideLayer(map, layerId);
showLayer(map, layerId);
hideLayers(map, [layerIdA, layerIdB]);
showLayers(map, [layerIdA, layerIdB]);

// 非受控切换（自动读取当前可见性）
toggleLayer({ map, layerId });
```

### 视野控制

```ts
import { moveAndZoom, moveMap, setZoom, setViewPort } from "@ym/map-tools";

moveAndZoom(map, [116.3976, 39.9087], 12); // easeTo
moveMap(map, [116.3154, 39.9829]);         // panTo
setZoom(map, 14);                          // 注意：zoom <= 10 时不生效
setViewPort(map, features, { boundary: [60, 60, 60, 60] }); // fitBounds 自适应
```

### 纯几何计算

```ts
import { getBearing, getRotation, checkCoordinate } from "@ym/map-tools";

const bearing = getBearing([116.4, 39.9], [116.46, 39.94]); // 方位角（度）
const rotation = getRotation(bearing); // 补偿 180 后的旋转角

try {
  checkCoordinate([116.4, 39.9]); // 通过
} catch (err) {
  console.error(err.message); // 坐标校验失败（数组长度/数值类型）
}
```

## 注意事项

- `setZoom` 与 `moveMap` 同时使用需将 `setZoom` 延后（`setTimeout`）；同时移动并缩放推荐 `moveAndZoom`（内部走 `easeTo`）。
- 全部函数签名详见 [API 参考](/api/overview)。
