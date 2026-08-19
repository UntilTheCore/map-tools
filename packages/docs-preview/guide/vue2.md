# 接入方式 · Vue 2

Vue 2.7 项目通过 `@ym/map-tools/vue2` 子路径获得框架适配：`useMap` 与 `getPopupDom`（渲染函数组件挂载）。

## 安装

```bash
pnpm add @ym/map-tools vue@2.7.16
```

> 注意：
> - `@ym/map-tools/vue2` 基于 vue-demi，Vue 版本要求 **2.7.x**（vue-demi 按 v2.7 模式工作）。
> - 若同时存在 Vue 2 / Vue 3 双版本（如本文档站示例构建），需要通过构建工具 alias 强制解析（见下文）。

## 导入

```ts
// 框架适配（Vue 2.7 渲染函数）
import { useMap, getPopupDom } from "@ym/map-tools/vue2";
// 核心 API
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
```

## useMap 用法

Vue 2.7 支持组合式 API，用法与 Vue 3 一致：

```ts
import Vue from "vue";
import { h } from "vue"; // vue 2.7 全局暴露 h 渲染函数
import { useMap } from "@ym/map-tools/vue2";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";

const sourceId = setSourceIdName("demo", "district");
const layerId = setLayerIdName("demo", "district");

const App = {
  setup() {
    const {
      mapInstance,   // Ref<minemap.Map>，通过 .value 访问
      mapInitialize,
      onMapLoaded,
      onClickLayerEventDispatcher,
      onClickNoInLayers,
      onMouseMoveLayerEventDispatcher,
      onMoveNoInLayers,
      onZoomLayerEventDispatcher,
      onZoomNoInLayers,
      unBindMapEvent,
    } = useMap({
      bindClickLayers: [layerId],
      bindMouseMoveLayers: [layerId],
      bindZoomLayers: [layerId],
      zoomQueryBy: "mouse",
    });

    onMapLoaded((map) => {
      setSourceData(map, sourceId, {
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: { "fill-color": "#4de08b", "fill-opacity": 0.35 },
      }, geojson);
    });

    onClickLayerEventDispatcher((data) => {
      console.log("点击图层", data.layerId);
    });

    // 地图初始化完成后注入实例
    map.on("load", () => mapInitialize(map));

    // 组件销毁时 useMap 自动 unBindMapEvent + destroyMap

    return () => h("div", { style: { display: "none" } });
  },
};

new Vue({ render: (h) => h(App) }).$mount("#app");
```

## getPopupDom 用法

```ts
import Vue from "vue";
import { getPopupDom } from "@ym/map-tools/vue2";

// Vue 2 渲染函数组件（render 函数）
const PopupContent = {
  props: { title: { type: String, default: "" } },
  render(h) {
    return h("div", { style: { padding: "8px 12px" } }, [h("strong", null, this.title)]);
  },
};

map.on("click", (e: any) => {
  const dom = getPopupDom(PopupContent, { title: "弹窗标题" });
  new minemap.Popup()
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .setDOMContent(dom)
    .addTo(map);
});
```

## vue-demi 双版本共存（构建 alias）

当同一构建环境同时存在 Vue 2 / Vue 3（如本文档站示例中心），需在 vue2 专用构建配置中强制解析：

```ts
// vite.demos.vue2.config.ts（示例中心 vue2 变体构建配置）
export default defineConfig({
  resolve: {
    alias: {
      vue: "vue2",                          // npm 别名包（"vue2": "npm:vue@2.7.16"）
      "vue-demi": "vue-demi/lib/v2.7/index.mjs", // 强制 vue-demi v2.7 实现
    },
  },
  // ...
});
```

## 说明

- `useMap` 返回的 `mapInstance` 同样是 `Ref`，通过 `.value` 访问。
- vue2 变体禁止使用 `.vue` SFC 时，可用 `new Vue({ render: h => ... })` 或 vue2.7 内置的 `h` 渲染函数编写组件。

更多完整示例见 [示例中心](/examples-center/)（Vue 2.7 变体）。
