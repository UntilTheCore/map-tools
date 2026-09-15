# 公交路径规划

输入起点与终点坐标，取回公共交通的路线方案。接口由天镜平台的位置服务（`lbs-api`）提供，走 HTTP GET/POST，返回 JSON，调用前需要 `key`。本文以私有部署地址 `https://gmap.cqphx.cn:4443` 为实际调用地址。

> 公交接口的地址含 `special` 段：`route/v2/special/transit`。不要漏掉，写成 `route/v2/transit` 会返回 500（见文末注意事项）。

> 公交路径规划与驾车 / 步行 / 骑行路径规划**共用同一套返回结构**（`result.routes[]` + `steps[]`），差别只在请求参数与算路方式。如果你需要驾车或步行，用 `route/v2/driving` / `route/v2/walking` / `route/v2/bicycling`，参数与解析代码完全通用。

## 1. 接口说明

| 项       | 值                                                                            |
| -------- | ----------------------------------------------------------------------------- |
| 接口地址 | `https://gmap.cqphx.cn:4443/tianjing-server/lbs-api/route/v2/special/transit` |
| 请求方式 | GET、POST                                                                     |
| 服务描述 | 根据起终点坐标检索符合条件的公共交通路线规划方案                              |

参数：

| 参数         | 类型   | 必填 | 说明                                                      |
| ------------ | ------ | ---- | --------------------------------------------------------- |
| origin       | string | 是   | 起点，`"经度,纬度"`（经度在前），如 `106.5759,29.5585`    |
| destination  | string | 是   | 终点，`"经度,纬度"`（经度在前）                           |
| alternatives | int    | 否   | 是否返回备选路线：`0` 返回 1 条（默认）\| `1` 返回 1–3 条 |
| key          | string | 是   | 开发者应用密钥                                            |

返回字段（成功时业务数据在顶层 `result`）：

| 字段                                      | 说明                                                                   |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `code` / `msg`                            | 状态码与状态消息，`0` 为成功                                           |
| `result.count`                            | 路线数量                                                               |
| `result.routes[]`                         | 路线数组，**关键数据都在这里**                                         |
| `result.routes[].distance`                | 路线总距离，单位：米                                                   |
| `result.routes[].duration`                | 路线总耗时，单位：秒                                                   |
| `result.routes[].strategy`                | 算路策略编号                                                           |
| `result.routes[].tolls` / `.tollDistance` | 道路收费（元）/ 收费路段距离（米）                                     |
| `result.routes[].trafficLights`           | 红绿灯总数                                                             |
| `result.routes[].restriction`             | 限行状态：`0` 无限行 \| `1` 途经限行城市 \| `2` 已避让 \| `3` 无法避开 |
| `result.routes[].routeLine`               | **整条路线几何**，WKT `LINESTRING` 字符串                              |
| `result.routes[].steps[]`                 | 分段引导详情，见下                                                     |

`steps[]` 每项的字段：

| 字段              | 说明                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| `waypointsIdx`    | 所属途经点段序号（从 0 起）                                                          |
| `distance`        | 分段长度（米）                                                                       |
| `time_ms`         | 分段耗时（**毫秒**，注意与路线级 `duration` 的「秒」不同）                           |
| `roadname`        | 分段道路名                                                                           |
| `orientation`     | 进入道路的方向，如 `东`、`东南`                                                      |
| `instruction`     | 文字引导提示，如 `沿望京街向东南行驶398米左转`                                       |
| `action`          | 路线主要动作（直行 / 左转 / 右转 / 掉头等）                                          |
| `assistantAction` | 辅助动作（进入主路 / 环岛 / 隧道 / 匝道等）                                          |
| `polyline`        | 分段几何，坐标串 `"经度,纬度;经度,纬度"`                                             |
| `polylineGeom`    | 分段几何，WKT `LINESTRING`                                                           |
| `linkinfo[]`      | 路段详情（`linkid`、`traffic_speeds` 路况速度、`link_points`），取决于服务端是否返回 |

## 2. 使用 skill 辅助开发

本仓库的技能包已把该接口（以及另外 39 个 Web 服务接口）整理成 **`minemap-service`** 技能：

```
packages/skills/minemap-jsapi-skill/minemap-service/
├── SKILL.md                          # 调用约定 + 任务路由表
└── references/
    ├── transit-route.md              # 公交路径规划
    ├── driving-route.md              # 驾车（参数最全：避让区域/途经点/策略/车牌）
    └── walking-route.md / bicycling-route.md
```

