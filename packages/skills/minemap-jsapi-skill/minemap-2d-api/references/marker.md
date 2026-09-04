# Marker — 地图标记

`minemap.Marker` 创建地图标记。支持三种创建方式：

1. **传两个参数**：自建 `element` + 对象参数 `legacyOptions`，配合 `setLngLat` 定位（支持带标题的自定义 marker）
2. **传一个 options 对象**：`new Marker(options)`
3. **无参**：返回默认 marker，用 `.setLngLat(latlng).addTo(map)`

```ts
new Marker(options: (HTMLElement | Object), legacyOptions: Object?)
```

## 构造 options 常用项

| 属性                | 说明                                               |
| ------------------- | -------------------------------------------------- |
| `element`           | 自定义 HTML 元素（HTMLElement，方式一）            |
| `offset`            | 偏移量 PointLike，默认 `[0,0]`（图标锚点相对位置） |
| `draggable`         | 是否可拖拽                                         |
| `rotation`          | 旋转角（度）                                       |
| `rotationAlignment` | 随地图旋转对齐：`'map'` \| `'viewport'`            |
| `pitchAlignment`    | 随地图俯仰对齐：`'map'` \| `'viewport'`            |
| `anchor`            | 锚点位置，如 `'center'`/`'bottom'` 等              |
| `extData`           | 自定义扩展数据                                     |

构造 options 的具体字段名以库实际为准（文档中未给出完整固定表），核心是 `element`、`offset`、`draggable`、`extData` 等。

## 成员速查

| 成员                                                                                                       | 作用                                            |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `addTo(map)`                                                                                               | 添加到地图                                      |
| `remove()`                                                                                                 | 从地图移除                                      |
| `getLngLat()` / `setLngLat(lnglat)`                                                                        | 获取/设置坐标（`[经度, 纬度]`）                 |
| `getElement()`                                                                                             | 获取 marker 的 DOM 元素                         |
| `setPopup(popup)` / `getPopup()` / `togglePopup()`                                                         | 绑定/获取/切换 Popup                            |
| `getOffset()` / `setOffset(offset)`                                                                        | 偏移                                            |
| `setDraggable(true/false)` / `isDraggable()` / `getDraggable()` / `enableDragging()` / `disableDragging()` | 拖拽                                            |
| `setRotation(rotation)` / `getRotation()`                                                                  | 旋转角                                          |
| `setRotationAlignment(alignment)` / `getRotationAlignment()`                                               | 旋转对齐：`'map'` \| `'viewport'`               |
| `setPitchAlignment(alignment)` / `getPitchAlignment()`                                                     | 俯仰对齐                                        |
| `setExtData(el)` / `getExtData()`                                                                          | 扩展数据（存任意 HTMLElement/对象）             |
| `setZIndex(zIndex)`                                                                                        | 层级                                            |
| `getMap()`                                                                                                 | 所在的地图或 null                               |
| `setTitle(title)` / `getTitle()`                                                                           | 标题（MineMap 扩展）                            |
| `setTitleFontSize(fontSize)`                                                                               | 标题字号（扩展）                                |
| `setTitleColor(color)`                                                                                     | 标题颜色（扩展）                                |
| `setTitlePosition(offset)`                                                                                 | 标题位置偏移（扩展）                            |
| `setAnimation(type)`                                                                                       | 动画：如 `'drop'` 落点、`'bounce'` 弹跳（扩展） |
| `dragstart` / `drag` / `dragend`                                                                           | 拖拽事件（`on('dragstart', ...)` 监听）         |

## 三种创建方式示例

```js
// 1. 自建 element + legacyOptions
var el = document.createElement("div");
el.className = "my-marker";
var marker = new minemap.Marker(el, { offset: [-12, -12] }).setLngLat([116.46, 39.92]).addTo(map);

// 2. options 对象
var marker = new minemap.Marker({ color: "red", draggable: true })
  .setLngLat([116.46, 39.92])
  .addTo(map);

// 3. 无参默认 marker
var marker = new minemap.Marker().setLngLat([116.46, 39.92]).addTo(map);
```

## 带标题 + 弹窗 + 动画（MineMap 扩展）

```js
var marker = new minemap.Marker()
  .setLngLat([116.46, 39.92])
  .setTitle("我的标记")
  .setTitleColor("#ff0000")
  .setTitleFontSize(14)
  .setTitlePosition([0, -30])
  .setAnimation("drop")
  .setPopup(new minemap.Popup().setHTML("<b>标题</b><br>内容"))
  .addTo(map);
```

拖拽 marker：

```js
var marker = new minemap.Marker({ draggable: true }).setLngLat([116.46, 39.92]).addTo(map);
marker.on("dragend", function () {
  console.log("新坐标:", marker.getLngLat());
});
```

## 注意事项

- 坐标统一 `[经度, 纬度]`。
- `setExtData` 参数文档标注为 `HTMLElement`，实际可用于挂载任意自定义数据。
- marker 与 popup 配合时，先用 `marker.setPopup(popup)` 绑定，点击 marker 自动弹出。
