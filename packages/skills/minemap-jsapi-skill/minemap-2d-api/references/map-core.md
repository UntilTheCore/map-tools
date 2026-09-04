# Map 核心类 — 全量成员与重点参数

`minemap.Map` 是地图引擎的主体，继承自 `Evented`。本文覆盖：

1. 构造参数全表
2. 成员速查（按功能分组）
3. 相机动画、图层/样式、数据源、要素查询与状态的**重点参数 + 示例**

## `new Map(options: Object)` 构造参数全表

除 `container` 外全部可选。默认值以下方为准。字段约定：默认值标注在参数后。

| 参数                           | 类型                  | 默认值                                                         | 说明                                                                |
| ------------------------------ | --------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- |
| `container`                    | HTMLElement \| string | 必填                                                           | 容纳地图的元素，不能有子元素                                        |
| `center`                       | LngLatLike            | `[0,0]`                                                        | 初始中心 `[经度, 纬度]`                                             |
| `zoom`                         | number                | `0`                                                            | 初始缩放 (0-24)                                                     |
| `bearing`                      | number                | `0`                                                            | 初始旋转角（度）                                                    |
| `pitch`                        | number                | `0`                                                            | 初始俯仰角 (0-60)                                                   |
| `bounds`                       | LngLatBoundsLike      | --                                                             | 地图边界，设置后用 `fitBoundsOptions` 适配                          |
| `fitBoundsOptions`             | Object                | --                                                             | 配置 `bounds` 的适配方式（同 `fitBounds` 的 options）               |
| `style`                        | Object \| string      | --                                                             | 样式 JSON 或 URL（`'//minedata.cn/service/solu/style/id/2365'` 等） |
| `minZoom`                      | number                | `0`                                                            | 最小缩放                                                            |
| `maxZoom`                      | number                | `22`                                                           | 最大缩放                                                            |
| `minPitch`                     | number                | `0`                                                            | 最小俯仰                                                            |
| `maxPitch`                     | number                | `60`                                                           | 最大俯仰                                                            |
| `maxBounds`                    | LngLatBoundsLike      | --                                                             | 限制地图不可拖出的最大范围                                          |
| `hash`                         | boolean \| string     | `false`                                                        | true 时将位置同步到 URL hash                                        |
| `interactive`                  | boolean               | `true`                                                         | false 时禁用全部交互                                                |
| `bearingSnap`                  | number                | `7`                                                            | 接近正北自动校正的角梯度（度）                                      |
| `pitchWithRotate`              | boolean               | `true`                                                         | false 时旋转时不同步俯仰                                            |
| `clickTolerance`               | number                | `3`                                                            | 点击允许的最大像素移动（超出则算拖拽）                              |
| `attributionControl`           | boolean               | `true`                                                         | 是否显示右下角版权控件                                              |
| `customAttribution`            | string \| string[]    | --                                                             | 版权控件里的自定义文字（需 attributionControl=true）                |
| `logoPosition`                 | string                | `'bottom-left'`                                                | 商标位置：`top-left`/`top-right`/`bottom-left`/`bottom-right`       |
| `logoControl`                  | Object                | `true`                                                         | 商标控件配置                                                        |
| `failIfMajorPerformanceCaveat` | boolean               | `false`                                                        | true 时性能极差会创建失败                                           |
| `preserveDrawingBuffer`        | boolean               | `false`                                                        | true 时可用 `getCanvas().toDataURL()` 导出 PNG                      |
| `antialias`                    | boolean               | `false`                                                        | 开启 MSAA 抗锯齿（自定义图层有用）                                  |
| `refreshExpiredTiles`          | boolean               | `true`                                                         | false 时不重放过期瓦片                                              |
| `scrollZoom`                   | boolean \| Object     | `true`                                                         | 滚轮缩放开关（可传 Object）                                         |
| `boxZoom`                      | boolean               | `true`                                                         | 框选缩放开关                                                        |
| `dragRotate`                   | boolean               | `true`                                                         | 右键拖拽旋转开关                                                    |
| `dragPan`                      | boolean \| Object     | `true`                                                         | 拖拽平移开关                                                        |
| `keyboard`                     | boolean               | `true`                                                         | 键盘快捷键开关                                                      |
| `doubleClickZoom`              | boolean               | `true`                                                         | 双击缩放开关                                                        |
| `touchZoomRotate`              | boolean \| Object     | `true`                                                         | 触摸捏合缩放旋转开关                                                |
| `touchPitch`                   | boolean \| Object     | `true`                                                         | 双指俯仰开关                                                        |
| `trackResize`                  | boolean               | `true`                                                         | 容器尺寸变化时自动 resize                                           |
| `renderWorldCopies`            | boolean               | `true`                                                         | 生成世界副本                                                        |
| `maxTileCacheSize`             | number                | `null`                                                         | 瓦片缓存上限                                                        |
| `localIdeographFontFamily`     | string                | `'PingFang SC,Microsoft YaHei,微软雅黑,Arial,sans-serif,黑体'` | 本地字体族                                                          |
| `transformRequest`             | function              | `null`                                                         | 请求拦截回调，返回 RequestParameters                                |
| `collectResourceTiming`        | boolean               | `false`                                                        | 收集资源定时信息                                                    |
| `fadeDuration`                 | number                | `300`                                                          | 图层淡入淡出时长（ms）                                              |
| `crossSourceCollisions`        | boolean               | `true`                                                         | 跨源碰撞检测                                                        |
| `defaultCursor`                | string                | `null`                                                         | 默认鼠标指针样式                                                    |
| `projection`                   | string                | `MERCATOR`                                                     | 投影方式                                                            |

