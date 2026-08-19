# useMap（框架 Hook）

来源：`packages/map-tools/src/vue/useMap.ts`（vue2/vue3 共用，基于 vue-demi）与 `src/react/useMap.ts`

提供地图事件绑定与图层要素查询的框架封装，`vue2` / `vue3` / `react` 三个子路径均导出 `useMap`。

## 参数（MapHookOption）

```ts
function useMap(option: MapHookOption): UseMapReturn

type MapHookOption = {
  map?: minemap.Map;          // 调用时已有实例可直接传入
  bindClickLayers?: string[];    // 点击事件监听的图层 id
  bindMouseMoveLayers?: string[]; // 鼠标移动事件监听的图层 id
  bindZoomLayers?: string[];     // 缩放事件监听的图层 id
  zoomQueryBy?: "map" | "mouse"; // 缩放后图层查询基准点，默认 "mouse"
  destroyOnUnmount?: boolean;    // 仅 React 版：卸载时是否销毁地图实例，默认 false（只解绑不销毁）
};
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| map | `minemap.Map` | `undefined` | 若调用时已存在实例可直接传入；否则通过返回的 `mapInitialize` 注入 |
| bindClickLayers | `string[]` | `[]` | 绑定地图点击事件监听的图层 |
| bindMouseMoveLayers | `string[]` | `[]` | 绑定鼠标移动事件监听的图层 |
| bindZoomLayers | `string[]` | `[]` | 绑定缩放事件监听的图层 |
| zoomQueryBy | `"map" \| "mouse"` | `"mouse"` | 缩放事件以哪个坐标查询图层（`"map"` 用地图中心，可能有偏移，慎重使用） |
| destroyOnUnmount | `boolean` | `false` | 仅 React 版：卸载时是否销毁地图实例。默认 `false` 只解绑不销毁（与 vue 版一致），传入外部管理生命周期的地图实例时保持默认值 |

## 返回值

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| mapInstance | vue: `Ref<minemap.Map>`；react: `MutableRefObject<minemap.Map>` | 地图实例引用（vue `.value` / react `.current` 访问） |
| mapInitialize | `(map: minemap.Map) => void` | 注入地图实例并自动绑定事件；已通过 `option.map` 提供实例时执行被忽略 |
| onMapLoaded | `(fn: (map: minemap.Map) => void) => void` | 地图就绪回调注册 |
| onClickLayerEventDispatcher | `(fn: (data: EventDispatcherData) => void) => void` | 点击到绑定图层的事件分发 |
| onClickNoInLayers | `(fn: (e: any) => void) => void` | 点击到非绑定图层区域的事件 |
| onMouseMoveLayerEventDispatcher | `(fn: (data: EventDispatcherData) => void) => void` | 鼠标移动到绑定图层的事件分发 |
| onMoveNoInLayers | `(fn: (e: any) => void) => void` | 鼠标移动到非绑定图层区域的事件 |
| onZoomLayerEventDispatcher | `(fn: (data: ZoomLayerEventData) => void) => void` | 缩放后命中绑定图层的事件分发 |
| onZoomNoInLayers | `(fn: (e: any) => void) => void` | 缩放后鼠标位置无绑定图层的事件 |
| unBindMapEvent | `() => void` | 手动解绑全部事件 |

### 事件数据形状

```ts
type EventDispatcherData = {
  layerId: string;
  feature: Feature | FeatureCollection;
  mapEvent: any;
};

type ZoomLayerEventData = {
  zoom: number;
  mouseCoordinate: number[];    // 缩放时鼠标坐标
  mapCenterCoordinate: number[]; // 缩放时地图中心坐标
} & EventDispatcherData;
```

## 生命周期

- **未传 `option.map`**：调用 `mapInitialize(map)` 注入实例 → 触发 `onMapLoaded(map)` 回调 → 自动 `map.on("click" / "mousemove" / "zoomend", ...)` 绑定。
- **已传 `option.map`**：创建时直接绑定事件。
- **组件卸载时**：自动 `unBindMapEvent()`。
  - vue 版：始终只解绑、**不销毁**地图。
  - react 版：默认与 vue 版一致（只解绑不销毁）；仅当 `destroyOnUnmount: true` 时才调用 `destroyMap(map)`。
    > 默认不销毁是刻意设计：外部传入的地图实例其生命周期由外部管理，React StrictMode 开发模式下 effect 会双挂载（cleanup → 再 setup），无条件销毁会把外部地图一并移除。需要由组件托管地图生命周期时再显式开启 `destroyOnUnmount: true`。

## Vue 3 示例

```ts
import { h, defineComponent, ref } from "vue";
import { useMap } from "@ym/map-tools/vue3";

export default defineComponent({
  setup() {
    const {
      mapInstance, // Ref<minemap.Map>
      mapInitialize,
      onMapLoaded,
      onClickLayerEventDispatcher,
      onClickNoInLayers,
      unBindMapEvent,
    } = useMap({
      bindClickLayers: ["demo-district-layer"],
      bindMouseMoveLayers: ["demo-district-layer"],
      bindZoomLayers: ["demo-district-layer"],
      zoomQueryBy: "mouse",
    });

    onMapLoaded((map) => {
      console.log("地图就绪", map.getZoom());
    });

    onClickLayerEventDispatcher((data) => {
      console.log("点击图层", data.layerId, data.feature);
    });
    onClickNoInLayers((e) => {
      console.log("点击空白", e.lngLat);
    });

    // 初始化地图后注入
    const map = new minemap.Map({ /* ... */ });
    map.on("load", () => mapInitialize(map));

    return () => h("div", { ref: mapContainer });
  },
});
```

## React 示例

```tsx
import { useEffect, useRef } from "react";
import { useMap } from "@ym/map-tools/react";

export function MapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    mapInstance, // MutableRefObject<minemap.Map>
    mapInitialize,
    onClickLayerEventDispatcher,
  } = useMap({ bindClickLayers: ["demo-district-layer"] });

  useEffect(() => {
    const map = new minemap.Map({ container: containerRef.current!, /* ... */ });
    map.on("load", () => mapInitialize(map));
    // 卸载时 useMap 自动解绑事件；默认不销毁地图
  }, []);

  onClickLayerEventDispatcher((data) => {
    console.log("点击图层", data.layerId);
  });

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
```

## 注意事项

- **vue 与 react 版 mapInstance 访问方式不同**：vue 用 `.value`，react 用 `.current`。
- 事件分发仅在绑定图层列表中命中时触发 `*LayerEventDispatcher`，否则触发对应的 `*NoInLayers`。
- HTML（UMD）场景无 `useMap`，需使用 minemap 原生事件自行实现（参见示例中心「useMap 事件监听」HTML 变体）。
- **React StrictMode**：开发模式下 effect 会双挂载，卸载清理只解绑事件（默认不销毁地图），不会破坏外部传入的地图实例；如确需组件卸载时销毁地图，请显式传 `destroyOnUnmount: true`。
