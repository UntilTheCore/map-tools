# useMap

Vue 2、Vue 3 与 React 使用同一事件模型：

```ts
const { mapRef, setMap, on, off, unbindAll } = useMap({
  layers: {
    click: ["district-fill"],
    mousemove: ["district-fill"],
    zoomend: ["district-fill"],
  },
  zoomQueryBy: "mouse",
  mapLifecycle: "external",
});
```

事件名：`loaded`、`click:layer`、`click:empty`、`mousemove:layer`、`mousemove:empty`、`zoomend:layer`、`zoomend:empty`。

```ts
const unsubscribe = on("click:layer", ({ map, event, features, layerIds }) => {
  console.log(features, layerIds);
});

unsubscribe();
off("click:layer", listener);
unbindAll();
```

命中事件传递全部 `features`，不再只挑首个要素；payload 同时包含原始地图事件、`layerIds`、地图实例、鼠标坐标与适用时的中心坐标。

`setMap` 可重复调用。替换实例时会自动解绑旧实例。默认 `mapLifecycle: "external"`，仅在 `"owned"` 时组件卸载调用 `map.remove()`。

- Vue：`mapRef` 是 `Ref<MapLike | null>`，内部使用 `shallowRef + markRaw`。
- React：`mapRef` 是 `MutableRefObject<MapLike | null>`。
