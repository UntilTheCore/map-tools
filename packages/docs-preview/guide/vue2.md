# Vue 2.7

```bash
pnpm add @ym/map-tools vue@2.7
```

Vue 2.7 与 Vue 3 共用同一套组合式 API（`useMap`），弹窗挂载按版本适配（Vue 2.7 用 `new Vue`、Vue 3 用 `createApp`），从不同子路径导入以表达项目版本：

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

同一构建环境同时存在 Vue 2 与 Vue 3 时，Vue 2 打包配置需将 `vue` alias 到 Vue 2.7 运行时（如本仓库 `vite.demos.vue2.config.ts`，用绝对路径指向 `npm:vue@2.7.16`）。
