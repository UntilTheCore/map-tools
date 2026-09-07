# Query

## `waitForSourceLoaded`

```ts
const loaded = await waitForSourceLoaded(map, "landuse-source", {
  timeoutMs: 30_000,
  intervalMs: 1_000,
  signal,
});
```

立即检查一次 source 状态。超时或 `AbortSignal` 取消时返回 `false`；非法参数抛出 `MapToolsError`；SDK 调用异常包装为 `SDK_ERROR` 后重新抛出。

## `queryRenderedFeatures`

```ts
const features = queryRenderedFeatures(map, {
  point: [106.55, 29.56],
  layers: ["landuse-fill"],
  filter: ["==", "kind", "park"],
});
```

查询的是当前地图已渲染的要素，因此不以 PBF 命名。无结果返回空数组。`RenderedFeature` 保留 `layer.id`，并支持 geometry/property 泛型。