在支持 skill 的 AI 编程助手中，直接描述任务即可命中该技能。下面是可照抄的提示词范例。

**范例一 · 从零写调用并渲染**

```text
用 minemap-service 技能的公交路径规划接口（lbs-api/route/v2/special/transit），
帮我写一个函数：输入起终点经纬度，取回第一条路线，用 @turf/turf 的 lineString
和 featureCollection 把 routeLine（WKT LINESTRING）转成 GeoJSON 加到 minemap 地图上。
部署地址 https://gmap.cqphx.cn:4443，key 从环境变量读。
```

**范例二 · 只问参数含义**

```text
参照 minemap-service 技能，说明公交路径规划的 origin/destination 参数格式，
以及 alternatives 传 0 和 1 有什么区别。另外我如果要「驾车 + 避开高速 + 带车牌限行判断」，
应该看哪个 reference？
```

**范例三 · 解析分段引导**

```text
我拿到了路径规划返回的 result.routes[0]，想在地图旁边渲染一个逐步导航列表，
每项显示「引导文字 + 分段距离 + 进入道路的方向」。
请按 minemap-service 技能的字段说明，告诉我该取 steps[] 里的哪些字段，
以及 distance / time_ms / duration 各自的单位。
```

## 3. 发起请求

```ts
const BASE = "https://gmap.cqphx.cn:4443/tianjing-server/lbs-api";
const KEY = "你的应用 key";

interface RouteParams {
  origin: [number, number]; // [经度, 纬度]
  destination: [number, number];
  alternatives?: 0 | 1;
}

async function planRoute({ origin, destination, alternatives }: RouteParams) {
  const url = new URL(`${BASE}/route/v2/special/transit`);
  url.searchParams.set("key", KEY);
  url.searchParams.set("origin", origin.join(","));
  url.searchParams.set("destination", destination.join(","));
  if (alternatives !== undefined) {
    url.searchParams.set("alternatives", String(alternatives));
  }

  const json = await (await fetch(url)).json();

  if (json.code !== 0) {
    throw new Error(`路径规划失败：${json.msg ?? `code=${json.code}`}`);
  }
  return json.result.routes; // 路线数组
}
```

换成驾车 / 步行 / 骑行只需改路径：

```ts
url.pathname = "/tianjing-server/lbs-api/route/v2/driving"; // 或 walking / bicycling
```

## 4. 解析返回数据

### 取路线概览

```ts
const routes = await planRoute({
  origin: [106.5759, 29.5585],
  destination: [106.5516, 29.563],
});

const route = routes[0];

const distanceMeters = route.distance; // 米
const durationSeconds = route.duration; // 秒
const minutes = Math.round(durationSeconds / 60);

console.log(`${(distanceMeters / 1000).toFixed(2)} 公里，约 ${minutes} 分钟`);
```

真实响应示例（重庆·解放碑 → 较场口，省略长几何串）：

```json
{
  "msg": "ok",
  "code": 0,
  "status": 0,
  "result": {
    "count": 1,
    "routes": [
      {
        "strategy": 0,
        "distance": 3072.545,
        "duration": 393,
        "tolls": 0,
        "tollDistance": 0,
        "trafficLights": 0,
        "restriction": 0,
        "routeLine": "LINESTRING (106.575631 29.558625, 106.575613 29.558595, ...)",
        "steps": [
          {
            "waypointsIdx": 0,
            "distance": 71.862,
            "time_ms": 10348,
            "roadname": "来龙巷",
            "orientation": "",
            "instruction": "继续行驶到 来龙巷",
            "action": "继续行进",
            "assistantAction": "",
            "polyline": "106.575631,29.558625;106.575613,29.558595;...",
            "polylineGeom": "LINESTRING (106.575631 29.558625, 106.575613 29.558595, ...)"
          }
        ]
      }
    ]
  }
}
```

该次请求返回 7 个 `steps`。注意 `status` 字段：成功时为 `0`，与 `code` 含义相近，判断成功与否**用 `code` 即可**。

### 解析 WKT 几何

`routeLine` 与 `steps[].polylineGeom` 都是 WKT `LINESTRING` **字符串**，不能直接交给地图，需要先解析成坐标数组：

```ts
/** 把 WKT LINESTRING 解析成 [[lng, lat], ...] */
function parseWktLineString(wkt: string): [number, number][] {
  const inner = wkt.slice(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"));
  return inner.split(",").map((pair) => {
    const [lng, lat] = pair.trim().split(/\s+/).map(Number);
    return [lng, lat];
  });
}

const coordinates = parseWktLineString(route.routeLine);
```

