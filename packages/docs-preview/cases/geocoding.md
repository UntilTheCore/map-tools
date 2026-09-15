# 地址解析与逆地址解析

两个方向相反的接口，都由天镜平台的位置服务（`lbs-api`）提供：

- **地址解析（地理编码）**：结构化地址 → 经纬度坐标。
- **逆地址解析（逆地理编码）**：经纬度坐标 → 结构化地址，并可附带周边的 POI、AOI、道路、道路交叉口。

两者都走 HTTP GET/POST，返回 JSON，调用前需要 `key`。本文以私有部署地址 `https://gmap.cqphx.cn:4443` 为实际调用地址。

## 1. 接口说明

### 地址解析（geocoding）

| 项       | 值                                                                         |
| -------- | -------------------------------------------------------------------------- |
| 接口地址 | `https://gmap.cqphx.cn:4443/tianjing-server/lbs-api/geocoding/geo`         |
| 请求方式 | GET、POST                                                                  |
| 服务描述 | 将详细的结构化地址转换为经纬度坐标（文档表述为"高德经纬度坐标"，即 GCJ02） |

参数：

| 参数    | 类型   | 必填 | 说明                                                                                                                                             |
| ------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| address | string | 是   | 结构化地址信息，建议按「国家、省份、城市、区县、城镇、乡村、街道、门牌号码、屋邨、大厦」的由大到小顺序书写，如 `北京市朝阳区阜通东大街6号`       |
| city    | string | 否   | 限定查询的地市，可传中文名（`北京`）、全拼（`beijing`）、citycode（`010`）、adcode（`110000`）；不支持县级市。不传或内容为空时退化为全国范围检索 |
| key     | string | 是   | 开发者应用密钥                                                                                                                                   |

返回字段（成功时业务数据在顶层 `data`）：

| 字段                                            | 说明                                             |
| ----------------------------------------------- | ------------------------------------------------ |
| `code` / `msg`                                  | 状态码与状态消息，`0` 为成功                     |
| `data.location`                                 | **关键字段**：解析出的坐标，`"经度,纬度"` 字符串 |
| `data.formatted_address`                        | 归一化后的完整地址                               |
| `data.province` / `data.city` / `data.district` | 省 / 市 / 区县                                   |
| `data.adcode`                                   | 区县行政区划编码                                 |
| `data.level`                                    | 匹配到的地址级别，如 `兴趣点`、`道路`、`建筑物`  |
| `data.confidence`                               | 置信度，0–1，越高越可信                          |
| `data.similarity`                               | 相似度，0–1                                      |
| `data.location_geom`                            | 坐标的 WKT `POINT` 表示，可直接交给地图          |

### 逆地址解析（reverse geocoding）

| 项       | 值                                                                            |
| -------- | ----------------------------------------------------------------------------- |
| 接口地址 | `https://gmap.cqphx.cn:4443/tianjing-server/lbs-api/geocoding/regeo`          |
| 请求方式 | GET、POST                                                                     |
| 服务描述 | 通过经纬度、POI 类型、道路等级等参数返回结构化地址与周边 POI / AOI / 道路信息 |

参数：

| 参数       | 类型   | 必填 | 说明                                                                                                       |
| ---------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------- |
| locations  | string | 是   | 坐标串，`"经度,纬度"`；多组之间用 `;` 分隔，最多 10 组                                                     |
| extensions | string | 否   | 控制返回哪些子结构：`base`（仅结构化地址，默认）\| 一个或多个 `aoi,poi,road,roadinter`（逗号分隔）\| `all` |
| radius     | double | 否   | 周边检索半径（米），默认 1000，取值区间 0–3000                                                             |
| roadlevel  | int    | 否   | `0` 返回所有道路；`1` 过滤非主干道，仅输出主干道。默认 1                                                   |
| orderby    | string | 否   | 附近 POI 排序：`weight`（按重要性）\| `distance`（按直线距离）                                             |
| poitypes   | string | 否   | 限定返回的附近 POI 类型                                                                                    |
| key        | string | 是   | 开发者应用密钥                                                                                             |

