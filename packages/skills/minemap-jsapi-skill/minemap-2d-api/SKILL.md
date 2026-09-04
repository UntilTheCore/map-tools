---
name: minemap-2d-api
description: MineMap JS API 核心库（minemap-for-2d v2.1.x）开发技能。涵盖全局配置与地图初始化、相机动画（flyTo/easeTo/fitBounds）、图层与样式（addLayer/setPaintProperty/setFilter）、数据源（addSource + GeoJSON/Image/Video/Canvas）、要素查询（queryRenderedFeatures/querySourceFeatures/featureState）、事件绑定（on/off/once 及 click 的 layerId 过滤）、Marker/Popup/控件、交互 Handler、LngLat/LngLatBounds 几何、四种 Source、自定义图层与图标接口。Use whenever the user works with minemap、minemap.Map、地图初始化、addLayer、飞行动画、数据源、标记、弹窗、点击事件、要素查询——即使没有明确提到 "minemap" 或 "api"。
---

# MineMap 核心库（minemap-for-2d）开发技能

核心库是 MineMap 地图引擎的主体，暴露全局命名空间 `minemap`。本技能提供核心库 2D/2.5D 静态 API 的完整参考。配套的 `minemap-2d-util` 技能负责工具库 `minemaputil`（测量/空间计算），两者配合使用。

## 1. 接入步骤

检查 `index.html` 的 `head` 中是否已引入核心库，没有则添加（按项目约定使用 `gmap.cqphx.cn:4443` 的 v2.1.0）：

```html
<link rel="stylesheet" href="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.css" />
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/minemap.js"></script>
```

- 使用 **echarts** 或特殊渲染效果（如热力图、动画）时，还需引入插件库：

```html
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/plugins/echarts/echarts.3.8.5.min.js"></script>
<script src="https://gmap.cqphx.cn:4443/minemapapi/v2.1.0/plugins/template/template.js"></script>
```

## 2. 全局配置与初始化

初始化前先设置全局配置（`minemap.key` 与 `minemap.appKey` 兼容，设其中一个即可）：

```js
minemap.key = "<your key>";
minemap.solution = 2365; // 样式/方案 ID

// 可选：覆盖默认请求域名（默认指向 minedata.cn）
minemap.domainUrl = "//minedata.cn";
minemap.dataDomainUrl = "//datahive.minedata.cn";
minemap.spriteUrl = "//minedata.cn/minemapapi/v2.0.0/sprite/sprite";
minemap.serviceUrl = "//minedata.cn/service/";
```

`new minemap.Map(options)` 构造地图。常用 options 见下表（其余字段见 `map-core.md` 的构造参数全表）：

| 参数                    | 类型                  | 默认值  | 说明                                                                    |
| ----------------------- | --------------------- | ------- | ----------------------------------------------------------------------- |
| `container`             | HTMLElement \| string | 必填    | 容纳地图的 HTML 元素（不能有子元素）                                    |
| `center`                | LngLatLike            | `[0,0]` | 初始中心点，`[经度, 纬度]`                                              |
| `zoom`                  | number                | `0`     | 初始缩放级别 (0-24)                                                     |
| `bearing`               | number                | `0`     | 初始旋转角（度）                                                        |
| `pitch`                 | number                | `0`     | 初始俯仰角 (0-60)                                                       |
| `style`                 | Object \| string      | --      | 样式 JSON 对象或 URL（如 `'//minedata.cn/service/solu/style/id/2365'`） |
| `minZoom`               | number                | `0`     | 最小缩放                                                                |
| `maxZoom`               | number                | `22`    | 最大缩放                                                                |
| `minPitch`              | number                | `0`     | 最小俯仰角                                                              |
| `maxPitch`              | number                | `60`    | 最大俯仰角                                                              |
| `maxBounds`             | LngLatBoundsLike      | --      | 限制地图活动范围的边界                                                  |
| `interactive`           | boolean               | `true`  | false 时禁用鼠标/键盘/触摸交互                                          |
| `renderWorldCopies`     | boolean               | `true`  | 是否创建世界副本渲染                                                    |
| `preserveDrawingBuffer` | boolean               | `false` | true 时可用 `map.getCanvas().toDataURL()` 导出 PNG                      |
| `attributionControl`    | boolean               | `true`  | 是否显示右下角版权控件                                                  |

最小示例：

```js
var map = new minemap.Map({
  container: "map",
  center: [116.38, 39.9],
  zoom: 12,
  style: "//minedata.cn/service/solu/style/id/2365",
});
```

注意：官方文档示例曾出现 `new minemap({...})`（不带 `.Map`）的写法，以参数表方法名 `new minemap.Map(...)` 为准。

