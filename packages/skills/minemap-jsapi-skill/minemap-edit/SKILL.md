---
name: minemap-edit
description: MineMap JS API 地图编辑/标绘插件 minemap.edit（minemap-edit.js）开发技能。涵盖编辑器初始化与销毁、编辑模式切换 onBtnCtrlActive（画点/线/面/圆/矩形/三角形/扇形/箭头/草图等 30+ 种模式）、draw 数据池增删改查、样式自定义（setCustomStyle/setFeaturePropertiesByIds）、吸附与锁定、历史记录与 undo/redo、编辑事件监听。Use whenever the user works with minemap.edit、地图编辑器、地图标绘、画点画线画面、编辑 GeoJSON feature、draw.add、setFeatures、setCustomStyle、吸附或二次编辑——即使没有明确提到 "edit"。
---

# minemap.edit（地图编辑/标绘插件）开发技能

检查 `index.html` 的 `head` 中是否已经添加 `<script src="https://gmap.cqphx.cn:4443/minemapapi/minemap-plugins/edit/minemap-edit.js"></script>` ,没有则添加，以此获得使用 `minemap.edit` 的能力。

minemap-edit.js 是 MineMap 地图编辑/标绘插件（v2.1.0，兼容 `minemap for 2d` 和 `minemap for 3d`），挂载在全局命名空间 `minemap.edit` 下，提供图形绘制、编辑（选中/移动/改形状点）、样式自定义、线面吸附、历史记录（undo/redo）等能力。

## 初始化与生命周期

**注意：`edit` 初始化必须在 `map load` 事件的回调中进行。**

```ts
new minemap.edit.init(map: Map, options?: Object, controlPosition?: String);
```

| 参数            | 说明               | 类型   | 可选值                                                 | 默认值      |
| --------------- | ------------------ | ------ | ------------------------------------------------------ | ----------- |
| map             | 地图实例，必输项   | Object | --                                                     | --          |
| options         | 编辑参数对象       | Object | 见下节                                                 | --          |
| controlPosition | 控件位置，非必输项 | String | 'top-left'、'top-right'、'bottom-left'、'bottom-right' | 'top-right' |

```js
var edit = new minemap.edit.init(map, {
  boxSelect: true,
  touchEnabled: false,
  displayControlsDefault: true,
  showButtons: false,
});

edit = edit.setOptions(options); // 更换编辑参数对象
edit.dispose(); // 销毁地图编辑器
```

## Options 编辑参数对象

| 参数                   | 类型    | 默认值    | 说明                                                   |
| ---------------------- | ------- | --------- | ------------------------------------------------------ |
| keybindings            | boolean | true      | 是否支持键盘交互                                       |
| touchEnabled           | boolean | true      | 是否支持触摸交互                                       |
| boxSelect              | boolean | true      | 是否支持数据框选，使用 shift+click+drag 操作           |
| displayControlsDefault | boolean | true      | 是否启用或关闭全部控件                                 |
| drawEnabled            | boolean | true      | 是否启用或关闭图形编辑功能                             |
| adsorbEnabled          | boolean | false     | 是否启用或关闭线面吸附功能                             |
| adsorbBuffer           | number  | 5（像素） | 吸附半径                                               |
| minZoom                | number  | 1         | 最小显示等级                                           |
| maxZoom                | number  | 22        | 最大显示等级                                           |
| decimalPointNum        | number  | 14        | 经纬度保留小数点位数                                   |
| secondEdit             | boolean | true      | 是否开启二次编辑（当有选中的情况下，不会重新创建图形） |
| userStyles             | Object  | 见下      | 全局默认样式，非必输项，可传以下全部或部分内容         |

`userStyles` 参数说明：`classificationType`-矢量叠加类型；`inactive`-非选中状态图形样式；`active`-选中状态图形样式；`static`-不可编辑状态图形样式。内部样式字段：`fillColor`-面颜色、`fillOpacity`-面不透明度、`fillOutlineColor`-面轮廓颜色、`fillOutlineWidth`-面轮廓宽度、`fillOutlineOpacity`-面轮廓透明度、`lineColor`-线颜色、`lineWidth`-线宽度、`circleBorderColor`-点边框颜色、`circleBorderRadius`-点边框宽度、`circleColor`-点颜色、`circleRadius`-点半径。

