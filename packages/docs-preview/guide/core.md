# 核心 API

根入口只包含框架无关的核心能力：

```ts
import {
  createLayerId,
  createSourceId,
  ensureLayers,
  upsertGeoJSONSource,
  setLayerVisibility,
  setSourceFilter,
  fitToFeatures,
} from "@ym/map-tools";
```

也可以按领域导入：

```ts
import { upsertGeoJSONSource, ensureLayers } from "@ym/map-tools/resources";
import { setLayerVisibility } from "@ym/map-tools/layers";
import { fitToFeatures } from "@ym/map-tools/viewport";
```

## 资源与图层

```ts
upsertGeoJSONSource(map, {
  id: "district-source",
  data: geojson,
});
ensureLayers(map, [
  {
    id: "district-fill",
    type: "fill",
    source: "district-source",
  },
]);

setLayerVisibility(map, "district-fill", true);
```

资源 API 明确区分 GeoJSON 更新和 vector source 重建，图层显隐不会隐式加载数据。

整层用显隐（layout），层内按属性筛 feature 用 source 级过滤——`setSourceFilter` 自动找到引用该 source 的全部图层并统一设置，无需手工成对处理 fill/outline：

```ts
setSourceFilter(map, "district-source", ["in", "deptId", 101, 102]);
setSourceFilter(map, "district-source", null); // 清除过滤
```

## 视野与查询

```ts
const loaded = await waitForSourceLoaded(map, "district-source");
const features = queryRenderedFeatures(map, { layers: ["district-fill"] });

if (loaded) {
  fitToFeatures(map, features, {
    padding: { top: 60, right: 60, bottom: 60, left: 60 },
  });
}
```

根入口导出 `MapToolsError`。错误处理应检查 `error.code`，而不是依赖 `console.warn` 或 SDK 私有字段。

完整签名见 [API 总览](/api/overview)。
