# 原生 HTML（UMD）

UMD 全局名固定为 `FE_utils`，产物路径固定为 `dist/umd/index.umd.js`。

```html
<link rel="stylesheet" href="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css" />
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js"></script>
<script src="./vendor/fe-utils.umd.js"></script>
```

```html
<script>
  const sourceId = FE_utils.createSourceId("demo", "district");
  const layerId = FE_utils.createLayerId("demo", "district");

  const map = new minemap.Map({
    container: "map",
    style:
      "https://gmap.cqphx.cn:4443/tianjing-server/mapdata-api/services/MapStyleServer/minemap-style/c8d13ba4fa374f16a60c7951be85fd03/styleJSON?key=d29c4baf318e48cf8d214b03a36b6cf2",
    center: [106.55, 29.56],
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