## 成员速查（按功能分组）

### 属性 / 交互 Handler 开关

| 成员                                                                                                                    | 作用                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `scrollZoom` / `boxZoom` / `dragPan` / `dragRotate` / `keyboard` / `doubleClickZoom` / `touchZoomRotate` / `touchPitch` | 各交互 Handler 对象，可用 `.enable()`/`.disable()`/`.isEnabled()`（见 events-handlers.md） |
| `disableDrag()` / `enableDrag()`                                                                                        | 禁用/启用拖拽                                                                              |
| `getMapCursor()` / `setMapCursor(cursor)` / `getDefaultCursor`/`getCursor`/`setCursor`/`setDefaultCursor`               | 鼠标指针                                                                                   |

### 控件与容器

| 成员                                                                         | 作用                                                                                   |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `addControl(control, position?)` / `removeControl(control)`                  | 添加/移除控件（position: `'top-left'`/`'top-right'`/`'bottom-left'`/`'bottom-right'`） |
| `getContainer()` / `getCanvasContainer()` / `getCanvas()`                    | 容器/DOM 相关                                                                          |
| `showTileBoundaries` / `showPadding` / `showCollisionBoxes` / `showOverdraw` | 调试显示开关                                                                           |
| `addOverviewMap()` / `removeOverviewMap()`                                   | 添加/移除鹰眼图（MineMap 扩展）                                                        |

### 相机与视图

`getBounds()`、`project(lnglat)`、`unproject(point)`、`getCenter()`、`getZoom()`、`getBearing()`、`getPitch()`、`getPadding()`、`isMoving()`、`isZooming()`、`isRotating()`、`setCenter/setZoom/setBearing/setPitch/setPadding`、`panBy/panTo/zoomTo/zoomIn/zoomOut/rotateTo/resetNorth/resetNorthPitch/snapToNorth`、`cameraForBounds/fitBounds/fitScreenCoordinates/jumpTo/easeTo/flyTo`、`setMaxBounds/setMinZoom/setMaxZoom/setMinPitch/setMaxPitch/setZoomAndCenter`、`getRenderWorldCopies/setRenderWorldCopies`、`stop`、`resize`、`setMaxBounds`。

### 样式、图层与数据源

