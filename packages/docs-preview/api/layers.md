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