返回字段（成功时业务数据在顶层 `regeocodes`，是**数组**，与传入的坐标组一一对应）：

| 字段                             | 说明                                             |
| -------------------------------- | ------------------------------------------------ |
| `regeocodes[].formatted_address` | 归一化后的完整地址                               |
| `regeocodes[].addressComponent`  | 地址分级拆分，见下表                             |
| `regeocodes[].pois`              | 附近 POI 列表，需 `extensions` 含 `poi` 或 `all` |
| `regeocodes[].aois`              | 附近 AOI（商圈/建成区等）列表                    |
| `regeocodes[].roads`             | 附近道路列表                                     |
| `regeocodes[].roadinters`        | 附近道路交叉口列表                               |

`addressComponent` 的字段：`location`（坐标）、`province`、`city`、`district`、`adcode`、`street`、`town`、`village`、`road`、`number`、`building`、`country`，以及 `location_text`（点位文字描述）、`location_geom`（WKT `POINT`）。

`pois[]` 每项的字段：`id`、`name`、`type`、`tel`、`direction`（相对查询点的方位）、`distance`（米）、`address`、`location`。

## 2. 使用 skill 辅助开发

本仓库的技能包已把这两个接口（以及另外 38 个 Web 服务接口）整理成 **`minemap-service`** 技能，含完整参数表、返回字段表与已知文档问题记录：

```
packages/skills/minemap-jsapi-skill/minemap-service/
├── SKILL.md                          # 调用约定 + 任务路由表
└── references/
    ├── geocoding.md                  # 地址解析
    └── reverse-geocoding.md          # 逆地址解析
```

在支持 skill 的 AI 编程助手中，直接描述任务即可命中该技能，无需手动粘贴文档。下面是可以照抄的提示词范例。

**范例一 · 从零写一个调用**

```text
用 minemap-service 技能里的地理编码接口（geocoding/geo），帮我写一个 TypeScript 函数，
输入是结构化地址字符串，输出是 { lng, lat } 或 null。
要求：
1. 用 fetch 发 GET，部署地址是 https://gmap.cqphx.cn:4443，key 从环境变量读；
2. 只有 code === 0 且 data.location 存在时才返回坐标；
3. 失败时抛出带 msg 的错误，不要静默返回 null。
```

**范例二 · 只问参数含义**

```text
参照 minemap-service 技能的 reverse-geocoding 接口，说明 extensions 这个参数
有哪些取值、分别会多返回哪些字段，以及我想要"地址 + 附近 500 米内的 POI"
应该怎么传。
```

**范例三 · 排查返回字段对不上**

```text
我调用逆地理编码返回的数据里，地址在 regeocodes[0].addressComponent 下面，
但 minemap-service 技能的文档表格写的是 msg.regeocodes.address_component。
到底以哪个为准？顺便帮我把取「省市区 + 完整地址」的代码写对。
```

## 3. 发起请求

地址解析：

```ts
const BASE = "https://gmap.cqphx.cn:4443/tianjing-server/lbs-api";
const KEY = "你的应用 key";

async function geocode(address: string, city?: string) {
  const url = new URL(`${BASE}/geocoding/geo`);
  url.searchParams.set("key", KEY);
  url.searchParams.set("address", address);
  if (city) url.searchParams.set("city", city);

  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== 0) {
    throw new Error(`地理编码失败：${json.msg}`);
  }
  return json.data;
}
```

逆地址解析：