userStyles 全部参数默认值：

```json
{
  "inactive": {
    "fillColor": "#55B1F3",
    "fillOpacity": 0.1,
    "fillOutlineColor": "#55B1F3",
    "fillOutlineWidth": 2,
    "fillOutlineOpacity": 1,
    "lineColor": "#55B1F3",
    "lineWidth": 2,
    "circleColor": "#55B1F3",
    "circleRadius": 4,
    "circleBorderColor": "#ffffff",
    "circleBorderRadius": 2
  },
  "active": {
    "fillColor": "#F05668",
    "fillOpacity": 0.1,
    "fillOutlineColor": "#F05668",
    "fillOutlineWidth": 2,
    "fillOutlineOpacity": 1,
    "lineColor": "#F05668",
    "lineWidth": 2,
    "circleColor": "#F05668",
    "circleRadius": 6,
    "circleBorderColor": "#ffffff",
    "circleBorderRadius": 2
  },
  "static": {
    "fillColor": "#404040",
    "fillOpacity": 0.1,
    "fillOutlineColor": "#404040",
    "fillOutlineWidth": 2,
    "fillOutlineOpacity": 1,
    "lineColor": "#404040",
    "lineWidth": 2,
    "circleColor": "#404040",
    "circleRadius": 4
  }
}
```

## 编辑器初始化数据

**地图编辑器需要 minemap loaded 后才生效。**

```js
map.on("load", function () {
  edit.draw.add(geojson); // 向编辑池增加数据
  edit.setFeatures(featureCollection); // 设置编辑池中的数据
});
```

## 编辑模式切换 onBtnCtrlActive(mode, modeOptions)

编辑模式可切换不同的编辑行为：

```ts
edit.onBtnCtrlActive(mode: String, modeOptions?: Object);
```

mode 完整值域：

| mode             | 说明                     | mode                 | 说明                                                  |
| ---------------- | ------------------------ | -------------------- | ----------------------------------------------------- |
| point            | 画点                     | trash                | 删除所选（可用于在绘制时清除绘制；键盘 esc 效果相同） |
| icon             | 画标注                   | combine              | 合并同类图形                                          |
| line             | 画线                     | uncombine            | 拆分同类图形                                          |
| arc              | 画圆弧                   | union_polygon        | 合并面                                                |
| text             | 文字                     | split_polygon        | 拆分面                                                |
| polygon          | 画多边形                 | union_line           | 合并线                                                |
| rectangle        | 画矩形                   | split_line           | 拆分线                                                |
| triangle         | 画三角形                 | curve_line           | 弯曲线                                                |
| circle           | 画圆                     | parallel_line        | 平行线                                                |
| ellipse          | 画圆（疑为"画椭圆"笔误） | free_drawing         | 画草图                                                |
| sector           | 画扇形                   | line_arrow           | 画直线箭头                                            |
| parallel_polygon | 画平行多边形             | thin_straight_arrow  | 画细直箭头                                            |
| curve_polygon    | 曲线面                   | thin_tail_arrow      | 画细直(尾)箭头                                        |
| curve_feature    | 弯曲图形                 | attack_arrow         | 画突击箭头                                            |
| clone_feature    | 复制图形                 | offensive_arrow      | 画进攻箭头                                            |
| undo             | 撤销上一步操作           | offensive_tail_arrow | 画进攻(尾)箭头                                        |
| redo             | 重复上一步操作           | pincer_attack_arrow  | 画钳击箭头                                            |
| static           | 切换为不可编辑模式       |                      |                                                       |

`modeOptions` 非必输项，包括样式参数 `style`、形状参数 `shape`。

### style — 面图形参数

`fillColor`-面颜色（默认 "#55B1F3"）、`fillOpacity`-面不透明度（默认 0.1）、`fillOutlineColor`-面轮廓颜色（默认 "#55B1F3"）、`fillOutlineWidth`-面轮廓宽度（默认 2）、`fillOutlineOpacity`-面轮廓透明度（默认 1）、`fillOutlineDasharray`-面轮廓是否为虚线（默认 "false"）。

```js
edit.onBtnCtrlActive("polygon", {
  style: {
    fillColor: "red",
    fillOpacity: 0.1,
    fillOutlineColor: "red",
    fillOutlineWidth: 2,
    fillOutlineOpacity: 1,
  },
});
```

