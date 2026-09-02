# Overlays

```ts
const removed = removeOverlays([marker, popup]);
```

`removeOverlays` 接受单个或数组形式的 `{ remove(): void }` 覆盖物，统一处理 `minemap.Marker` 和 `minemap.Popup`，返回实际调用 `remove` 的数量。

旧的 `removeMarkers` 与 `removeMarkersOrPopups` 已删除。
