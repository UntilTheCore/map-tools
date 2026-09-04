# 事件与交互 Handler

## Evented 事件绑定（on / off / once）

`minemap.Evented` 是所有事件系统（Map/Marker/Popup/GeoJSONSource 等）的基类。

```ts
on(type: string, layerId: string, listener: Function): Map
once(type: string, layerId: string, listener: Function): Map
off(type: string, layerId: string, listener: Function): Map
```

`layerId` 为**可选参数**：

- `map.on(type, listener)` — 监听地图级事件
- `map.on(type, layerId, listener)` — 仅当 `layerId` 指定的图层有可见要素参与交互时触发（如 `click`/`mouseenter`）

```js
// 地图级监听
map.on('load', function() { ... });
map.once('load', function() { ... });   // 一次性

// 图层级过滤：仅在点击到 'my-layer' 的要素时触发
map.on('click', 'my-layer', function(e) {
  console.log(e.features[0].properties);
});
```

`eventdata` 参数：有的方法（如 `fire`）可传额外事件属性。

## Map 事件清单

事件名（触发条件概述）：

| 事件                                                     | 触发时机                               |
| -------------------------------------------------------- | -------------------------------------- |
| `load`                                                   | 地图加载完成，可安全增删图层/源        |
| `render`                                                 | 每一帧渲染                             |
| `idle`                                                   | 地图无动画/交互，空闲时                |
| `error`                                                  | 发生错误                               |
| `mousedown` / `mouseup` / `click` / `dblclick`           | 鼠标按下/松开/点击/双击                |
| `mouseover` / `mouseout`                                 | 鼠标悬停进入/离开                      |
| `mouseenter` / `mouseleave`                              | 鼠标进入/离开图层（支持 layerId 过滤） |
| `mousemove`                                              | 鼠标移动                               |
| `contextmenu`                                            | 右键菜单                               |
| `wheel`                                                  | 滚轮                                   |
| `touchstart` / `touchend` / `touchmove` / `touchcancel`  | 触摸开始/结束/移动/取消                |
| `movestart` / `move` / `moveend`                         | 开始移动 / 移动中 / 结束移动           |
| `dragstart` / `drag` / `dragend`                         | 拖拽相关                               |
| `zoomstart` / `zoom` / `zoomend`                         | 开始缩放 / 缩放中 / 结束缩放           |
| `rotatestart` / `rotate` / `rotateend`                   | 开始旋转 / 旋转中 / 结束旋转           |
| `pitchstart` / `pitch` / `pitchend`                      | 开始俯仰 / 俯仰中 / 结束俯仰           |
| `boxzoomstart` / `boxzoomend` / `boxzoomcancel`          | 框选缩放开始/结束/取消                 |
| `webglcontextlost` / `webglcontextrestored`              | WebGL 上下文丢失/恢复                  |
| `data` / `styledata` / `sourcedata`                      | 数据加载回调                           |
| `dataloading` / `styledataloading` / `sourcedataloading` | 数据开始加载                           |
| `styleimagemissing`                                      | 需要的图片缺失                         |
| `style.load`                                             | 样式加载完成                           |

常用组合示例：

```js
map.on("load", function () {
  /* 加图层/源 */
});
map.on("click", function (e) {
  var coord = e.lngLat; // {lng, lat}
  var px = e.point; // 像素点
});
map.on("mousemove", "my-layer", function (e) {
  map.getCanvas().style.cursor = "pointer";
});
map.on("moveend", function () {
  console.log(map.getCenter());
});
```

## 事件对象字段

### MapMouseEvent

| 属性               | 说明                                                           |
| ------------------ | -------------------------------------------------------------- |
| `type`             | 事件类型                                                       |
| `target`           | 触发事件的地图对象                                             |
| `originalEvent`    | 原始 DOM `MouseEvent`                                          |
| `point`            | 像素坐标 `{x, y}`                                              |
| `lngLat`           | 经纬度 `{lng, lat}`                                            |
| `features`         | 图层级事件时，命中的要素数组（如在 `on('click', layerId)` 中） |
| `preventDefault()` | 阻止默认行为                                                   |

```js
map.on("click", function (e) {
  console.log(e.lngLat.lng, e.lngLat.lat, e.point.x, e.point.y);
});
```

### MapTouchEvent

`type`、`target`、`originalEvent`、`lngLat`、`point`、`points`（多点像素）、`lngLats`（多点经纬度）、`preventDefault()`。

```js
map.on("touchstart", function (e) {
  console.log(e.lngLat, e.lngLats);
});
```

### MapWheelEvent

`type`、`target`、`originalEvent`、`preventDefault()`。

### MapDataEvent / MapZoomEvent

- `MapDataEvent`：同 `data`/`dataloading` 事件，`dataType` 表示数据类型（`'source'`/`'style'`/`'tile'`），`sourceId`、`tile` 等。
- `MapZoomEvent`：`BoxZoomHandler` 发出的框选缩放事件类型，含 `boxZoom` 相关字段。

## 交互 Handler（enable / disable / isEnabled）

`Map` 上的交互功能都由对应的 Handler 类实现，可通过 `map.<handler>.enable()/disable()/isEnabled()` 控制。

| Handler                  | 功能                     | 实例成员                                            |
| ------------------------ | ------------------------ | --------------------------------------------------- |
| `BoxZoomHandler`         | Shift 拖拽框选缩放       | `enable/disable/isEnabled/isActive`                 |
| `ScrollZoomHandler`      | 滚轮缩放                 | `enable/disable/isEnabled/isActive`                 |
| `DragPanHandler`         | 左键/触摸拖拽平移        | `enable/disable/isEnabled/isActive`                 |
| `DragRotateHandler`      | 右键/Ctrl+左键拖拽旋转   | `enable/disable/isEnabled/isActive`                 |
| `KeyboardHandler`        | 键盘快捷键缩放/旋转/平移 | `enable/disable/isEnabled/isActive`                 |
| `DoubleClickZoomHandler` | 双击缩放                 | `enable/disable/isEnabled/isActive`                 |
| `TouchZoomRotateHandler` | 触摸捏合缩放旋转         | `enable/disable/isEnabled/isActive/disableRotation` |
| `TouchPitchHandler`      | 双指改变俯仰             | `enable/disable/isEnabled/isActive`                 |

```js
map.scrollZoom.disable();      // 关闭滚轮缩放
map.dragPan.enable();          // 开启拖拽平移
if (map.keyboard.isEnabled()) { ... }
```