### style — 线图形参数

`lineColor`-线颜色（默认 "#55B1F3"）、`lineWidth`-线宽度（默认 2）、`lineDasharray`-线是否为虚线（默认 "false"）。

```js
edit.onBtnCtrlActive("line", { style: { lineColor: "red", lineWidth: 2 } });
```

### style — 圆点图形参数

`circleBorderColor`-点边框颜色（默认 "#ffffff"）、`circleBorderRadius`-点边框宽度（默认 2）、`circleColor`-点颜色（默认 "#55B1F3"）、`circleRadius`-点半径（默认 4）。

```js
edit.onBtnCtrlActive("point", {
  style: {
    circleColor: "red",
    circleRadius: 4,
    circleBorderColor: "#ffffff",
    circleBorderRadius: 2,
  },
});
```

### style — 标注图形参数

`iconImage`-图标名称（已加入 minemap 地图中的图标名称，包括 sprite 中的名称以及通过 `map.addImage` 自定义添加的图标名称）；`iconColor`-图标颜色（如果图标是矢量的可编辑颜色的，需要增加该参数，否则不需要）；`iconSize`-图标大小（默认 1，非必输项）；`iconRotate`-图标旋转角度（顺时针方向，默认 0，非必输项）。

```js
edit.onBtnCtrlActive("icon", { style: { iconImage: "icon-flag1" } });
```

### style — 文字类型参数

`textField`-文字内容、`textColor`-文字颜色、`textSize`-文字大小、`custom_style`-是否启用自定义样式（字符串 "true"）。

```js
edit.onBtnCtrlActive("text", {
  style: {
    textField: "文字名称",
    textColor: "#00FF00",
    textSize: 26,
    custom_style: "true",
  },
});
```

### shape — 箭头图形参数

`startArrowType`-开始箭头类型（'none'-无箭头、'normal'-普通箭头、'hollow'-空心箭头，默认 'none'）；`endArrowType`-结尾箭头类型（值域同上，默认 'normal'）；`lineType`-线条类型（'solid'-直线、'elbow'-肘形线、'curve'-曲线，默认 'solid'）。

```js
edit.onBtnCtrlActive("line_arrow", {
  shape: { startArrowType: "none", endArrowType: "normal", lineType: "solid" },
});
```

## API Methods

### 数据操作

| 方法                                                               | 作用                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `edit.setFeatures(featureCollection: object)`                      | 设置编辑池中的数据，返回 id 数组                               |
| `edit.removeFeatures(featureIds: array)`                           | 删除编辑池中的数据，返回 id 数组                               |
| `edit.setSelected(featureIds: array)`                              | 设置地图编辑选中数据                                           |
| `edit.setFeatureProperties(featureId: string, properties: object)` | 更新 feature properties，返回该 featureId 对应的最新的 feature |

```js
var ids = edit.setFeatures(featureCollection);
var ids = edit.removeFeatures(featureIds);
var ids = edit.setSelected(featureIds);
edit.setFeatureProperties(featureId, { k1: "v1", k2: "v2" });
```

### draw 数据池

| 方法                                                                        | 作用                                                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `edit.draw.add(geojson: Object) => Array<string>`                           | 添加 GeoJSON（Feature、FeatureCollection、Geometry）到编辑器，返回新增数据的 id 数组 |
| `edit.draw.get(featureId: string): ?Feature`                                | 根据 featureId 获取 feature，不存在返回 undefined                                    |
| `edit.draw.getFeatureIdsAt(point: { x: number, y: number }): Array<string>` | 根据具体点返回该处的 feature id 数组                                                 |
| `edit.draw.getSelectedIds(): Array<string>`                                 | 返回当前已选择的 feature id 数组                                                     |
| `edit.draw.getSelected(): FeatureCollection`                                | 返回当前已选择的 features                                                            |
| `edit.draw.getSelectedPoints(): FeatureCollection`                          | 返回当前已选择形状的顶点                                                             |
| `edit.draw.getAll(): FeatureCollection`                                     | 返回编辑池中的所有 features                                                          |
| `edit.draw.delete(ids: string \| Array<string>)`                            | 根据 id 数组删除编辑池中的数据                                                       |
| `edit.draw.deleteAll()`                                                     | 删除编辑池中的所有数据                                                               |
| `edit.draw.set(featureCollection: FeatureCollection): Array<string>`        | 设置编辑池中的数据                                                                   |
| `edit.draw.trash()`                                                         | 删除所有已选的 feature 或形状点的顶点（会产生历史操作记录）                          |

