# 快速开始

`@ym/map-tools` v3 发布在公司 Verdaccio 私仓。项目 `.npmrc` 配置：

```ini
@ym:registry=http://192.168.3.180:4873/
```

```bash
pnpm add @ym/map-tools
```

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

```ts
import { createLayerId, createSourceId, ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";

const sourceId = createSourceId("demo", "district");
const layerId = createLayerId("demo", "district");

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
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });
  ensureLayers(map, [
    {
      id: layerId,
      type: "fill",
      source: sourceId,
      paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
    },
  ]);
});
```

接入方式见 [核心 API](/guide/core)、[Vue 3](/guide/vue3)、[Vue 2](/guide/vue2)、[React](/guide/react) 和 [原生 HTML](/guide/html)。
