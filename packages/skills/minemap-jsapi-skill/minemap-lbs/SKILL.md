---
name: minemap-lbs
description: MineMap LBS 服务插件 minemap-lbs（minemap-service.js，v2.2.1）开发技能。涵盖 Service 类 22 个静态 Promise 接口（行政区域查询、输入提示、驾车/货车/步行路径规划、地理编码/逆地理编码、POI 关键字/周边/沿线/多边形/ID 搜索、道路搜索、里程桩、轨迹美化/匹配纠偏/重合度/停留点、到达圈）、8 个地图组件（minemap.component.District/PathAnalysis/SearchAround/SearchById/SearchByLine/SearchInBound/SearchKeyword/Suggestion）以及 lbsUtil.districtFormat 行政区划 GeoJSON 转换。Use whenever the user works with minemap-lbs、minemap.service、minemap.component、地理编码、逆地理编码、路径规划、驾车/货车/步行导航、POI 搜索、关键字搜索、周边搜索、沿线搜索、行政区域、行政区划边界、输入提示、里程桩、轨迹纠偏、轨迹美化、到达圈、reacharea——即使没有明确提到 "lbs"。
---

# minemap-lbs（LBS 服务接口与组件封装插件）开发技能

检查 `index.html` 的 `head` 中是否已经添加 `<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/lbs/v1/minemap-service.js"></script>`，没有则添加，以此获得使用 `minemap.component.*`、`minemap.lbsUtil.*` 及 Service 接口封装的能力。

minemap-lbs 是 MineMap 基于 LBS 服务做的接口封装 + 组件封装插件（文档版本 v2.2.1，包含原 lbs v1 接口请求和基于 v1 的部分组件封装），挂载在全局命名空间 `minemap` 下，提供地理编码、路径规划、POI 搜索、行政区划、轨迹处理、到达圈等位置服务能力。

## 调用约定

- **Service 类**：所有方法均为静态方法，签名统一为 `XXX(params) => Promise`，用 `.then()` 或 `await` 取结果。
- **`params.serviceUrl` 必填**：每个 Service 方法的 params 都必须携带 `serviceUrl`（请求服务的 baseUrl）。组件类构造参数中的 `serviceUrl` 可不传，不传时回退使用全局配置 `minemap.serviceUrl`。
- **坐标格式**：统一为 `"经度,纬度"` 字符串，经度在前、纬度在后、逗号分隔；多点用 `;` 分隔，多区域/多点组用 `|` 分隔。
- **命名空间**：组件为 `minemap.component.XXX`，工具为 `minemap.lbsUtil.XXX`，服务地址全局配置为 `minemap.serviceUrl`。官方文档未给出 Service 静态方法的调用示例，按同一命名惯例应为 `minemap.service.XXX(params)`（文档 v2.2.1 未明示，使用前在控制台验证一次）。

```js
// Service 调用模式（Promise 风格）
const res = await minemap.service.drivingData({
  serviceUrl: "https://your-lbs-server",
  origin: "116.397428,39.90923",
  destination: "116.322056,39.894914",
  strategy: 0,
});
```

## Service 接口速查（22 个方法）

写具体调用前，先读 [references/service-api.md](./references/service-api.md) 中对应方法的完整参数表。

