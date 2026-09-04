---
name: minemap-2d-util
description: MineMap JS API 2D 工具库 minemap-util.js（minemaputil）开发技能。涵盖 RangingTool 测距测面积工具、fitBounds GeoJSON 视口适配、SpaceUtil 空间计算（两点距离、点到线距离、最近点、点在面内、中点、中心点、形心）。Use whenever the user works with minemaputil、minemap 2D 测量工具、空间/几何计算、测距、测面积、fitBounds、点线面距离或包含关系判断——即使没有明确提到 "util" 或 "minemaputil"。
---

# minemap-util.js（2D 工具库）开发技能

检查 `index.html` 的 `head` 中是否已经添加 `<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/2d-util/minemap-util.js"></script>` ,没有则添加，以此获得使用 `minemap-util.js` 的能力。

minemap-util.js 是 MineMap for 2D（minemap-for-2d v2.1.x）配套的 2D 工具库，暴露全局命名空间 `minemaputil`，提供三类能力：

1. **RangingTool** — 交互式测距 / 测面积工具
2. **fitBounds** — 输入 GeoJSON，让当前视口框住全部数据
3. **SpaceUtil** — 纯空间计算（距离、包含关系、中点、中心、形心）

## RangingTool — 测距 / 测面积工具

构造签名：

```ts
new RangingTool(map: Map, opts?: Object);
```

| 参数                | 说明           | 类型   | 可选值               | 默认值  |
| ------------------- | -------------- | ------ | -------------------- | ------- |
| opts.type           | 测量种类       | Number | 0 为测距，1 为测面积 | 0       |
| opts.color          | 线条颜色       | String | --                   | #ff0000 |
| opts.startLabelText | 起始点 label   | String | --                   | '起点'  |
| opts.unit           | 单位           | String | 'km'、'm'            | 'km'    |
| opts.decimals       | 保留小数       | Number | --                   | 2       |
| opts.clearText      | 清除的显示文本 | String | --                   | '清除'  |

实例成员：

- `turnOn()` — 开启测距（开始交互测量）
- `turnOff()` — 结束测距（结束并停止交互）

示例：

```js
new minemaputil.RangingTool(map); // 默认配置

new minemaputil.RangingTool(map, {
  type: 0,
  unit: "km",
  decimals: 2,
  color: "yellow",
  startLabelText: "起始点",
}); // 自定义配置
```

典型用法：创建实例后调用 `turnOn()` 启动测量，用户在地图上点击采点，完成后调用 `turnOff()` 结束。测面积时传 `type: 1`。

## fitBounds — GeoJSON 视口适配

输入一个 GeoJSON 数据，用当前窗口框住所有的数据位置。

```ts
fitBounds(map: Map, geojson: object, options?: object);
```

| 参数            | 说明       | 类型   | 可选值 | 默认值 |
| --------------- | ---------- | ------ | ------ | ------ |
| options.padding | 内边距距离 | number | --     | 0      |
| opts.offset     | 偏移量     | array  | --     | [0, 0] |

示例：

```js
minemaputil.fitBounds(
  map,
  (GeoJSON = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "CHN",
        properties: { name: "China" },
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [
                [116.45979152369046, 39.921928634782546],
                [116.45919896920537, 39.917928934361015],
              ],
            ],
          ],
        },
      },
    ],
  }),
  { padding: 100, offset: [100, 110] },
);
```

## SpaceUtil — 空间查询测量

静态工具类，方法通过 `minemaputil.SpaceUtil.xxx(...)` 直接调用（无需 `new`）。

方法速查：

| 方法                                      | 作用                   | 返回               |
| ----------------------------------------- | ---------------------- | ------------------ |
| `distance(fromPoints, toPoints, units?)`  | 两个经纬度点的实际距离 | number（默认公里） |
| `distanceToLine(point, line, units?)`     | 点到线的最小距离       | number（默认公里） |
| `nearestPointOnLine(line, point, units?)` | 线上离当前点最近的点   | NearestPointOnLine |
| `pointWithinPolygon(point, polygon)`      | 判断点是否在面内       | Boolean            |
| `calMidpoint(first, second)`              | 两点中点坐标           | `Feature<Point>`   |
| `calCenter(features)`                     | 经纬度集合的中心点     | `Feature<Point>`   |
| `calCentroid(features)`                   | 面的形心               | `Feature<Point>`   |

`units` 可选值统一为：`degrees`、`radians`、`miles`、`kilometers`，默认 `kilometers`。

坐标均为 `[lng, lat]` 经纬度数组；`calMidpoint` / `calCenter` / `calCentroid` 的返回值是 GeoJSON `Feature<Point>`，取坐标用 `返回值.geometry.coordinates`。

### distance(fromPoints, toPoints, units)

