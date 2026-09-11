# Layers

图层显隐与数据加载分离。调用方先完成资源加载，再显式设置可见性。

```ts
setLayerVisibility(map, "district-fill", false);
setLayersVisibility(map, ["district-fill", "road-line"], true);

const visibility = getLayerVisibility(map, "district-fill");
const nextVisibility = toggleLayerVisibility(map, "district-fill");
```

- `setLayerVisibility`：图层不存在时返回 `false`。
- `getLayerVisibility`：返回 `"visible"`、`"none"` 或图层不存在时的 `undefined`。
- `toggleLayerVisibility`：返回切换后的值；图层不存在返回 `undefined`。
- `setLayersVisibility`：返回成功更新的图层数量。

v3 不再提供 `showLayer`、`hideLayer`、`toggleLayer({ getData })` 等隐式数据控制 API。

## Source 级过滤

显隐管"整层"，`setSourceFilter` 管"层内按属性筛 feature"。它从地图真实状态反查引用指定 source 的全部图层（fill + outline 等）并统一 `setFilter`，结构上保证成对设置，调用方无需维护"source 对应哪些图层"的配对信息：

```ts
// 只看 fleetId 为 1、2 的车辆（同 source 的每个图层都会被设置）
setSourceFilter(map, "vehicle-point-source", ["in", "fleetId", 1, 2]);

// 清除过滤，恢复全部 feature
setSourceFilter(map, "vehicle-point-source", null);

// 需要更细粒度时，先取图层清单
const layerIds = getSourceLayerIds(map, "vehicle-point-source"); // string[]
```

- `setSourceFilter`：返回成功设置 filter 的图层数量；source 无对应图层时返回 `0`（不抛错，配合图层未就绪场景）。
- `getSourceLayerIds`：返回引用该 source 的全部图层 id（内联 source 的图层不参与匹配），可用于校验图层是否已挂载。
- filter 语义遵循 mapbox 表达式规范，`null` 表示清除；传入非数组且非 `null` 时抛出 `INVALID_ARGUMENT`。

## 双通道选择

| 需求                     | 通道              | API                                      |
| ------------------------ | ----------------- | ---------------------------------------- |
| 整层临时隐藏（图层开关） | layout visibility | `setLayerVisibility(map, id, boolean)`   |
| 层内按属性筛部分 feature | style filter      | `setSourceFilter(map, sourceId, filter)` |