| 方法                    | 功能                     | 关键参数与限制                                                                                                                                                |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| adminByPointData        | 行政区域查询             | keywords（行政区名/adcode，默认"中国"）、subdistrict 0-3（仅到区/县级）、extensions                                                                           |
| autocompleteData        | 输入提示（POI 建议列表） | keywords（多词 `\|` 分隔）、location 与 city 二选一（city 不支持区县级）、citylimit                                                                           |
| beautifyTrack           | 轨迹美化                 | cluster_dis 默认 10m、radius 默认 2m、point_list（≥2 且 ≤1000 点、里程 ≤200km，每点必含 lat/lon/tm）                                                          |
| drivingData             | 驾车路径规划             | origin/destination、waypoints ≤50、avoidpolygons ≤32 区（每区 ≤16 顶点）、strategy 0-9、alternatives、cartype、plate_number                                   |
| geocodingData           | 地理编码（地址→坐标）    | address ≤84 字节（支持"路与路交叉口"）、city（过滤用）                                                                                                        |
| kpilesKeywords          | 里程桩关键字/桩号查询    | format_name（如 G15+K140+130，非空时优先）、name、kpile、offset(<1000)、direction(1 上行/2 下行)                                                              |
| kpilesLocation          | 坐标→里程桩              | location（≤10 对坐标，`;` 分隔）、direction                                                                                                                   |
| matchHistoricalTrack    | 历史 GPS 轨迹匹配纠偏    | deviceid、coordtype(02/84)、rectify_option（denoise_grade/yaw_dis/yaw_ang/mode，`\|` 分隔）、fill_mode、point_list                                            |
| matchRealtimeTrack      | 实时 GPS 点匹配          | trackpoint（当前点，必含 lat/lon）、historypoints（≤5 点）、deviceid、coordtype、rectify_option                                                               |
| placeSearchAroundData   | 周边搜索 POI             | keywords、location、radius 0-10000（默认 1000）、type、orderby(weight/hit)、分页                                                                              |
| placeSearchByID         | ID 查要素详情            | id、type（0 点/1 线/2 面，目前仅支持 0）、children、extensions                                                                                                |
| placeSearchByLineData   | 沿线搜索 POI             | keywords、line（`;` 分隔坐标串）、range 0-5000（默认 3000）、分页                                                                                             |
| placeSearchInBoundsData | 多边形区域内搜索 POI     | keywords、polygon（≥2 点，2 点即矩形左下/右上，多边形首尾坐标必须相同）、分页                                                                                 |
| placeSearchKeywordData  | 关键字搜索 POI           | keywords、location 与 city 二选一、type、citylimit、orderby、分页                                                                                             |
| placeSearchRoadData     | 道路搜索                 | keywords、location 与 city 二选一、citylimit、分页                                                                                                            |
| reacharea               | 到达圈                   | origin（小数 ≤6 位）、time（分钟）与 distance（米）至少一个（同时存在以 time 为主）、type(0 驾车/1 步行)、smooth                                              |
| reverseDistrict         | 坐标→所在行政区          | location、coordtype(02/GPS)、level(province/city/district/town/village)、extensions=all 返回边界点                                                            |
| reverseGeocodingData    | 逆地理编码               | location（≤10 对，`;` 分隔）、type/typelimint（POI 类型限定）、radius 0-3000（默认 500）、extensions、orderby                                                 |
| similarityTrack         | 轨迹重合度               | basepath（基准路径 lat/lon/tm/sp/dir）、point_list、yaw_dis [20,400]、yaw_ang [20,300]                                                                        |
| staypointTrack          | 停留点分析               | stay_time 默认 600s、stay_radius [1,500] 默认 20m、point_list                                                                                                 |
| truckDrivingData        | 货车路径规划             | drivingData 全部参数 + 货车专属：height/width/weight/length/axle_count/axle_weight/passport/emisson_limit(1-6 国一至国六)/load/is_trailer/size(1 微型~4 重型) |
| walkingData             | 步行路径规划             | origin、destination、alternatives、lang                                                                                                                       |

## Component 组件（8 个）

组件基于 Service 接口做 UI 层封装，通过 `minemap.component.XXX` 构造。除 PathAnalysis 外均遵循统一模式：

```ts
new minemap.component.XXX(options: { serviceUrl?, map: Map, resID: string })
```

| options 参数 | 类型   | 说明                                            |
| ------------ | ------ | ----------------------------------------------- |
| serviceUrl   | string | 接口地址，不传则使用全局 `minemap.serviceUrl`   |
| map          | Map    | 地图实例                                        |
| resID        | string | 结果列表的 DOM ID（组件把搜索结果渲染到该容器） |

生命周期：`create(data, callback)` 创建查询并渲染结果，`destroy(callback)` 销毁。`data` 即对应 Service 方法的 params（去掉 serviceUrl），回调收到查询结果。

### District — 行政区查询（底层 adminByPointData）

```js
const districts = new minemap.component.District({ map: map, resID: "result-panel" });
districts.create({ keyword: "北京" }, (e) => {
  /* do something */
});
districts.destroy();
```

### PathAnalysis — 路线规划 UI（底层 driving/truck/walking）

例外：无 create/destroy，只有 `on()`（map 加载完后调用，用于加载 DOM 和绑定事件）。构造参数也不同：

```js
const pathAnalysis = new minemap.component.PathAnalysis({
  map: map,
  isFitBounds: true, // 是否缩放平移到结果边界框，默认 true
  fitBoundsPadding: [60, 60, 60, 60], // 边界框距容器边缘 [top, bottom, left, right]
  buffer: 100, // 鼠标距线图层可拖拽途经点的最大触发距离
  initType: 1, // 默认交通方式：驾车 1 / 卡车 2 / 步行 3
});
pathAnalysis.on(); // 必须在 map load 之后调用
```

### SearchAround — 周边搜索（底层 placeSearchAroundData）

```js
const searchAround = new minemap.component.SearchAround({ map: map, resID: "result-panel" });
searchAround.create(
  { keywords: "肯德基", location: "116.245352,40.072921", radius: 3000 },
  (e) => {},
);
```