计算两个经纬度点之间的实际距离。

```ts
distance(fromPoints: Array, toPoints: Array, units?: String): number
```

| 参数       | 说明   | 类型   | 可选值                                 | 默认值     |
| ---------- | ------ | ------ | -------------------------------------- | ---------- |
| fromPoints | 起始点 | array  | --                                     | --         |
| toPoints   | 终止点 | array  | --                                     | --         |
| units      | 单位   | String | degrees, radians, miles, or kilometers | kilometers |

```js
var distance = minemaputil.SpaceUtil.distance([-75.343, 39.984], [-75.534, 39.123]);
console.log("两点距离:" + distance + "公里");
```

### distanceToLine(point, line, units)

点到线的最小距离。

```ts
distanceToLine(point: Array, line: Array, units?: String): number
```

| 参数  | 说明                       | 类型   | 默认值     |
| ----- | -------------------------- | ------ | ---------- |
| point | 点，如 `[0, 0]`            | array  | --         |
| line  | 线，如 `[[1, 1], [-1, 1]]` | array  | --         |
| units | 单位                       | String | kilometers |

```js
var pointToLineDistance = minemaputil.SpaceUtil.distanceToLine(
  [0, 0],
  [
    [1, 1],
    [-1, 1],
  ],
);
console.log("返回点到线的最小距离:" + pointToLineDistance);
```

### nearestPointOnLine(line, point, units)

线上离当前点最近的点。

```ts
nearestPointOnLine(line: Array, point: Array, units?: String): NearestPointOnLine
```

| 参数  | 说明     | 类型   | 默认值     |
| ----- | -------- | ------ | ---------- |
| line  | 线的坐标 | array  | --         |
| point | 点的坐标 | array  | --         |
| units | 单位     | String | kilometers |

注意：参数顺序是 **line 在前、point 在后**，与 `distanceToLine`（point 在前）相反。

```js
var nearpoint = minemaputil.SpaceUtil.nearestPointOnLine(
  lineData,
  [116.46444210317901, 39.92590037867916],
);
```

### pointWithinPolygon(point, polygon)

判断点是否在面内。

```ts
pointWithinPolygon(point: Array, polygon: Array): Boolean
```

| 参数    | 说明                     | 类型  |
| ------- | ------------------------ | ----- |
| point   | 点的坐标                 | array |
| polygon | 面的坐标（多环嵌套数组） | array |

```js
var result = minemaputil.SpaceUtil.pointWithinPolygon(
  [-46.6318, -23.5523],
  [
    [
      [-46.653, -23.543],
      [-46.634, -23.5346],
      [-46.613, -23.543],
      [-46.614, -23.559],
      [-46.631, -23.567],
      [-46.653, -23.56],
      [-46.653, -23.543],
    ],
  ],
);
console.log("该点是否在环内:" + result);
```

### calMidpoint(first, second)

计算两点中点坐标。

```ts
calMidpoint(first: LngLatLike, second: LngLatLike): Feature<Point>
```

| 参数   | 说明         | 类型       |
| ------ | ------------ | ---------- |
| first  | 第一个点坐标 | LngLatLike |
| second | 第二个点坐标 | LngLatLike |

```js
var midpoint = minemaputil.SpaceUtil.calMidpoint([116.48, 39.94], [116.464, 39.925]);
```

### calCenter(features)

计算经纬度集合的中心点。

```ts
calCenter(features: Array): Feature<Point>
```

| 参数     | 说明       | 类型  |
| -------- | ---------- | ----- |
| features | 经纬度集合 | Array |

### calCentroid(features)

计算面的形心。

```ts
calCentroid(features: Array): Feature<Point>
```

| 参数     | 说明       | 类型  |
| -------- | ---------- | ----- |
| features | 经纬度集合 | Array |

## 注意事项与已知文档问题

- **坐标顺序**：所有输入均为 `[经度, 纬度]`（lng, lat）。
- **units 默认公里**：所有涉及单位的距离方法默认 `kilometers`，可选 degrees / radians / miles / kilometers。
- **返回类型差异**：`calMidpoint` / `calCenter` / `calCentroid` 返回 GeoJSON `Feature<Point>` 对象而非裸数组；`distance` / `distanceToLine` 返回 number；`pointWithinPolygon` 返回 Boolean。
- **文档别名不一致**：官方文档正文示例出现过 `minemap.SpaceUtil.isPointInRing(...)`（对应 `pointWithinPolygon`）与 `minemaputil.SpaceUtil.calculateMidpoint(...)`（对应 `calMidpoint`）的写法，疑为文档笔误/旧版别名。以参数表列出的方法名（`pointWithinPolygon`、`calMidpoint`）为准；若运行时报方法不存在，再检查实际库文件暴露的方法名。