## 3. 任务路由表（先查这里，再去对应 reference）

| 你要做的事                                                  | 读哪个文件                      |
| ----------------------------------------------------------- | ------------------------------- |
| Map 构造全参数、相机动画、图层/样式、数据源、要素查询与状态 | `references/map-core.md`        |
| 加一个标记点（Marker，含标题/动画/拖拽）                    | `references/marker.md`          |
| 加一个信息弹窗（Popup，HTML/文本/自定义 DOM）               | `references/popup.md`           |
| 加导航/比例尺/全屏等 UI 控件                                | `references/controls.md`        |
| 绑定/解除事件、事件清单、事件对象字段、交互 Handler 开关    | `references/events-handlers.md` |
| GeoJSON/视频/图像/Canvas 数据源                             | `references/sources.md`         |
| LngLat / LngLatBounds / Point 坐标与边界                    | `references/geometry.md`        |
| 自定义样式图层/动态图标接口                                 | `references/custom-render.md`   |

## 4. 核心 API 速查（完整细节见对应引用文件）

**相机动画**（均返回 `Map` 可链式调用）：

```js
map.flyTo({ center: [0, 0], zoom: 9 }); // 曲线飞行
map.easeTo({ center: [0, 0], zoom: 9 }); // 直线渐变
map.jumpTo({ center: [0, 0], zoom: 9 }); // 瞬时跳转
map.fitBounds(
  [
    [73, 15],
    [135, 50],
  ],
  { padding: 20 },
); // 框住经纬度范围
map.panBy([-100, 50]); // 按像素平移
map.resetNorth(); // 回正北/复位俯仰角
map.stop(); // 停止所有动画
```

**图层与数据源**：

```js
map.addSource('my-points', {type: 'geojson', data: geojson});
map.addLayer({id: 'pt', type: 'circle', source: 'my-points', paint: {...}});
map.setPaintProperty('pt', 'circle-radius', 6);
map.setFilter('pt', ['==', 'type', 'school']);
map.getSource('my-points');  // 返回 Source 对象，GeoJSON 源可调 setData()
map.getAllLayers();          // 获取所有图层
```

**要素查询**：

```js
map.queryRenderedFeatures([20, 35], { layers: ["my-layer"] }); // 查询某像素的全部要素
map.querySourceFeatures("my-points", { sourceLayer: "xxx" }); // 查询某 source 的要素
map.setFeatureState({ source: "my-points", id: 1 }, { hover: true });
map.getFeatureState({ source: "my-points", id: 1 });
```

**事件绑定**（`on`/`once`/`off`，`click` 等事件支持 `layerId` 过滤）：

```js
map.on("click", function (e) {
  console.log(e.lngLat, e.point, e.originalEvent);
});
map.on("click", "my-layer", function (e) {
  // 仅在点击该图层要素时触发
  console.log(e.features[0].properties);
});
map.once("load", () => {}); // 一次性监听
```

## 5. 覆盖盲区与注意事项

- **`index.html` 文档实测版本为 2.1.1**（文件夹名是 2.1.4），如遇极新特性请核对实际库文件。
- **文档中没有独立的 Layer 类**：图层不是对象，而是通过 `map.addLayer` 添加、用 `setPaintProperty`/`setLayoutProperty`/`setFilter` 修改的 style 条目。
- **文档未提供 `VectorSource`/`RasterSource` 类的 API 章节**（只有 GeoJSON/Video/Image/Canvas 四种）。矢量/栅格数据源通过 `addSource({type: 'vector'\|'raster', ...})` 的 style 对象形式使用。
- **坐标顺序统一为 `[经度, 纬度]`**（`lng, lat`），与 GeoJSON 一致。
- **没有 3D/Tile3D 文档**：本核心库 API 覆盖 2D 与 2.5D（pitch/bearing）。
- `map.on(type, layerId, listener)` 的三参形式（带 layerId 过滤）与 `map.on(type, listener)` 两参形式都可用，看到 `.on` 带 `layerId` 时不困惑。
- source 示例中曾出现 `minemap://minemap-v8` 这类伪 URL，那是文档示例占位符，实际应根据项目配置传入真实样式/数据地址。

## 6. 官方 demo 参考

对应章节内的示例多可对照[官方 demo](https://minedata.cn/mine-support/web/v2/demo)。常用入口：

- 地图初始化/飞行：`/map/base/map-show`、`/map/state/map-fly`
- 图层：`/layer/manage/layer-add`、`/layer/base/line-layer`
- Marker/Popup：`/overlay/marker/marker-add`、`/overlay/popup/popup-add`
- 事件：`/event/map/map-load`、`/event/mouse/mouse-click/`
