# Resources

资源 API 只负责 source 和 layer 的创建、更新、替换与清理。调用方明确传入关联资源，库不会从对象 key 推断资源类型。

## `upsertGeoJSONSource`

```ts
const result = upsertGeoJSONSource(map, {
  id: "district-source",
  data: featureCollection,
  options: {},
});
```

source 不存在时创建并返回 `"created"`；已存在时只调用 `setData` 更新数据并返回 `"updated"`。已存在但不是 GeoJSON source 时抛出错误，不会静默替换。

## `updateSourceData`

```ts
const updated = updateSourceData(map, "district-source", featureCollection);
```

只更新已存在的 GeoJSON source 数据，返回是否更新成功；source 缺失或不是 GeoJSON source 时返回 `false`，不打印警告。

## `replaceVectorSource`

```ts
replaceVectorSource(map, {
  id: "landuse-source",
  tiles: ["https://example.test/{z}/{x}/{y}.pbf"],
  layers: [
    {
      id: "landuse-fill",
      type: "fill",
      source: "landuse-source",
      "source-layer": "Landuse",
    },
  ],
});
```

先移除本次传入 layer 中已存在的 layer，再移除旧 source，替换为新 vector source，最后按传入顺序重建 layer。未列出的 layer 不会被影响。

## 其他 API

- `ensureLayer(map, layer)`：layer 不存在时添加，返回是否添加。
- `ensureLayers(map, layers)`：批量补建 layer，返回实际添加的数量。
- `removeResources(map, { layerIds, sourceIds })`：固定先删 layer，再删 source；缺失的资源静默跳过。
- `createSourceId(prefix, name?)` / `createLayerId(prefix, name?)`：生成稳定的 `prefix-name-source` / `prefix-name-layer` id。
- `isGeoJSONSource(source)`：缩窄 SDK source 实例到可调用 `setData` 的 GeoJSON source。
