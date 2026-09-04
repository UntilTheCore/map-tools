# @ym/minemap-types

minemap JS SDK 的全局 TypeScript 类型声明。

minemap SDK 本体无 npm 包，运行时经 CDN `<script>` 注入——对 TS / Vite 项目而言类型是"失灵"的。本包提供与 `@types/*` 等价的体验：安装后显式激活，即可获得 `minemap`、`minemaputil`、`minemap.edit` 等全局命名空间的完整类型提示。

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

## 覆盖范围

| 命名空间          | 内容                                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `minemap`         | Map / Evented / 事件清单 / Popup / Marker / LngLat / LngLatBounds / Navigation·Scale·Fullscreen 控件 / 自定义图层接口 / 全局配置（key/solution/domainUrl 等），含 MineMap 特有扩展（`addOverviewMap`、`setTimerCount` 系列、Marker 标题与动画等） |
| `minemaputil`     | RangingTool（测距/测面积）、`fitBounds(map, geojson)`、SpaceUtil（距离/最近点/包含/中点/形心）                                                                                                                                                    |
| `minemap.edit`    | 标绘编辑器（`init`、`Edit`、`draw` 数据池、历史记录、自定义样式）                                                                                                                                                                                 |
| `minemap.lbsUtil` | `districtFormat` 行政区划边界解析                                                                                                                                                                                                                 |

**不覆盖**：`minemap.service` / `minemap.component`（LBS 服务组件）。

## 依赖

- `@types/geojson`（peer）：声明中 GeoJSON 相关类型需要它，绝大多数 TS 项目已间接安装。
