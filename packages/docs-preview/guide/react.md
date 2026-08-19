# 接入方式 · React

React 项目通过 `@ym/map-tools/react` 子路径获得框架适配：`useMap`（Hook）与 `getPopupDom`（React 元素挂载）。

## 安装

```bash
pnpm add @ym/map-tools react react-dom
```

## 导入

```ts
// 框架适配（Hook + React 元素弹窗）
import { useMap, getPopupDom } from "@ym/map-tools/react";
// 核心 API
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";
```

## useMap 用法

```tsx
import { useEffect, useRef } from "react";
import { useMap } from "@ym/map-tools/react";
import { setSourceData, setSourceIdName, setLayerIdName } from "@ym/map-tools";

const sourceId = setSourceIdName("demo", "district");
const layerId = setLayerIdName("demo", "district");

export function MapPanel() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    mapInstance,   // MutableRefObject<minemap.Map>，通过 .current 访问
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
    // map: ..., // 若初始化时机更早，可直接传入实例
    bindClickLayers: [layerId],
    bindMouseMoveLayers: [layerId],
    bindZoomLayers: [layerId],
    zoomQueryBy: "mouse",
  });

  useEffect(() => {
    const map = new minemap.Map({
      container: containerRef.current!,
      style: "https://service.minedata.cn/map/solu/style/11003",
      center: [116.4026, 39.9494],
      zoom: 10,
    });
    map.on("load", () => mapInitialize(map)); // 注入实例，自动绑定事件
    // 组件卸载时 useMap 自动 unBindMapEvent + destroyMap
  }, []);

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

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
```

## getPopupDom 用法（React 元素挂载）

```tsx
import { getPopupDom } from "@ym/map-tools/react";

function PopupContent({ title, lngLat }: { title: string; lngLat: any }) {
  return (
    <div style={{ padding: "8px 12px", fontSize: 12 }}>
      <strong>{title}</strong>
      <div>经度: {lngLat?.lng}  纬度: {lngLat?.lat}</div>
    </div>
  );
}

map.on("click", (e: any) => {
  const dom = getPopupDom(<PopupContent title="弹窗标题" lngLat={e.lngLat} />);
  new minemap.Popup()
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .setDOMContent(dom)
    .addTo(map);
});
```

`getPopupDom(element, opts?)` 内部使用 `createRoot` 将 React 元素挂载到独立容器，返回容器 DOM。

## 说明

- **mapInstance 是 `MutableRefObject`**：与 Vue 版不同，通过 `.current` 访问（如 `mapInstance.current?.getZoom()`）。
- 组件卸载时自动解绑全部事件并销毁地图，无需手动清理。
- `.tsx` 由构建工具（Vite esbuild / babel）原生处理（JSX automatic runtime），示例中心构建无需 `@vitejs/plugin-react`。

更多完整示例见 [示例中心](/examples-center/)（React 变体）。
