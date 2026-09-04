# 几何类型 — LngLat / LngLatBounds / Point

地图坐标体系说明：**所有经纬度均为 `[经度, 纬度]`（`lng, lat`）**，与 GeoJSON 一致。

## LngLat

```ts
new LngLat(lng: number, lat: number)
```

表示一个经纬度坐标对象。

```js
new minemap.LngLat(116.46, 39.92);
new minemap.LngLat({ lng: 116.46, lat: 39.92 });
```

成员：

| 成员                 | 作用                                     |
| -------------------- | ---------------------------------------- |
| `lng`                | 经度                                     |
| `lat`                | 纬度                                     |
| `convert(input)`     | 将 LngLatLike 转换为 LngLat 实例（静态） |
| `wrap()`             | 将经度规范化到 [-180, 180]               |
| `toArray()`          | 返回 `[lng, lat]`                        |
| `toString()`         | 字符串形式                               |
| `distanceTo(lngLat)` | 到另一坐标的距离（米）                   |
| `toBounds(radius)`   | 以该点为中心、给定半径生成 LngLatBounds  |

## LngLatLike

`LngLatLike` 是经纬度的多种表达方式：

```js
[minemap.LngLatLike =]
  new minemap.LngLat(lng, lat)
  [lng, lat]                       // 数组
  {lng, lat} 或 {lon, lat}          // 对象
```

```js
map.setCenter([116.46, 39.92]);
map.setCenter({ lng: 116.46, lat: 39.92 });
map.setCenter(new minemap.LngLat(116.46, 39.92));
```

## LngLatBounds

```ts
new LngLatBounds(sw: LngLatLike?, ne: LngLatLike?)
```

表示地理边界框，由西南角（`sw`）和东北角（`ne`）定义。

```js
var bounds = new minemap.LngLatBounds([116.0, 39.0], [117.0, 40.0]);
```

成员：

| 成员                                                                      | 作用                                 |
| ------------------------------------------------------------------------- | ------------------------------------ |
| `convert(input)`                                                          | 将 LngLatBoundsLike 转成实例（静态） |
| `setNorthEast(ne)` / `setSouthWest(sw)`                                   | 设置角点                             |
| `extend(obj)`                                                             | 扩展到包含另一点或边界               |
| `getCenter()`                                                             | 中心点                               |
| `getSouthWest()` / `getNorthEast()` / `getNorthWest()` / `getSouthEast()` | 四角                                 |
| `getWest()` / `getSouth()` / `getEast()` / `getNorth()`                   | 四边值                               |
| `toArray()`                                                               | `[[sw], [ne]]`                       |
| `toString()`                                                              | 字符串                               |
| `isEmpty()`                                                               | 是否为空                             |
| `contains(lnglat)`                                                        | 是否包含某点                         |

## LngLatBoundsLike

边界框的多种表达：

```js
new minemap.LngLatBounds([sw, ne]); // [sw, ne]，各为 LngLatLike
new minemap.LngLatBounds([w, s, e, n]); // [west, south, east, north]
```

## Point / PointLike

- `Point`：屏幕像素坐标对象 `{x, y}`。
- `PointLike`：`Point` 或 `[x, y]` 数组。

常用于 `map.project(lnglat)`（经纬度→像素）与 `map.unproject(point)`（像素→经纬度）：

```js
var px = map.project([116.46, 39.92]); // Point {x, y}
var lnglat = map.unproject([100, 200]); // LngLat
```

## 注意事项

- `LngLat`/`LngLatBounds` 多用 `LngLatLike`/`LngLatBoundsLike` 作为参数以简化调用，传数组常比 `new` 更简洁。
- `map.project`/`unproject` 用于在屏幕像素与经纬度之间换算，是做交互（如 tooltip 定位）的常用手段。
