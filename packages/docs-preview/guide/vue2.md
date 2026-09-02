# Vue 2.7

```bash
pnpm add @ym/map-tools vue@2.7
```

Vue 2.7 与 Vue 3 使用同一套 vue-demi 实现，但从不同子路径导入以表达项目版本：

```ts
import { createPopupDom, useMap } from "@ym/map-tools/vue2";
```

API 与 [Vue 3 接入](/guide/vue3) 相同：`useMap` 返回 `mapRef`、`setMap`、`on`、`off`、`unbindAll`，其中 `mapRef.value` 保存当前地图实例。

```ts
const { setMap, on } = useMap({
  layers: { click: ["district-fill"] },
});

on("click:layer", ({ features }) => {
  console.log(features);
});

setMap(map);
```

框架版 Popup 返回 `PopupDomHandle`：

```ts
const handle = createPopupDom(PopupContent, { name: "北京" });
popup.setDOMContent(handle.element);
handle.dispose();
```

同一构建环境同时存在 Vue 2 与 Vue 3 时，Vue 2 打包配置仍需将 `vue` 和 `vue-demi` alias 到 v2.7 实现。
