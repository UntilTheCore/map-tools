# mapTool（地图操作）

来源：`packages/map-tools/src/core/mapTool.ts`

## destroyMap

销毁地图实例。

```ts
function destroyMap(map: minemap.Map): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |

- **返回值**：无
- **说明**：内部等价 `map.remove()`；`map` 为空时不执行任何操作。

## clearAllSourceAndLayer

按 id 常量对象批量清理数据源与图层。

```ts
function clearAllSourceAndLayer(map: minemap.Map, constant: any): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |
| constant | `Record<string, string>` | id 常量对象 |

- **返回值**：无
- **说明**：遍历 `constant`，key 含 `layer` 的按 `removeLayer` 移除，key 含 `source` 的按 `removeSource` 移除（存在时才移除）。

## setSourceData

设置图层和数据源（GeoJSON）。

```ts
function setSourceData(
  map: minemap.Map,
  sourceId: string,
  layer: MapLayer,
  featureCollection: FeatureCollection,
  option?: {
    afterSetData?: (map: minemap.Map, layerId: string) => void;
    afterSetLayer?: (map: minemap.Map, layerId: string) => void;
    sourceOption?: Omit<MapSource, "type" | "data">;
  }
): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |
| sourceId | `string` | 数据源 id |
| layer | `MapLayer` | 图层对象（含 `id` / `type` / `source` / `paint` 等） |
| featureCollection | `GeoJSON.FeatureCollection` | 数据集合 |
| option.afterSetData | `(map, layerId) => void` | 数据设置完成后回调 |
| option.afterSetLayer | `(map, layerId) => void` | 图层设置完成后回调 |
| option.sourceOption | `object` | 数据源额外配置 |

- **返回值**：无
- **说明**：数据源已存在则仅 `setData` 更新数据；不存在则 `addSource` + `addLayer`（图层 id 已存在时不会重复添加）。

## setMultipleLayerSourceData

给多个图层设置同一个数据源。

```ts
function setMultipleLayerSourceData(
  map: minemap.Map,
  sourceId: string,
  layers: MapLayer[],
  featureCollection: FeatureCollection,
  option?: {
    afterSetData?: (map: minemap.Map, layerId: string) => void;
    afterSetLayer?: (map: minemap.Map, layerId: string) => void;
    sourceOption?: Omit<MapSource, "type" | "data">;
  }
): void
```

- **说明**：与 `setSourceData` 一致，区别是 `layers` 为数组；数据已存在时对每个 layer 调用一次 `afterSetData`，首次添加时对每个 layer 调用一次 `afterSetLayer`。

## setPbfSourceData

设置 PBF（矢量瓦片）数据源与图层。

```ts
function setPbfSourceData(
  map: minemap.Map,
  sourceId: string,
  layer: MapLayer,
  tiles: string[]
): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |
| sourceId | `string` | 数据源 id |
| layer | `MapLayer` | 图层对象（如 `{ id, type: "fill", source, "source-layer": "Landuse", paint }`） |
| tiles | `string[]` | 瓦片地址模板（如 `https://.../Landuse/{z}/{x}/{y}?token=xxx`） |

- **返回值**：无
- **说明**：重复设置同一 `sourceId` 时会先移除旧数据源再重建。

## moveAndZoom

移动并缩放（easeTo）。

```ts
function moveAndZoom(map: minemap.Map, coordinate: number[], zoom?: number): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| map | `minemap.Map` | - | 地图实例 |
| coordinate | `number[]` | - | 目标中心点 `[lng, lat]` |
| zoom | `number` | `12` | 目标缩放级别 |

## moveMap

平移地图（panTo）。

```ts
function moveMap(map: minemap.Map, coordinate: number[]): void
```

## setZoom

设置缩放级别。

```ts
function setZoom(map: minemap.Map, zoom: number): void
```

- **说明**：`zoom > 10` 才生效。与 `moveMap` 同时使用时需将 `setZoom` 延后（`setTimeout`）；同时移动并缩放推荐 `moveAndZoom`。

## removeMarkers

移除 Marker，支持单个 Marker 或 Marker 数组（批量）。

```ts
function removeMarkers(markers: minemap.Marker | minemap.Marker[]): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| markers | `minemap.Marker \| minemap.Marker[]` | 单个 Marker 或 Marker 数组，逐一执行 `remove()` |

