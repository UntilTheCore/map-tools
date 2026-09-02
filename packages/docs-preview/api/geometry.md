# Geometry

基础坐标类型为：

```ts
type Coordinate = readonly [longitude: number, latitude: number];
type BBox = readonly [west: number, south: number, east: number, north: number];
type Padding = { top: number; right: number; bottom: number; left: number };
```

## 坐标与方位

```ts
assertCoordinate([116.4, 39.9]);
const valid = isCoordinate(value);
const bearing = getBearing(from, to);
const rotation = getRotation(bearing);
const directRotation = getRotationByCoordinate(from, to);
```

`assertCoordinate` 要求数组长度严格为 2，且两个元素均为有限数字。

## Feature 工具

- `getCoordinatesFromPoints(features)`
- `getLineEndpoints(featureCollection)`
- `getPolygonVertices(featureCollection)`
- `filterFeaturesByGeometryType(features, type)`

`getPolygonRightIntersection` 是业务化几何能力，仅从 `@ym/map-tools/geometry` 子路径导出，不作为根地图操作 API。
