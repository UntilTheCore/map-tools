# 道路搜索

按道路名称检索重庆市的道路要素，取回道路的类型、所属行政区与**线几何**（WKT `LINESTRING`），可直接交给地图渲染。

接口由天镜平台的位置服务（`lbs-api`）提供，走 HTTP GET/POST，返回 JSON，调用前需要 `key`。本文以私有部署地址 `https://gmap.cqphx.cn:4443` 为实际调用地址，并把查询范围限定在 `region=重庆市`。

> 该接口（`integrated/v2/keywords`）是**综合查询**接口，官方文档称其为「地名综合查询」，可同时检索 POI、AOI 与道路。本文聚焦「按路名查道路」这一用法，因此统一带上 `region=重庆市` 限定范围，并筛选 `feature_type` 为道路的条目。

## 1. 接口说明

| 项       | 值                                                                          |
| -------- | --------------------------------------------------------------------------- |
| 接口地址 | `https://gmap.cqphx.cn:4443/tianjing-server/lbs-api/integrated/v2/keywords` |
| 请求方式 | GET、POST                                                                   |
| 服务描述 | 通过关键字和类型等条件搜索满足条件的要素（POI / AOI / 道路）                |

参数：

| 参数        | 类型    | 必填 | 说明                                                           |
| ----------- | ------- | ---- | -------------------------------------------------------------- |
| keywords    | string  | 是\* | 查询关键字，如完整路名 `中山三路`、`长江一路`                  |
| types       | string  | 否   | 分类名称或分类代码，多个用 `\|` 或空格分隔；**建议传分类代码** |
| location    | string  | 否   | 参考位置，`"经度,纬度"`，用于影响排序                          |
| region      | string  | 否   | **限定返回该行政区名称内的结果**；本文固定传 `重庆市`          |
| limitRegion | boolean | 否   | 是否开启行政区划过滤，默认 `false`（文档误拼为 `falase`）      |
| pageSize    | int     | 否   | 分页大小，默认 20                                              |
| pageNum     | int     | 否   | 页码，默认 0                                                   |
| key         | string  | 是   | 开发者应用密钥                                                 |

\* `keywords` 与 `types` 至少填一项。

返回字段（成功时业务数据在顶层 `features`）：

| 字段                                           | 说明                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `code` / `msg`                                 | 状态码与状态消息，`0` 为成功                                        |
| `hits`                                         | **匹配总数**（不受 `pageSize` 限制），用于判断是否需要翻页          |
| `features[]`                                   | 结果数组，**关键数据在这里**                                        |
| `features[].feature_type`                      | 要素类型：`road` / `road-new`（道路）、`poi` / `poi-new`、`aoi-new` |
| `features[].name`                              | 道路名称                                                            |
| `features[].type`                              | 道路等级，如 `城市二级道路`、`省道`                                 |
| `features[].level`                             | 层级描述，道路为 `道路`                                             |
| `features[].uuid`                              | 要素唯一编码                                                        |
| `features[].province` / `.city` / `.adminname` | 省 / 市 / 区县                                                      |
| `features[].admincode`                         | 区县行政区划编码                                                    |
| `features[].similarity`                        | 与关键字的相似度，0–1                                               |
| `features[].weight`                            | 权重                                                                |
| `features[].location`                          | 点位坐标 `{ lng, lat }`                                             |
| `features[].geometry`                          | **几何数据**：道路为 WKT `LINESTRING`，POI 为 `POINT`               |

## 2. 使用 skill 辅助开发

本仓库的技能包已把该接口整理成 **`minemap-service`** 技能：

```
packages/skills/minemap-jsapi-skill/minemap-service/
├── SKILL.md                          # 调用约定 + 任务路由表
└── references/
    ├── keywords.md                   # 地名综合查询（本页对应接口）
    ├── suggestion.md                 # 地点输入提示（联想补全）
    ├── around.md                     # 周边综合搜索
    └── polygon-search.md / line-search.md
```

在支持 skill 的 AI 编程助手中，直接描述任务即可命中该技能。下面是可照抄的提示词范例。

**范例一 · 从零写调用并渲染**

```text
用 minemap-service 技能的地名综合查询接口（lbs-api/integrated/v2/keywords），
帮我写一个函数：输入道路名称，限定 region=重庆市，取回所有道路类型的要素
（feature_type 以 road 开头），用 @turf/turf 的 lineString 和 featureCollection
把它们的 geometry（WKT LINESTRING）转成 GeoJSON 加到 minemap 地图上。
部署地址 https://gmap.cqphx.cn:4443，key 从环境变量读。
```

**范例二 · 只问参数含义**

```text
参照 minemap-service 技能的 keywords 接口，说明 region 和 limitRegion 两个参数的区别，
以及我搜索"长江一路"时返回的 features 里既有 poi 又有 road，应该怎么区分和筛选。
```

**范例三 · 分页取全量**

```text
我用 keywords 接口查"解放路"，hits 有 2000 多条但只返回了 20 条。
请按 minemap-service 技能的参数说明，帮我写一个翻页循环把结果取全，
注意 pageSize 和 pageNum 的用法与上限。
```

## 3. 发起请求

```ts
const BASE = "https://gmap.cqphx.cn:4443/tianjing-server/lbs-api";
const KEY = "你的应用 key";
const REGION = "重庆市";

interface RoadSearchParams {
  keywords: string;
  pageSize?: number;
  pageNum?: number;
}

async function searchRoads({ keywords, pageSize = 20, pageNum = 0 }: RoadSearchParams) {
  const url = new URL(`${BASE}/integrated/v2/keywords`);
  url.searchParams.set("key", KEY);
  url.searchParams.set("keywords", keywords);
  url.searchParams.set("region", REGION); // 限定重庆市
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("pageNum", String(pageNum));

  const json = await (await fetch(url)).json();

  if (json.code !== 0) {
    throw new Error(`道路搜索失败：${json.msg ?? `code=${json.code}`}`);
  }
  return { hits: json.hits, features: json.features };
}
```

