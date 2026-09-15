# 快速开始

`@ym/map-tools` v3 发布在公司 Verdaccio 私仓。项目 `.npmrc` 配置：

```ini
@ym:registry=http://192.168.3.180:4873/
```

```bash
pnpm add @ym/map-tools @turf/turf
```

`@turf/turf` 是本库的运行时依赖，同时也**建议作为业务项目的直接依赖**安装：GeoJSON 数据一律用它的辅助函数构造（见下文），类型也由它同源的 `geojson` 包提供。

## 前置 minemap SDK

minemap SDK 不参与 npm 安装和本库运行时打包。浏览器页面需要先加载 SDK（私有部署，v2.1.0；插件脚本清单见技能包 `packages/skills/map-tools/SKILL.md`）：

```html
<link rel="stylesheet" href="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css" />
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js"></script>
```

SDK 加载前 `window.minemap` 是可选值。TypeScript 项目通过显式类型入口启用补充声明：

```ts
/// <reference types="@ym/map-tools/minemap" />
```

该声明基于 minemap v2.1.0 的实际使用经验维护，不是服务商官方 npm 类型包。

## 第一个 GeoJSON 图层

GeoJSON 数据用 `@turf/turf` 的辅助函数构造，不要手写 `{ type: "FeatureCollection", features: [] }` 这类字面量——`point` / `polygon` / `featureCollection` 对类型字段和参数顺序都有约束，写错直接编译报错：

```ts
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";
import { featureCollection, point } from "@turf/turf";

const sourceId = createSourceId("demo", "poi");
const layerId = createLayerId("demo", "poi");

const map = new minemap.Map({
  container: "map",
  style:
    "https://gmap.cqphx.cn:4443/tianjing-server/mapdata-api/services/MapStyleServer/minemap-style/c8d13ba4fa374f16a60c7951be85fd03/styleJSON?key=d29c4baf318e48cf8d214b03a36b6cf2",
  center: [106.55, 29.56],
  zoom: 10,
});

map.on("load", () => {
  upsertGeoJSONSource(map, {
    id: sourceId,
    data: featureCollection([
      point([106.5516, 29.563], { name: "解放碑" }),
      point([106.5775, 29.5621], { name: "洪崖洞" }),
    ]),
  });
  ensureLayers(map, [
    {
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: { "circle-color": "#4de08b", "circle-radius": 6 },
    },
  ]);
});
```

数据为空时同样用 turf 构造空集合，而不是写字面量。注意**空数组要显式标注类型**：`featureCollection([])` 会把泛型推成 turf 自己的 `Properties`，与 `@ym/map-tools` 期望的 `GeoJSON` 不兼容，不标注会编译报错：

```ts
import { featureCollection } from "@turf/turf";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

const emptyFC = (): FeatureCollection<Geometry, GeoJsonProperties> => featureCollection([]);
upsertGeoJSONSource(map, { id: sourceId, data: emptyFC() });
```

数据层的类型化约定（`Feature` / `FeatureCollection` 泛型、入口适配器）见[最佳实践](/guide/best-practices)。

接入方式见 [核心 API](/guide/core)、[Vue 3](/guide/vue3)、[Vue 2](/guide/vue2)、[React](/guide/react) 和 [原生 HTML](/guide/html)。
