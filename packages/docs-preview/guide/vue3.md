# 接入方式 · Vue 3

Vue 3 项目通过 `@ym/map-tools/vue3` 子路径获得框架适配：`useMap`（组合式 Hook）与 `getPopupDom`（渲染函数组件挂载）。

## 安装

```bash
pnpm add @ym/map-tools vue
```

> 注意：`@ym/map-tools/vue3` 基于 vue-demi，需保证项目只存在一个 `vue` 实例；Vue 版本要求 ^3.x。

## 导入

```ts
// 框架适配（Hook + 组件挂载弹窗）
import { useMap, getPopupDom } from "@ym/map-tools/vue3";
// 核心 API（任意子路径下均可同时使用）
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
```

## useMap 用法

```ts
import { h, defineComponent, ref, onMounted } from "vue";
import { useMap } from "@ym/map-tools/vue3";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";

export default defineComponent({
  setup() {
    const mapContainer = ref<HTMLElement>();
    const sourceId = setSourceIdName("demo", "district");
    const layerId = setLayerIdName("demo", "district");

    const {
      mapInstance,   // Ref<minemap.Map>，通过 .value 访问
      mapInitialize, // 未在 option.map 提供实例时，用该方法注入地图实例
      onMapLoaded,
      onClickLayerEventDispatcher,
      onClickNoInLayers,
      onMouseMoveLayerEventDispatcher,
      onMoveNoInLayers,
      onZoomLayerEventDispatcher,
      onZoomNoInLayers,
      unBindMapEvent,
    } = useMap({
      // map: mapInstance.value, // 若初始化时机更早，可直接传入
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
      console.log("点击图层", data.layerId, (data.feature as any)?.properties);
    });
    onClickNoInLayers((e) => {
      console.log("点击空白", e.lngLat);
    });

    onMounted(() => {
      const map = new minemap.Map({ container: mapContainer.value, /* ... */ });
      map.on("load", () => mapInitialize(map)); // 注入实例，自动绑定事件
    });

    // 组件卸载时 useMap 自动 unBindMapEvent + destroyMap

    return { mapContainer };
  },
});
```

## getPopupDom 用法（渲染函数组件挂载）

```ts
import { createApp, h } from "vue";
import { getPopupDom } from "@ym/map-tools/vue3";

// 渲染函数组件（Vue 3）
const PopupContent = {
  props: { title: String },
  render() {
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

`getPopupDom(component, props?)` 返回一个已挂载 Vue 组件的 DOM 容器，直接交给 `minemap.Popup.setDOMContent` 即可。

## 说明

- `useMap` 返回的 `mapInstance` 是 Vue 的 `Ref`，通过 `.value` 访问（与 React 版 `.current` 不同）。
- 未通过 `option.map` 提供实例时，必须在 `mapInitialize(map)` 注入后事件分发才会生效。
- 组件卸载时自动解绑全部事件并销毁地图，无需手动清理。

更多完整示例见 [示例中心](/examples-center/)（Vue 3 变体）。