`draw.add` 支持的 GeoJSON feature types：`Point`、`LineString`、`Polygon`、`MultiPoint`、`MultiLineString`、`MultiPolygon`。如果 add 的 feature 带 id 且该 id 已存在，新 feature 会替换已存在的。无 id 时编辑器自动生成 id。

```js
var feature = { type: "Point", coordinates: [0, 0] };
var featureIds = edit.draw.add(feature);
console.log(featureIds); //=> ['some-random-string']

// feature 包含 id；properties.isLock 用于单个 feature 锁定
var feature = {
  id: "unique-id",
  type: "Feature",
  properties: { isLock: false },
  geometry: { type: "Point", coordinates: [0, 0] },
};
var featureIds = edit.draw.add(feature); //=> ['unique-id']

var featureIds = edit.draw.add({ type: "Point", coordinates: [0, 0] });
console.log(edit.draw.get(featureIds[0]));
//=> { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }

var featureIds = edit.draw.delete(ids).getAll(); // 链式调用
// { type: 'FeatureCollection', features: [] }

var ids = edit.draw.set({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      id: "example-id",
      geometry: { type: "Point", coordinates: [0, 0] },
    },
  ],
}); // ['example-id']
```

**注意**：`getFeatureIdsAt` 的 `point` 参数是像素坐标（x、y），不是经纬度。官方文档签名写对象 `{x, y}` 而示例写 `edit.draw.getFeatureIdsAt(20, 20)`，以实际运行结果为准。

### 历史记录

| 方法                          | 作用                                   |
| ----------------------------- | -------------------------------------- |
| `edit.getAllHistoryRecords()` | 获取编辑器中的所有操作历史记录（数组） |
| `edit.clearHistoryRecords()`  | 清除编辑器中所有的操作历史记录         |

record 记录结构：

```js
{
  type: 0,          /* 操作类型：0-无、1-删除、2-修改、3-新增、4-替换 */
  action: 0,        /* 更新操作行为：0-无、1-图形移动、2-更改图形形状点、3-更改properties */
  features: [],     /* 本次操作后的 features */
  prevFeatures: []  /* 本次操作前的 features */
}
```

### 样式修改

`edit.setFeaturePropertiesByIds(ids, styleOptions)` — 通过指定 id 修改图形样式。`styleOptions` 中的 `custom_style` 属性必须设置为字符串 `"true"` 才会生效；为 `'false'` 则不使用用户的样式而使用默认样式。

```js
edit.setFeaturePropertiesByIds(ids, {
  fillColor: "#ff0000",
  fillOpacity: 0.3,
  fillOutlineColor: "#ff0000",
  fillOutlineWidth: 6,
  fillOutlineOpacity: 1,
  lineOpacity: 0.4,
  fillOutLineDasharrays: [6, 4, 6],
  custom_style: "true", // string 类型，boolean 无效
});
```

`edit.setCustomStyle(styleOptions, featureOptions)` — 自定义设置选中图形的样式。可调整参数：面（fillColor、fillOpacity、fillOutlineColor、fillOutlineWidth、fillOutlineDasharray）、线（lineColor、lineWidth、lineDasharray）、点（circleBorderColor、circleBorderRadius、circleColor、circleRadius）、图标（iconImage、iconSize、iconRotate）。`featureOptions` 非必输项：`featureIds`-变更图形 featureId 数组（不设置则默认设置选中图形样式）；`cancelSelected`-样式更新完成后是否调整为非选中状态（默认 true）。

```js
edit.setCustomStyle({
  fillColor: "#55B1F3",
  fillOpacity: 0.1,
  fillOutlineColor: "#55B1F3",
  fillOutlineWidth: 2,
  fillOutlineOpacity: 1,
  fillOutlineDasharray: "false",
  lineColor: "#55B1F3",
  lineWidth: 2,
  lineDasharray: "false",
  circleBorderColor: "#ffffff",
  circleBorderRadius: 2,
  circleColor: "#55B1F3",
  circleRadius: 4,
});
```

`edit.cancelCustomStyle(featureOptions)` — 恢复选中图形为默认样式，`featureOptions` 同 `setCustomStyle`。

