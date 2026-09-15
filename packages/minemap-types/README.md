# @ym/minemap-types

minemap JS SDK 的全局 TypeScript 类型声明，外加天镜平台 Web 服务 API 的接口类型。

minemap SDK 本体无 npm 包，运行时经 CDN `<script>` 注入——对 TS / Vite 项目而言类型是"失灵"的。本包提供与 `@types/*` 等价的体验：安装后显式激活，即可获得 `minemap`、`minemaputil`、`minemap.edit` 等全局命名空间的完整类型提示。

服务端 HTTP 接口（`tianjing-server/...`）没有全局命名空间，因此以**独立子路径模块**提供：按需 `import type`，不污染全局。

## 安装

```bash
# 需已配置 @ym scope 指向私仓（.npmrc）：
#   @ym:registry=http://192.168.3.180:4873/
pnpm add -D @ym/minemap-types
```

## 激活全局类型（三选一）

```ts
// 方式一：tsconfig compilerOptions.types（推荐，一次配置全局生效）
{ "compilerOptions": { "types": ["@ym/minemap-types"] } }
```

```ts
// 方式二：源文件顶部指令
/// <reference types="@ym/minemap-types" />
```

```ts
// 方式三：任意模块中一次性导入
import type {} from "@ym/minemap-types";
```

使用 `@ym/map-tools` 的项目无需安装本包——它随 map-tools 的 `dependencies` 自动传递，可继续走 `@ym/map-tools/minemap` 子路径激活（契约不变）。

## Web 服务 API 类型（`/service` 子路径）

天镜平台 Web 服务 API（数据服务 / 位置服务 / 功能服务三大类共 40 个 HTTP 接口）的类型**不是全局声明**，而是普通 ES 模块导出，按需引入：

```ts
import type { DrivingRequest, DrivingResponse } from "@ym/minemap-types/service";

const params: DrivingRequest = {
  key: "your-app-key",
  origin: "108.942176,34.224166",
  destination: "108.941635,34.206624",
  strategy: 5,
};

const res: DrivingResponse = await fetch(url).then((r) => r.json());
if (res.code === 0) {
  const route = res.result.routes[0];
  console.log(route?.distance, route?.duration, route?.routeLine);
}
```

覆盖范围：

| 类别     | 内容                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 数据服务 | 矢量切片元数据、地图服务、要素服务（含要素增删改）、3D 切片/地形/模型、栅格地形切片、地图样式方案、要素查询与编辑结果                      |
| 位置服务 | 行政区划查询/反查、地理编码/逆地理编码、地点输入提示、关键字/周边/多边形/沿线 POI 搜索、驾车/步行/骑行/公交路径规划                        |
| 功能服务 | 坐标转换与投影、面积周长、线段长度、求距离、标注点、空间关系断言、缓冲区、凸包、切割、致密化、差集、泛化、交集、重塑、简化、裁切延伸、合并 |

共用基础设施：`ServiceBaseRequest`（`key` 必填）、`LbsEnvelope` / `LbsPayload<T, K>`（位置服务 `{ code, msg, ... }` 信封）、`GeometryServiceResponse`（功能服务 `TiantuMapServerVersion`）、`DataServiceResponse`（数据服务 `TianjingServerVersion`）、Esri 几何类型（`EsriPolygonGeometry` / `EsriPolylineGeometry` / `EsriPointGeometry`）。

> 上游文档在字段名上存在若干不一致（如 `formatted_address` 文档写作 `Formatted_addres`、`addressComponent` 写作 `address_component`），类型以**实际响应示例**为准，两种拼写都保留为可选字段；逐条差异见 `packages/skills/minemap-jsapi-skill/minemap-service/` 各 reference 的「注意事项与已知文档问题」。

## 覆盖范围（全局声明）

| 命名空间          | 内容                                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minemap`         | Map / Evented / 事件清单 / Popup / Marker / LngLat / LngLatBounds / Navigation·Scale·Fullscreen 控件 / 自定义图层接口 / 全局配置（key/solution/domainUrl 等），含 MineMap 特有扩展（`addOverviewMap`、`setTimerCount` 系列、Marker 标题与动画等） |
| `minemaputil`     | RangingTool（测距/测面积）、`fitBounds(map, geojson)`、SpaceUtil（距离/最近点/包含/中点/形心）                                                                                                                                                    |
| `minemap.edit`    | 标绘编辑器（`init`、`Edit`、`draw` 数据池、历史记录、自定义样式）                                                                                                                                                                                 |
| `minemap.lbsUtil` | `districtFormat` 行政区划边界解析                                                                                                                                                                                                                 |

**不覆盖**：前端 LBS 插件 `minemap.service` / `minemap.component`（随 `minemap-service.js` 注入，用法见 `minemap-lbs` 技能）；服务端 HTTP 接口的类型见上文 `@ym/minemap-types/service`。

## 依赖

- `@types/geojson`（peer）：全局声明中 GeoJSON 相关类型需要它，绝大多数 TS 项目已间接安装。`/service` 子路径不依赖它。