### SearchById — ID 详情（底层 placeSearchByID）

create 第一个参数直接传 **id 字符串**，不是对象：

```js
const searchById = new minemap.component.SearchById({ map: map, resID: "result-panel" });
searchById.create("110000", (e) => {});
```

### SearchByLine — 沿线搜索（底层 placeSearchByLineData）

```js
const searchByLine = new minemap.component.SearchByLine({ map: map, resID: "result-panel" });
searchByLine.create(
  {
    keywords: "肯德基",
    line: "116.31314,39.85912;116.32330,39.85927;116.32121,39.86158",
    range: 1000,
  },
  (e) => {},
);
```

### SearchInBound — 多边形范围搜索（底层 placeSearchInBoundsData）

```js
const searchInBound = new minemap.component.SearchInBound({ map: map, resID: "result-panel" });
searchInBound.create(
  {
    keywords: "肯德基",
    polygon:
      "116.435562,39.984934;116.437568,39.983356;116.43348,39.983947;116.43362,39.985107;116.435562,39.984934",
  },
  (e) => {},
);
```

polygon 为首尾闭合的坐标串（非自相交多边形）。

### SearchKeyword — 关键字搜索列表 + marker（底层 placeSearchKeywordData）

```js
const searchKeyword = new minemap.component.SearchKeyword({ map: map, resID: "result-panel" });
searchKeyword.create({ keyword: "肯德基", city: "北京" }, (e) => {});
```

官方参考示例：https://www.minedata.cn/support/api/demo/js-cmpt/zh/lbs/search/search-keyword

### Suggestion — 输入提示（底层 autocompleteData）

```js
const suggestion = new minemap.component.Suggestion({ map: map, resID: "result-panel" });
suggestion.create({ keyword: "肯德基", city: "北京" }, (e) => {});
```

## lbsUtil — 工具类

### districtFormat(polygon) → MultiPolygon

把行政区划边界字符串转成 GeoJSON MultiPolygon，配合图层渲染行政区边界（如 District/reverseDistrict extensions=all 返回的边界点）：

```js
const geojson = minemap.lbsUtil.districtFormat(polygon);
// polygon 格式："116.404,39.915;116.404,39.915|116.404,39.915;116.404,39.915"
// 分号分隔环内坐标点，竖线分隔不同环
```

## 注意事项与已知文档问题

- **serviceUrl 是服务地址入口**：本插件只封装请求，不含服务；所有请求指向 `params.serviceUrl` / `minemap.serviceUrl` 配置的 LBS 服务端，需确保服务已部署且可访问。
- **文档笔误（提炼自 v2.2.1 JSDoc）**：
  - Service 文档中 `drivingData` 重复出现两次，实为同一方法。
  - `avoidpoints'`（driving/truck 表内键名带尾单引号）应为 `avoidpoints`；truck 表中 `alternatives0` 应为 `alternatives`。
  - 轨迹类方法（beautifyTrack/similarityTrack/staypointTrack）point 字段描述把 lon 写成"纬度"、lat 写成"经度"，方向标反——以字段本义为准：`lat` 纬度、`lon` 经度。
  - `kpilesLocation` 的功能描述复制了 `kpilesKeywords` 的文字，实际功能是坐标反查里程桩；`reacharea` 的描述同样误复制了道路搜索的文字。
  - `reverseGeocodingData` 的参数键名 `typelimint` 疑为 `typelimit` 笔误，文档即如此，调用时按文档键名并以服务端实际接受为准。
  - 组件文档中 Suggestion/SearchKeyword 签名写 `create(keyword: String)`，示例却传对象 `{keyword, city}`——组件需要 city 过滤，按示例传对象更合理；两者以实际运行验证为准。
  - 组件构造参数表混写 `params.serviceUrl` 与 `options.map`，实为同一 options 对象。
- **坐标串分隔符**：点内 `,`、点间 `;`、区域间 `|`，三个层级不要混用；多边形 polygon 首尾坐标必须相同（2 点矩形除外）。
- **分页上限**：POI 搜索类接口 page_size 最大 20、page_idx 最大 20 页。
- **轨迹点数量/里程上限**：point_list ≤1000 点且里程 ≤200km，超了会响应缓慢或超时；matchRealtimeTrack 的 historypoints ≤5。
- **文档与脚本版本**：文档为 v2.2.1，脚本按仓库约定从 `.../minemap-plugins/lbs/v1/minemap-service.js` 加载；如遇 v2 路径可探测 `.../lbs/v2/` 并相应更新 head 中的 script。
- **map load 时机**：PathAnalysis 的 `on()` 必须在 map `load` 事件回调中调用；组件均需要已初始化的地图实例。
