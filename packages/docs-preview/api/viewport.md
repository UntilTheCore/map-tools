# Viewport

```ts
easeTo(map, { center: [116.3976, 39.9087], zoom: 12 });
panTo(map, [116.3154, 39.9829]);
setZoom(map, 8);
```

`setZoom` 不再包含任何硬编码缩放阈值。

## 自适应视野

```ts
fitToFeatures(map, features, {
  padding: { top: 60, right: 60, bottom: 60, left: 60 },
  maxZoom: 15,
});

fitToGeometry(map, geometry, {
  padding: { top: 80, right: 80, bottom: 80, left: 80 },
});
```

两个 API 使用 Turf `bbox` 计算完整 GeoJSON 边界，适用于点、线、面及其集合。空 feature 数组返回 `false`。

## 已渲染图层

```ts
const fitted = await fitToRenderedLayer(map, {
  layerId: "landuse-fill",
  sourceId: "landuse-source",
  wait: { timeoutMs: 15_000 },
  beforeQuery: () => setZoom(map, 11),
});
```

默认不修改 zoom。需要扩大矢量瓦片抓取范围时，通过 `beforeQuery` 明确表达。
