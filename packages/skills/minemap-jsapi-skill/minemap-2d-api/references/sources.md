# Source — 数据源

数据源通过 `map.addSource(id, source)` 添加，`map.getSource(id)` 获取实例，`map.removeSource(id)` 删除。

文档覆盖四种 Source 类：**GeoJSON / Video / Image / Canvas**。矢量/栅格数据源没有独立类文档，通过 `addSource({type: 'vector'|'raster', ...})` 的 style 对象形式使用。

## GeoJSONSource

```ts
new GeoJSONSource(id: string, options: any, dispatcher, eventedParent, isLatLon)
```

通过 `addSource` 添加时自动创建，无需手动 `new`：

```js
map.addSource("points", {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] },
});
var source = map.getSource("points");
source.setData(newGeoJSON); // 更新数据
```

成员：

| 成员                                                   | 作用                            |
| ------------------------------------------------------ | ------------------------------- |
| `setData(data)`                                        | 更新 GeoJSON 数据（对象或 URL） |
| `getClusterExpansionZoom(clusterId, callback)`         | 点聚合展开缩放级别              |
| `getClusterChildren(clusterId, callback)`              | 获得聚类的子要素                |
| `getClusterLeaves(clusterId, limit, offset, callback)` | 获得聚类内要素                  |

点聚合需在 addSource 时配置 `cluster: true` 等聚合参数：

```js
map.addSource("points", {
  type: "geojson",
  data: url,
  cluster: true,
  clusterMaxZoom: 14,
});
```

## VideoSource

```ts
new VideoSource(id, options: VideoSourceSpecification, ...)
```

通过 `addSource` 添加：

```js
map.addSource("video", {
  type: "video",
  urls: ["a.mp4", "b.mp4"],
  coordinates: [
    [-100, 0],
    [-90, 0],
    [-90, 9],
    [-100, 9],
  ], // 四角，[经度, 纬度]
});
```

成员：

| 成员               | 作用                        |
| ------------------ | --------------------------- |
| `play()`           | 播放视频                    |
| `pause()`          | 暂停                        |
| `getVideo()`       | 返回底层 `HTMLVideoElement` |
| `setCoordinates()` | 更新四角坐标                |

## ImageSource

```ts
new ImageSource(id, options: ImageSourceSpecification, ...)
```

```js
map.addSource("image", {
  type: "image",
  url: "//minedata.cn/minemapapi/demo/images/park.png",
  coordinates: [
    [-80, 30],
    [-70, 30],
    [-70, 40],
    [-80, 40],
  ],
});
```

成员：

| 成员                                                 | 作用                                    |
| ---------------------------------------------------- | --------------------------------------- |
| `updateImage(options)`                               | 更新图像                                |
| `setCoordinates(coordinates)`                        | 更新四角坐标（`[[lng,lat],...]` 四角）  |
| `getBoundCoordinate(minLng, minLat, maxLng, maxLat)` | 取边界坐标（返回 string），MineMap 扩展 |
| `latLng2WebMercator(lng, lat)`                       | 经纬度转 Web Mercator（返回 `[x, y]`）  |

## CanvasSource

```ts
new CanvasSource(id, options: CanvasSourceSpecification, ...)
```

`CanvasSourceOptions`：

| 属性          | 说明                                           |
| ------------- | ---------------------------------------------- |
| `type`        | 必须是 `'canvas'`                              |
| `canvas`      | canvas 元素或元素 ID                           |
| `coordinates` | 四角边界框 `[[lng,lat],...]`                   |
| `animate`     | 是否动画（false 时每帧不必重读像素，提升性能） |

```js
map.addSource("canvas-source", {
  type: "canvas",
  canvas: myCanvasEl,
  coordinates: [
    [-90, 0],
    [-80, 0],
    [-80, 10],
    [-90, 10],
  ],
  animate: true,
});
```

成员：

| 成员                          | 作用                        |
| ----------------------------- | --------------------------- |
| `play()`                      | 播放动画（需 animate=true） |
| `pause()`                     | 暂停                        |
| `getCanvas()`                 | 返回 canvas 元素            |
| `setCoordinates(coordinates)` | 更新四角坐标                |

## 注意事项

- 所有 `coordinates` 均为 `[[经度, 纬度], ...]` 四角，顺序：左上、右上、右下、左下。
- source 必须以图层引用：添加 source 后需 `map.addLayer({id: ..., source: sourceId, type: ...})` 才会渲染。
- 文档示例中的 `minemap://myusername.tilesetid` 为占位 URL，实际传真实数据地址。