### 功能开关

| 方法                                             | 作用                               |
| ------------------------------------------------ | ---------------------------------- |
| `edit.isDrawEnabled()`                           | 图形编辑功能是否启用               |
| `edit.enableDraw()`                              | 启用图形编辑功能                   |
| `edit.disableDraw()`                             | 禁用图形编辑功能                   |
| `edit.isAdsorbEnabled()`                         | 吸附功能是否启用                   |
| `edit.enableAdsorb()`                            | 开启吸附功能                       |
| `edit.disableAdsorb()`                           | 禁止吸附功能                       |
| `edit.setLockByIds(ids: Array, isLock: Boolean)` | 设置单个（批）feature 是否可以编辑 |

```js
edit.setLockByIds(ids, true); // 开启编辑
edit.setLockByIds(ids, false); // 禁止编辑（官方文档第二个示例误写为 true）
```

## Events

所有事件通过 `map.on(...)` 监听。

| 事件                    | 说明                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `edit.record.create`    | 编辑操作记录新增事件（图形删除、新增、修改、属性更新、合并拆分等都会产生），`e.record` 为操作记录，结构见上文历史记录一节 |
| `edit.undo`             | 撤销上一步操作事件，`e.record` 为被撤销的记录                                                                             |
| `edit.redo`             | 重复（重做）上一步操作事件，`e.record`                                                                                    |
| `edit.selected`         | 图形选中事件，`e.featureIds` 为当前选中的图形 id                                                                          |
| `edit.unselected`       | 图形失焦事件                                                                                                              |
| `draw.update`           | feature 更新事件（见下方 fire 示例）                                                                                      |
| `draw.selectmovechange` | 编辑操作中鼠标移动事件                                                                                                    |
| `draw.modechange`       | 编辑方式改变事件（官方文档该节标题误写为 draw.selectmovechange）                                                          |
| `draw.create`           | 标绘完成事件                                                                                                              |
| `draw.selectionchange`  | 标号选中改变事件                                                                                                          |
| `draw.actionable`       | 标绘插件激活事件                                                                                                          |
| `draw.combine`          | 合并同类型图形成功事件                                                                                                    |
| `draw.uncombine`        | 拆分同类型图形成功事件                                                                                                    |
| `draw.replace`          | 合并线面 / 拆分线面成功事件                                                                                               |

```js
// 加入监听
map.on("edit.record.create", onEditRecordCreate);
function onEditRecordCreate(e) {
  console.log(e.record);
}

map.on("edit.selected", function (e) {
  console.log(e.featureIds); // e.featureIds 为当前选中的图形 id
});

// draw.update：触发属性更新事件，然后会产出一条操作记录
map.fire("draw.update", {
  action: "change_properties",
  prevFeatures: [旧属性的 Feature],
  features: [新属性的 Feature],
});
```

## 快捷键

- 多选：shift + 鼠标左键选择
- 框选：shift + 鼠标拉框
- 删除：delete
- 结束绘制：enter / 鼠标左键双击
- 取消绘制：esc

## 注意事项与已知文档问题

- **初始化时机**：`edit` 初始化必须在 `map load` 事件回调中进行；编辑器需要 minemap loaded 后才生效。
- **custom_style 是字符串**：`setFeaturePropertiesByIds` / 文字 style 中的 `custom_style` 必须为字符串 `"true"`，boolean 无效。
- **getFeatureIdsAt 是像素坐标**：参数为屏幕像素 x/y，不是经纬度；文档签名（对象 `{x, y}`）与示例（两个参数 `20, 20`）不一致，以实际运行结果为准。
- **setLockByIds 文档笔误**：官方文档"禁止编辑"示例误写为 `edit.setLockByIds(ids, true)`，按语义应为 `false`。
- **draw.modechange 标题笔误**：官方文档 Events 章节该节标题误写为 `draw.selectmovechange`，实际事件名为 `draw.modechange`。
- **ellipse 描述存疑**：mode 表中 `ellipse` 的说明写作"画圆"，疑为"画椭圆"笔误。
- **showButtons 未在参数表列出**：官方初始化示例使用了 `showButtons: false`，但 Options 参数表中没有该参数（可能来自底层 draw 控件配置），如需隐藏控件按钮可尝试该参数。
