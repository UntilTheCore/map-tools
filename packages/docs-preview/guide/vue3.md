# Vue 3

```bash
pnpm add @ym/map-tools vue
```

```ts
import { createPopupDom, useMap } from "@ym/map-tools/vue3";
import { ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";
```

## `useMap`

```ts
const { mapRef, setMap, on, unbindAll } = useMap({
  layers: { click: ["district-fill"] },
  mapLifecycle: "owned",
});

on("loaded", ({ map }) => {
  upsertGeoJSONSource(map, { id: "district-source", data: geojson });
  ensureLayers(map, [{ id: "district-fill", type: "fill", source: "district-source" }]);
});

on("click:layer", ({ features }) => {
  console.log(features);
});

const map = new minemap.Map({ container: "map", style: styleUrl });
setMap(map);
```

`mapRef` 是 `shallowRef`，通过 `.value` 读取。`setMap` 允许替换地图实例并自动解绑旧实例。`mapLifecycle` 默认是 `"external"`；只有设为 `"owned"` 才会在组件卸载时销毁地图。

## 组件 Popup

```ts
const handle = createPopupDom(PopupComponent, { title: "详情" });

new minemap.Popup().setLngLat([116.4, 39.9]).setDOMContent(handle.element).addTo(map);

handle.dispose();
```

`dispose()` 会卸载 Vue app。组件可以使用渲染函数；核心包本身不引入 Vue。
