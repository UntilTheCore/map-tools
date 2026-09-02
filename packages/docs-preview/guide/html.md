# 原生 HTML（UMD）

UMD 全局名固定为 `FE_utils`，产物路径固定为 `dist/umd/index.umd.js`。

```html
<link rel="stylesheet" href="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.css" />
<script src="https://minemap.minedata.cn/minemapapi/v3.0.0/minemap.js"></script>
<script src="./vendor/fe-utils.umd.js"></script>
```

```html
<script>
  const sourceId = FE_utils.createSourceId("demo", "district");
  const layerId = FE_utils.createLayerId("demo", "district");

  const map = new minemap.Map({
    container: "map",
    style: "https://service.minedata.cn/map/solu/style/11003",
    center: [116.4026, 39.9494],
    zoom: 10,
  });

  map.on("load", () => {
    FE_utils.upsertGeoJSONSource(map, {
      id: sourceId,
      data: { type: "FeatureCollection", features: [] },
    });
    FE_utils.ensureLayers(map, [{ id: layerId, type: "fill", source: sourceId }]);
  });
</script>
```

## Script 用户的 TypeScript 类型

在 `.ts` 或 `.d.ts` 文件中启用一次：

```ts
/// <reference types="@ym/map-tools/umd" />
```

它同时提供 `FE_utils`、`minemap.Map`、`minemap.Popup`、`minemap.Marker`、`minemap.MapLayer` 和 `minemap.MapSource`。无需安装不存在的 minemap npm 包。

UMD 只暴露核心 API；`useMap` 是 Vue/React 适配器能力，不在 `FE_utils` 中。