```ts
async function reverseGeocode(lng: number, lat: number, extensions = "all") {
  const url = new URL(`${BASE}/geocoding/regeo`);
  url.searchParams.set("key", KEY);
  url.searchParams.set("locations", `${lng},${lat}`);
  url.searchParams.set("extensions", extensions);
  url.searchParams.set("radius", "1000");

  const json = await (await fetch(url)).json();
  if (json.code !== 0) {
    throw new Error(`逆地理编码失败：${json.msg}`);
  }
  return json.regeocodes[0]; // 数组，按传入坐标顺序一一对应
}
```

多组坐标一次查（最多 10 组，用 `;` 分隔）：

```ts
url.searchParams.set("locations", "106.5759,29.5585;106.5516,29.5630");
```

## 4. 解析返回数据

### 地址解析：拿坐标

`data.location` 是 `"经度,纬度"` **字符串**，需要自己拆开。同时留意 `confidence`——置信度低时结果可能不可用：

```ts
const data = await geocode("北京市朝阳区阜通东大街6号");

const [lng, lat] = data.location.split(",").map(Number);

// 置信度过低时不要直接采信
if (data.confidence < 0.5) {
  console.warn("解析置信度偏低", data.confidence, data.formatted_address);
}

// data.location_geom 已经是 WKT，可直接构造点几何交给地图
console.log(data.location_geom); // POINT(107.33919482714137 30.32586520154977)
```

真实响应示例（`address=北京市朝阳区阜通东大街6号`，省略部分字段）：

```json
{
  "msg": "ok",
  "code": 0,
  "data": {
    "formatted_address": "重庆市市辖区垫江县新华街281附近正南方向60米6+衫",
    "province": "重庆市",
    "city": "市辖区",
    "district": "垫江县",
    "adcode": "500231",
    "road": "新华街281附近正南方向60米",
    "location": "107.33919482714137,30.32586520154977",
    "level": "兴趣点",
    "location_geom": "POINT(107.33919482714137 30.32586520154977)",
    "confidence": 0.41372817754745483,
    "similarity": 0.3333333432674408
  }
}
```

> **注意**：这个例子的输入是北京地址，返回的却是重庆的点位。当前部署上地理编码的召回质量不稳定，详见文末「注意事项」。

### 逆地址解析：拿地址与周边

`regeocodes` 是数组，与传入的坐标组顺序一一对应。地址分级在 `addressComponent`，周边信息在 `pois` / `aois` / `roads` / `roadinters`：

```ts
const item = await reverseGeocode(106.5759, 29.5585, "all");

// 1) 完整地址
const address = item.formatted_address;

// 2) 省 / 市 / 区县
const { province, city, district, adcode, street } = item.addressComponent;

// 3) 坐标（原样回显，字符串）
const [lng, lat] = item.addressComponent.location.split(",").map(Number);

// 4) 最近的一个 POI（distance 单位：米）
const nearestPoi = item.pois?.[0];

// 5) 过滤出 500 米内的 POI，按距离升序
const nearby = (item.pois ?? [])
  .filter((poi) => poi.distance <= 500)
  .sort((a, b) => a.distance - b.distance);
```

真实响应示例（`locations=106.5759,29.5585&extensions=base`）：

```json
{
  "msg": "ok",
  "code": 0,
  "regeocodes": [
    {
      "formatted_address": "重庆市市辖区渝中区解放碑街道解放碑国泰广场B1层37a号弓奇品味(PARK108国泰优活城市广场店)",
      "addressComponent": {
        "location": "106.5759,29.5585",
        "country": "中国",
        "adcode": "500103",
        "province": "重庆市",
        "city": "市辖区",
        "district": "渝中区",
        "street": "解放碑街道",
        "road": "解放碑国泰广场B1层37a号",
        "location_text": "弓奇品味(PARK108国泰优活城市广场店)",
        "location_geom": "POINT(106.57587863418668 29.558498921268615)"
      }
    }
  ]
}
```

加上 `extensions=all` 后，同一个点会多返回周边列表。`pois` 单项结构：

