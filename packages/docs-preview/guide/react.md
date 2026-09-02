# React

```bash
pnpm add @ym/map-tools react react-dom
```

```tsx
import { useEffect, useRef } from "react";
import { createPopupDom, useMap } from "@ym/map-tools/react";
import { ensureLayers, upsertGeoJSONSource } from "@ym/map-tools";

export function MapPanel() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { mapRef, setMap, on } = useMap({
    layers: { click: ["district-fill"] },
    mapLifecycle: "owned",
  });

  useEffect(() => {
    const unsubscribe = on("loaded", ({ map }) => {
      upsertGeoJSONSource(map, { id: "district-source", data: geojson });
      ensureLayers(map, [{ id: "district-fill", type: "fill", source: "district-source" }]);
    });
    const map = new minemap.Map({ container: hostRef.current!, style: styleUrl });
    setMap(map);
    return unsubscribe;
  }, [on, setMap]);

  return <div ref={hostRef} />;
}
```

`mapRef` 是 `MutableRefObject<MapLike | null>`，通过 `.current` 读取。`setMap` 可重复调用；默认不会销毁外部地图，设 `mapLifecycle: "owned"` 时卸载才会调用 `map.remove()`。

## React Popup

```tsx
const handle = createPopupDom(<PopupContent title="详情" />);
popup.setDOMContent(handle.element);
handle.dispose();
```

句柄释放时会调用对应的 React `root.unmount()`。
