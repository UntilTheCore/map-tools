# 覆盖物（Marker / Popup）的管理与销毁

GeoJSON 图层走 source/layer 生命周期，由 `removeResources` 统一销毁；**Marker 与 Popup 挂在地图容器 DOM 上，不属于任何 source/layer，必须单独登记、单独销毁**——这是大屏项目最常见的内存泄漏点。

## 登记结构：实例与 DOM 句柄存同一条记录

`removeOverlays`（`@ym/map-tools/overlays`）只认 `remove()`：`minemap.Marker`/`minemap.Popup` 都符合，但弹窗句柄是 `dispose()`——所以登记表不能只存 marker，要把"实例 + DOM 句柄"绑成一条记录（即 scene 完整示例中的 `OverlayRecord`，见 [scene-factory.md](scene-factory.md)），销毁由一个函数保证成对：

```ts
interface OverlayRecord {
  marker: minemap.Marker;
  dom: DomHandleLike;
}
```

只 `marker.remove()` 不调 `dom.dispose()`，内部 Vue/React 应用（组件实例、响应式副作用）不会卸载；只 dispose 不 remove，DOM 节点残留在地图容器。两条必须成对，故登记时就存成一条记录。

## 组件内容物：页面注入 DOM 工厂

scene **不直接 import** `@ym/map-tools/vue3|vue2|react` 的 `createPopupDom`——框架相关的创建经 `deps.createLabelDom` 注入（见 [scene-factory.md](scene-factory.md) 的依赖注入一节），三个框架同一份 scene。core 层的 `createPopupDom(content, mount)` 本身就是挂载注入模式（vue3 `createApp`、vue2 `new Vue`、react `createRoot`），业务侧在 scene 边界沿用同一模式。

```ts
// 页面侧（vue3）：注入工厂
const scene = createVehicleScene(map, {
  createLabelDom: (p) => createPopupDom(VehicleLabel, p), // { element, dispose }
});
```

## Popup 的两种用法与各自销毁路径

- **Marker 绑定式**（悬浮牌点开详情）：`new minemap.Popup()` → `marker.setPopup(popup)` → `marker.togglePopup()` 或点击事件开合。**不要指望 `marker.remove()` 级联清理 Popup**（minemap 派生自 mapbox-gl，级联行为跨版本不可靠）——登记时 `popup` 字段照填，销毁走同一 `destroyOverlays`。
- **游离式**（点击地图弹信息框，无宿主 marker）：`new minemap.Popup().setLngLat(...).setDOMContent(dom.element).addTo(map)`。同样入册 `{ popup, dom }`；页面级"当前信息框"至多一个，可用单变量登记，打开前先销毁旧的。
- 内容物用组件走 `setDOMContent(dom.element)` + 同一条记录里的 `dom`；用字符串走 `setHTML()`，无 dispose 负担。

## 先清后画 + 卸载全销

与图层协议同构：**任何 `renderXxx` 覆盖物的函数，第一步清空本函数名下登记**；页面卸载走 scene 的 `destroy()`。销毁顺序固定：**覆盖物 → layer → source → 地图实例**（页面自建且自管的 map 最后 `destroyMap(map)`，`@ym/map-tools/resources`）。