> 注意 `region` 要传**行政区名称**（如 `重庆市`）。实测传入其它省市（如 `北京市`、`浙江省`）会返回 `hits: 0`，说明当前部署的检索数据范围限定在重庆。

## 4. 解析返回数据

### 筛选道路

`features` 是**混合结果**：同一个关键字可能同时召回 POI、AOI 和道路。判断依据是 `feature_type`——道路为 `road` 或 `road-new`：

```ts
const { hits, features } = await searchRoads({ keywords: "中山三路" });

// 只要道路
const roads = features.filter((f) => f.feature_type.startsWith("road"));
```

实测的 `feature_type` 取值：`road` / `road-new`（道路）、`poi` / `poi-new`（兴趣点）、`aoi-new`（区域）。

### 取道路关键信息

```ts
const road = roads[0];

const name = road.name; // 道路名称
const grade = road.type; // 道路等级，如 "城市二级道路" / "省道"
const district = road.adminname; // 所属区县
const center = road.location; // { lng, lat }
const wkt = road.geometry; // WKT LINESTRING
```

真实响应示例（`keywords=中山三路&region=重庆市`，几何串已截断）：

```json
{
  "msg": "ok",
  "code": 0,
  "hits": 758,
  "features": [
    {
      "feature_type": "road",
      "level": "道路",
      "type": "省道",
      "uuid": "35d88bba-1d13-4ff4-b42a-66da965daab8",
      "name": "中山三路",
      "province": "重庆市",
      "city": "重庆城区",
      "admincode": "500103",
      "adminname": "渝中区",
      "address": "",
      "similarity": 1,
      "weight": 0,
      "location": { "lng": 106.55021661033555, "lat": 29.553120940844227 },
      "geometry": "LINESTRING(106.54989835791531 29.555644860565458, ...)"
    }
  ]
}
```

> 同一个路名会有**多条**要素（道路被分段存储），上例 `hits: 758` 即匹配到的要素总数。若要在地图上完整画出这条路，应把同名道路的几何**全部取回并合并**，而不是只取第一条。

### 解析 WKT 几何

道路的 `geometry` 是 WKT `LINESTRING` **字符串**，需先解析成坐标数组才能交给地图：

```ts
/** 把 WKT LINESTRING 解析成 [[lng, lat], ...] */
function parseWktLineString(wkt: string): [number, number][] {
  const inner = wkt.slice(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"));
  return inner.split(",").map((pair) => {
    const [lng, lat] = pair.trim().split(/\s+/).map(Number);
    return [lng, lat];
  });
}
```

### 交给地图渲染

```ts
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";
import { featureCollection, lineString } from "@turf/turf";

const { features } = await searchRoads({ keywords: "长江一路", pageSize: 20 });
const roads = features.filter((f) => f.feature_type.startsWith("road"));

const sourceId = createSourceId("road", "line");
const layerId = createLayerId("road", "line");

upsertGeoJSONSource(map, {
  id: sourceId,
  data: featureCollection(
    roads.map((road) =>
      lineString(parseWktLineString(road.geometry), {
        name: road.name,
        grade: road.type,
        district: road.adminname,
      }),
    ),
  ),
});
ensureLayers(map, [
  {
    id: layerId,
    type: "line",
    source: sourceId,
    paint: { "line-color": "#f08c00", "line-width": 4 },
  },
]);
```

图层与数据源的完整用法见[核心 API](/guide/core)，数据层的类型化约定见[最佳实践](/guide/best-practices)。

## 5. 注意事项

- **`region` 决定检索范围，当前部署限定在重庆**。实测同一关键字 `万达`：传 `region=重庆市` 返回 `hits: 9986`，传 `北京市` 或 `浙江省` 返回 `hits: 0`；不传 `region` 时结果也集中在重庆。因此本文固定传 `region=重庆市`。
- **搜完整路名才稳定命中道路**。实测搜 `中山三路`、`长江一路`、`解放路`、`龙溪路` 均返回 `road` / `road-new` 类型；而搜泛词（如 `路`）返回的几乎全是 POI / AOI。要查道路请用**较完整的路名**。
- **结果是混合类型，必须按 `feature_type` 筛选**。取值有 `road` / `road-new` / `poi` / `poi-new` / `aoi-new`；判断道路用 `feature_type.startsWith("road")` 最稳妥（新旧两套值都覆盖）。
- **`hits` 是全量匹配数，`features` 只返回当前页**。默认 `pageSize` 20，需要全量时用 `pageNum` 翻页。
- **道路的 `geometry` 是 WKT `LINESTRING`，POI 的 `geometry` 是 `POINT`**。同一字段两种几何类型，解析前先看 `feature_type`，或做类型判断后再解析。
- **同名道路有多段**。一条路会返回多条要素（分段），要画完整道路需合并同名的全部几何。
- **`limitRegion` 默认值在文档中拼写为 `falase`**（应为 `false`）；该参数与 `region` 配合使用，是否开启严格过滤以实际效果为准。
- **`types` 建议传分类代码而非分类名称**，否则召回可能不符合预期。
- **坐标系**：与位置服务其他接口一致，为经纬度（GCJ02 体系）。下游若用 WGS84 需自行纠偏。
- **注意 URL 编码**。`keywords` 与 `region` 含中文，必须用 UTF-8 百分号编码；若用 GBK 编码请求会静默返回 `hits: 0`。用 `URL` + `searchParams` 或 `encodeURIComponent` 即可避免。
