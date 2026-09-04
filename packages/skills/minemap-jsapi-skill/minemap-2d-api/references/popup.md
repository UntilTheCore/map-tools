# Popup — 信息弹窗

`minemap.Popup` 在地图上显示信息窗体，继承自 `Evented`。通常与 Marker 绑定，或直接定位到某个坐标。

```ts
new Popup(options: Object?)
```

## 构造 options 常用项

| 属性           | 类型      | 默认值     | 说明                                                         |
| -------------- | --------- | ---------- | ------------------------------------------------------------ |
| `offset`       | PointLike | `[0,0]`    | 弹窗相对锚点的偏移                                           |
| `closeButton`  | boolean   | `true`     | 是否显示右上角关闭按钮                                       |
| `closeOnClick` | boolean   | `true`     | 点击地图时是否关闭                                           |
| `anchor`       | string    | `'bottom'` | 弹窗相对锚点的方位：`'top'`/`'bottom'`/`'left'`/`'right'` 等 |
| `maxWidth`     | string    | --         | 最大宽度 CSS                                                 |
| `className`    | string    | --         | 追加到弹窗容器的 class                                       |

## 成员速查

| 成员                                                                                    | 作用                                              |
| --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `addTo(map)`                                                                            | 显示到地图                                        |
| `remove()`                                                                              | 关闭并从地图移除                                  |
| `isOpen()`                                                                              | 是否打开                                          |
| `getLngLat()` / `setLngLat(lnglat)`                                                     | 获取/设置弹窗锚点坐标 `[经度, 纬度]`              |
| `trackPointer()`                                                                        | 弹窗跟随鼠标指针移动                              |
| `getElement()`                                                                          | 弹窗 DOM 元素                                     |
| `setText(text)`                                                                         | 设置纯文本内容                                    |
| `setHTML(html)`                                                                         | 设置 HTML 内容                                    |
| `setDOMContent(htmlNode)`                                                               | 用 DOM 节点作为内容                               |
| `getMaxWidth()` / `setMaxWidth(maxWidth)`                                               | 最大宽度                                          |
| `addClassName(className)` / `removeClassName(className)` / `toggleClassName(className)` | 样式类控制                                        |
| `getMap()`                                                                              | 所在地图或 null                                   |
| `open` / `close`                                                                        | 事件（`on('open', ...)`/`on('close', ...)` 监听） |

## 示例

```js
// 定位到坐标并显示 HTML
new minemap.Popup().setLngLat([116.46, 39.92]).setHTML("<h1>北京</h1><p>这里是内容</p>").addTo(map);

// 纯文本
new minemap.Popup({ offset: [0, -30] }).setLngLat([116.46, 39.92]).setText("一段文字").addTo(map);

// 自定义 DOM 节点
var div = document.createElement("div");
div.innerHTML = "<b>自定义节点</b>";
new minemap.Popup().setLngLat([116.46, 39.92]).setDOMContent(div).addTo(map);
```

## 与 Marker 绑定点击弹出

```js
var popup = new minemap.Popup().setHTML("<b>标记详情</b>");

new minemap.Marker().setLngLat([116.46, 39.92]).setPopup(popup).addTo(map);

// 点击 marker 自动切换 popup；再调 togglePopup 手动控制
marker.togglePopup();
```

## 注意事项

- `setText`/`setHTML`/`setDOMContent` 三选一，后调用的覆盖前一个。
- `setLngLat` 用 `[经度, 纬度]`。
- `trackPointer()` 让弹窗跟随鼠标，适合 tooltip 场景。