```json
{
  "id": "7d5209ce-1b9f-46c7-96d5-004e45393704",
  "name": "洪崖洞民俗风貌旅游区",
  "type": "运动、休闲;风景名胜;风景名胜",
  "tel": "023-63039999",
  "direction": "东北",
  "distance": 428.415069405595,
  "address": "嘉陵江滨江路88号",
  "location": "106.57752305779606,29.562084841038576"
}
```

实测各列表的规模：`pois` 约 3 条，`aois` / `roads` / `roadinters` 各约 30 条。

### 交给地图渲染

两个接口拿到的都是坐标或 WKT，用 turf 的辅助函数构造 GeoJSON 后即可用 `@ym/map-tools` 渲染。不要手写 `{ type: "Point", coordinates: [...] }` 这类字面量——turf 的 `point` / `lineString` 对类型字段和参数顺序都有约束，写错直接编译报错：

```ts
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";
import { featureCollection, point } from "@turf/turf";

const data = await geocode("北京市朝阳区阜通东大街6号");
const [lng, lat] = data.location.split(",").map(Number);

const sourceId = createSourceId("geo", "point");
const layerId = createLayerId("geo", "point");

upsertGeoJSONSource(map, {
  id: sourceId,
  data: featureCollection([
    point([lng, lat], {
      address: data.formatted_address,
      level: data.level,
      adcode: data.adcode,
    }),
  ]),
});
ensureLayers(map, [{ id: layerId, type: "circle", source: sourceId }]);
```

若要把周边 POI 一并画上，`featureCollection` 直接吃数组即可：

```ts
import { featureCollection, point } from "@turf/turf";

const item = await reverseGeocode(106.5759, 29.5585, "all");

const poiFC = featureCollection(
  (item.pois ?? []).map((poi) => {
    const [poiLng, poiLat] = poi.location.split(",").map(Number);
    return point([poiLng, poiLat], { name: poi.name, type: poi.type, distance: poi.distance });
  }),
);

upsertGeoJSONSource(map, { id: createSourceId("geo", "poi"), data: poiFC });
```

图层与数据源的完整用法见[核心 API](/guide/core)，数据层的类型化约定见[最佳实践](/guide/best-practices)。

## 5. 注意事项

- **坐标系是 GCJ02**。文档表述为"高德经纬度坐标"。若下游使用 WGS84（GPS 原始坐标），需要自行做坐标纠偏，不能直接混用。
- **`key` 必填**。缺失时接口返回 `code: 500` 且 `msg` 为 `Required request parameter 'address' ... is not present` 之类的参数校验信息。
- **成功与否看 `code`**。`code === 0` 才算成功；失败时 `msg` 给出原因，但**可能为 `null`**，不要依赖它做分支判断。
- **返回字段层级与文档表格不一致**。文档把字段写成 `msg.data` / `msg.regeocodes`，实际响应的业务数据在**顶层** `data` / `regeocodes`。同理，文档写 `address_component`，实际是 `addressComponent`。以实际响应为准（技能 reference 中已记录该差异）。
- **`extensions` 决定返回体积**。只要地址就传 `base`（默认）；要周边 POI / 道路才传 `all` 或按需组合 `aoi,poi,road,roadinter`。
- **坐标串分隔符**：点内用 `,`、点间用 `;`，最多 10 组。多边形首尾坐标须闭合的约定不适用于本接口。
- **当前部署上地理编码召回质量不稳定**（实测）：
  - 部分地址直接返回 `code: 500` + `解析地址失败!`，例如 `重庆市渝中区解放碑`、`观音桥`、`重庆北站`；
  - 部分地址能返回 `code: 0`，但结果与输入无关（输入北京地址返回重庆点位），且 `confidence` 仅约 0.41；
  - 因此**不要把 `code === 0` 当作结果正确**，应结合 `confidence` / `similarity` 与 `formatted_address` 做校验，必要时用 `city` 限定范围。
    逆地址解析实测正常，返回结果与坐标吻合。