`setStyle/getStyle/isStyleLoaded`、`addSource/isSourceLoaded/areTilesLoaded/getSource/getAllSources/removeSource`、`addLayer/moveLayer/removeLayer/getLayer/setLayerZoomRange/setFilter/getFilter/setPaintProperty/getPaintProperty/setLayoutProperty/getLayoutProperty/setLight/getLight/getAllLayers`、图片相关 `addImage/updateImage/hasImage/removeImage/loadImage/loadImages/listImages`。

### 要素查询与状态

`queryRenderedFeatures`、`querySourceFeatures`、`setFeatureState`、`getFeatureState`、`removeFeatureState`。

### 生命周期与 MineMap 扩展

`loaded`、`remove`、`triggerRepaint`、`setTimerCount(num)`、`pauseTimerCount()`、`resumeTimerCount()`、`stopTimerCount()`、`getMapPoisByPoint(point)`、`getAllMarkers()`、`getAllPopups()`。

## 重点 API：完整参数与示例

### 相机动画（CameraOptions + AnimationOptions）

相机参数 `AnimationOptions`：

| 属性        | 类型      | 说明                              |
| ----------- | --------- | --------------------------------- |
| `duration`  | number    | 动画时长（ms）                    |
| `easing`    | Function  | 过渡函数，输入 0..1 输出 0..1     |
| `offset`    | PointLike | 动画结束时目标中心相对容器的偏移  |
| `animate`   | boolean   | `false` 时禁用动画                |
| `essential` | boolean   | true 时不受系统"减少动态效果"限制 |

相机参数 `CameraOptions`：

| 属性      | 类型           | 说明                                     |
| --------- | -------------- | ---------------------------------------- |
| `center`  | LngLatLike     | 中心                                     |
| `zoom`    | number         | 缩放                                     |
| `bearing` | number         | 旋转角（度），`bearing: 90` 表示正东朝上 |
| `pitch`   | number         | 俯仰角 (0-60)                            |
| `around`  | LngLatLike     | 指定 zoom 时的缩放中心点                 |
| `padding` | PaddingOptions | 视口四边 padding                         |

`flyTo` 额外支持 `speed`、`curve` 字段（控制飞行曲线）。

```js
map.flyTo({ center: [0, 0], zoom: 9 });
map.flyTo({
  center: [0, 0],
  zoom: 9,
  speed: 0.2,
  curve: 1,
  easing(t) {
    return t;
  },
});
```

### fitBounds

```js
map.fitBounds(bounds, { padding: { top: 10, bottom: 25, left: 15, right: 5 } });
map.fitBounds(bounds, { padding: 20 });
```

`fitBounds` 第二个参数 `options.padding` 可为统一数字或 `{top, bottom, left, right}`（PaddingOptions）。

### 图层与样式

```js
map.addLayer({
  id: "points-of-interest",
  source: { type: "vector", url: "minemap://minemap-v8" },
  "source-layer": "poi_label",
  type: "circle",
  paint: {}, // paint 属性
  layout: {}, // layout 属性
});
map.addLayer(layer, "existing-layer-id"); // beforeId 控制图层顺序
map.setPaintProperty("points-of-interest", "circle-radius", 6);
map.setFilter("road-layer-id", ["==", "function-class", 4]);
```

### 数据源

```js
map.addSource("my-data", { type: "vector", url: "minemap://myusername.tilesetid" });
map.addSource("my-points", { type: "geojson", data: geojsonObject });
map.getSource("points"); // 返回 Source 对象（GeoJSON 源可用 setData() 更新）
```

### 要素查询

```js
var features = map.queryRenderedFeatures([20, 35], { layers: ["my-layer-name"] });
map.queryRenderedFeatures({ layers: ["x"] }); // 查询视口内指定图层全部要素
map.querySourceFeatures("my-points"); // 查询某 source 的要素
```

`queryRenderedFeatures` 第一个参数可为单个点/`[sw, ne]` 边界框/省略（整个视口）；第二参数 `options.layers` 限定图层。

### featureState（数据驱动的悬停高亮）

```js
map.setFeatureState({ source: "my-points", id: 1 }, { hover: true });
map.getFeatureState({ source: "my-points", id: 1 });
map.removeFeatureState({ source: "my-points", id: 1 }, "hover"); // 可选 key
```
