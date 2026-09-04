# 控件 — NavigationControl / ScaleControl / FullscreenControl

控件通过 `map.addControl(control, position?)` 添加，`position` 为 `'top-left'`/`'top-right'`/`'bottom-left'`/`'bottom-right'`。

```js
map.addControl(new minemap.NavigationControl(), "top-left");
```

## NavigationControl 导航控件

含缩放按钮 + 指南针。

```ts
new NavigationControl(options: Object?)
```

构造 options：

| 属性             | 说明                          |
| ---------------- | ----------------------------- |
| `showCompass`    | 是否显示指南针（默认 true）   |
| `showZoom`       | 是否显示缩放按钮（默认 true） |
| `visualizePitch` | 是否在指南针中可视化俯仰角    |

```js
map.addControl(
  new minemap.NavigationControl({
    showCompass: true,
    showZoom: true,
  }),
  "top-right",
);
```

## ScaleControl 比例尺控件

指示图上距离与实际距离的比例。

```ts
new ScaleControl(options: Object?)
```

构造 options：

| 属性       | 说明                                         |
| ---------- | -------------------------------------------- |
| `maxWidth` | 比例尺最大宽度（像素）                       |
| `unit`     | 单位：`'imperial'`\|`'metric'`\|`'nautical'` |

实例方法：

| 成员            | 作用                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| `setUnit(unit)` | 设置单位：`'imperial'`（英里）\|`'metric'`（公里）\|`'nautical'`（海里） |

```js
var scale = new minemap.ScaleControl({ maxWidth: 80, unit: "metric" });
map.addControl(scale, "bottom-left");
scale.setUnit("imperial");
```

## FullscreenControl 全屏控件

切换地图进入和退出全屏模式的按钮。

```ts
new FullscreenControl(options: Object?)
```

构造 options：

| 属性        | 说明                             |
| ----------- | -------------------------------- |
| `container` | 指定全屏容器（默认地图所在容器） |

```js
map.addControl(new minemap.FullscreenControl(), "top-right");
```

## Map#addOverviewMap 鹰眼图（MineMap 扩展）

`map.addOverviewMap()` 为地图添加一个概览（鹰眼）小窗口，`map.removeOverviewMap()` 移除。

```js
map.addOverviewMap();
// map.removeOverviewMap();
```

## 注意事项

- 大多数控件实现 `IControl` 接口，通过 `addControl` 统一装载。
- 控件的 UI 样式依赖 `minemap.css`，必须已引入（见 SKILL.md 接入步骤）。