`steps[].polyline` 是另一种格式（坐标串 `"经度,纬度;经度,纬度"`），解析方式不同：

```ts
function parseCoordinateString(s: string): [number, number][] {
  return s.split(";").map((pair) => {
    const [lng, lat] = pair.split(",").map(Number);
    return [lng, lat];
  });
}
```

### 渲染引导列表

```ts
const guides = route.steps.map((step) => ({
  text: step.instruction, // 引导文字
  road: step.roadname, // 道路名
  direction: step.orientation, // 进入方向
  meters: step.distance, // 分段长度（米）
  seconds: step.time_ms / 1000, // 分段耗时：毫秒 → 秒
}));
```

> 单位陷阱：路线级 `duration` 是**秒**，分段级 `time_ms` 是**毫秒**，两者不要混用。

### 交给地图渲染

```ts
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";
import { featureCollection, lineString } from "@turf/turf";

const sourceId = createSourceId("route", "line");
const layerId = createLayerId("route", "line");

upsertGeoJSONSource(map, {
  id: sourceId,
  data: featureCollection([
    lineString(parseWktLineString(route.routeLine), {
      distance: route.distance,
      duration: route.duration,
    }),
  ]),
});
ensureLayers(map, [
  {
    id: layerId,
    type: "line",
    source: sourceId,
    paint: { "line-color": "#2f6fed", "line-width": 6 },
  },
]);
```

需要把每一段分别画出来（例如按 `instruction` 交互）时，用 `featureCollection` 汇总所有分段：

```ts
import { featureCollection, lineString } from "@turf/turf";

const stepsFC = featureCollection(
  route.steps.map((step) =>
    lineString(parseCoordinateString(step.polyline), {
      instruction: step.instruction,
      roadname: step.roadname,
      meters: step.distance,
    }),
  ),
);
```

图层与数据源的完整用法见[核心 API](/guide/core)，数据层的类型化约定见[最佳实践](/guide/best-practices)。

## 5. 注意事项

- **接口地址含 `special` 段，漏写会返回 500**。正确地址是
  `https://gmap.cqphx.cn:4443/tianjing-server/lbs-api/route/v2/special/transit`。

  写成 `route/v2/transit`（少一段 `special`）时，该路径**同样被服务端注册**——不带参数请求会返回
  `Required request parameter 'origin' ... is not present`，看起来"接口存在"——但**真正执行算路时一律返回**：

  ```json
  { "msg": null, "code": 500 }
  ```

  这个错误响应不带任何提示信息，很容易被误判成服务故障。加上 `special` 段后实测正常返回 `code: 0`。
  排查这类问题时，建议先用「不带参数」探测路由是否存在，再确认完整路径段是否写全。

- **公交返回的是通用路线结构（实测）**。`special/transit` 的 `result.routes[]` 字段与驾车 / 步行 / 骑行
  完全一致（`strategy` / `distance` / `duration` / `tolls` / `tollDistance` / `trafficLights` /
  `restriction` / `routeLine` / `steps`），**实测未出现线路、站点、换乘等公交专属字段**。
  因此下面的字段说明与解析代码对四种出行方式通用。

- **`alternatives` 实测有效**。传 `1` 时可返回 3 条路线（`result.count: 3`），传 `0` 返回 1 条。

- **`msg` 可能为 `null`**。失败时不要依赖 `msg` 做分支判断，用 `code` 判断，并在 `msg` 为空时给出兜底文案。
- **`action` / `assistantAction` 的实际类型与文档不一致（实测）**。文档写的是整数编号（如 `2` 代表左转），实际响应返回的是**中文字符串**（如 `"继续行进"`）。如果要用它做图标映射，先按字符串处理并做好兜底，不要假设是数字。
- **几何是 WKT 字符串**。`routeLine`、`polylineGeom` 需自行解析；`polyline` 是坐标串格式。三者都不要直接传给地图。
- **坐标系**：与位置服务其他接口一致，为经纬度（GCJ02 体系）。下游若用 WGS84 需自行纠偏。
- **起终点需落在导航数据范围内**。范围外返回 `路径规划失败:规划点坐标超出导航道路数据范围!`（`code: 500`、`status: 100`）；实测导航数据覆盖重庆主城。
- **分段耗时单位是毫秒**（`time_ms`），路线总耗时是秒（`duration`）。