## removeMarkersOrPopups

批量移除 Marker 或 Popup 列表。

```ts
function removeMarkersOrPopups(list: (minemap.Popup | minemap.Marker)[]): void
```

## getBearing

计算两点方位角（基于 turf `bearing`）。

```ts
function getBearing(currentPoint: number[], nextPoint: number[]): number
```

- **返回值**：方位角（度，-180 ~ 180）。

## getRotation

由方位角计算旋转角。

```ts
function getRotation(bearing: number, compensation?: number): number
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| bearing | `number` | - | 方位角 |
| compensation | `number` | `180` | 补偿值 |

- **返回值**：`bearing - compensation`。

## getRotationByCoordinate

由两坐标直接计算旋转角。

```ts
function getRotationByCoordinate(
  currentPoint: number[],
  nextPoint: number[],
  compensation?: number
): number
```

## getCenterBetweenRightPointIntersection

获取多边形质心与靠右侧经度最大点之间线的交叉点。

```ts
function getCenterBetweenRightPointIntersection(
  coordinates: number[][]
): number[] | undefined
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| coordinates | `number[][]` | 多边形坐标数组 |

- **返回值**：交点坐标 `[lng, lat]`；无最东点时返回 `undefined`。

## checkCoordinate

校验坐标是否符合 `[number, number]` 格式。

```ts
function checkCoordinate(coordinate: any): void
```

- **返回值**：无；校验失败抛出 `Error`：
  - 非数组 → `坐标应该为一个只有两个元素的数组`
  - 长度大于 2 → 同上
  - 元素非 number → `坐标值应是 number`

## setViewPortByPolygon

按多边形包围盒适配视野。

```ts
function setViewPortByPolygon(
  map: minemap.Map,
  polygon: Feature<MultiPolygon | Polygon, Properties>,
  boundary: number[]
): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |
| polygon | `Feature<Polygon \| MultiPolygon>` | 多边形要素 |
| boundary | `number[]` | `[上, 下, 左, 右]` 边距 |

## setViewPort

根据覆盖物（点/线/多边形混合）自适应视野。

```ts
function setViewPort(
  map: minemap.Map,
  overlays?: Feature<Point | LineString | MultiLineString | Polygon | MultiPolygon>[],
  option?: ViewPortOption
): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| map | `minemap.Map` | - | 地图实例 |
| overlays | `Feature[]` | `[]` | 覆盖物列表（仅支持点/线/多边形） |
| option.boundary | `number[]` | `[150, 250, 150, 250]` | 边距，逻辑为 `[上, 右, 下, 左]` |

- **说明**：内部提取各类覆盖物顶点后计算包络并 `fitBounds`。

## setPbfLayerViewport

设置 PBF 图层视口：先自动缩放以抓取 PBF 数据，源加载完成后按要素自适应视野。

```ts
function setPbfLayerViewport(data: {
  map: minemap.Map;
  layerId: string;
  sourceId: string;
  limit?: number;    // 默认 30，轮询上限（秒）
  autoZoom?: boolean; // 默认 true
  zoom?: number;      // 默认 10
  zoomFn?: () => void; // 自定义缩放函数，优先级高于 zoom
}): void
```

- **说明**：PBF 数据按视口返回，缩放是为了抓取更多瓦片数据；`map`/`sourceId`/`layerId` 缺失时打印警告并返回。

## getFeatureTypeList

按几何类型过滤要素列表。

```ts
function getFeatureTypeList<T>(
  featureList: Feature<Point | LineString | MultiLineString | Polygon | MultiPolygon>[],
  featureType: FeatureTypeEnum
): Feature<T>[]
```

## FeatureTypeEnum

```ts
enum FeatureTypeEnum {
  Point = "Point",
  LineString = "LineString",
  MultiLineString = "MultiLineString",
  Polygon = "Polygon",
  MultiPolygon = "MultiPolygon",
}
```

## ViewPortOption

```ts
type ViewPortOption = {
  boundary?: number[]; // [上, 右, 下, 左]
};
```
