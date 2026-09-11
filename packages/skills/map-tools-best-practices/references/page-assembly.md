# 页面层：只做装配与意图转发

v3 的 `useMap`（`@ym/map-tools/vue3|vue2|react`）是事件模型：`useMap({ layers: { click: [...], mousemove: [...] } })` 声明监听图层，再用 `on("click:layer" | "click:empty" | "mousemove:layer" | "loaded" | ...)` 订阅；`on` 返回解绑函数，`unbindAll()` 兜底，Vue 入口卸载时自动清理。

**要点**：`useMap(options)` 不传 `map` 时只创建事件控制器、**不挂到任何地图实例**——必须在其后调用 `setMap(map)` 完成挂接，否则所有 `on(...)` 订阅永远不触发。`setMap` 必须赶在地图 `load` 事件之前（`new minemap.Map()` 之后同步调用即可，minemap 的 load 在样式与首屏瓦片就绪后异步触发）；订阅与 `setMap` 的先后顺序无关（控制器只转发地图事件）。

```vue
<script setup lang="ts">
import { onUnmounted, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { createPopupDom, useMap } from "@ym/map-tools/vue3";
import { destroyMap } from "@ym/map-tools/resources";
import VehicleLabel from "./components/VehicleLabel.vue";
import {
  createVehicleScene,
  VEHICLE_CLICK_LAYER_IDS,
  type VehicleScene,
  type VehicleSceneState,
} from "./map/controller/vehicleScene";

const router = useRouter();
let scene: VehicleScene | null = null;
const { on, setMap } = useMap({ layers: { click: VEHICLE_CLICK_LAYER_IDS } });

// 页面负责创建地图实例（自建或框架注入）
const map = new minemap.Map({ container: "map-container", ... });

// 持续性状态映射：scene 在 loaded 后才创建（异步，已脱离 setup 上下文），
// 所以这里用裸订阅而非 useSceneState 桥——后者要求在 setup 同步路径上调用
const sceneState = shallowRef<VehicleSceneState | null>(null);
let unsubscribeState: (() => void) | null = null;

// 先订阅、后接线，双保险
on("loaded", async () => {
  scene = createVehicleScene(map, {
    createLabelDom: (p) => createPopupDom(VehicleLabel, p), // 框架 DOM 从 deps 注入
  });
  unsubscribeState = scene.state.subscribe(() => (sceneState.value = scene!.state.get()));
  sceneState.value = scene.state.get();
  await scene.render(await fetchVehicles()); // fetchVehicles 返回 RawVehicleRow[]
});
setMap(map); // 关键接线：事件控制器挂到地图实例

on("click:layer", (payload) => {
  // 用页面自己的 map 引用，不经 payload.map，零断言
  const intent = scene?.onLayerClick({ features: payload.features });
  if (intent) router.push({ name: "VehicleDetail", params: intent });
});

onUnmounted(() => {
  unsubscribeState?.(); // 状态订阅成对解绑
  scene?.destroy();
  scene = null;
  // 自建且自管的 map 最后销毁（销毁顺序见 overlays.md）
  destroyMap(map);
});
</script>
```

页面不知道 source/layer/Marker 任何细节，只搬运三样东西：**原始数据进、deps 注入进、导航意图出**。红线：页面里出现 `addSource`/`addLayer`/`setSourceFilter`/`setPaint`、`new Marker/Popup`、字符串图层 id → 违规，下沉到 scene/layer。

注意 `useMap({ layers: { click: [...] } })` 接收的是**图层 id 数组**（对应 `MapLayerBindings.click?: readonly string[]`），清单由 scene 导出的 `VEHICLE_CLICK_LAYER_IDS` 供给——页面据此保持"只 import scene"。数据侧同理：`fetchVehicles()` 返回后端原始行 `RawVehicleRow[]`，`toVehicleFC` 归一在 scene 内部完成，页面不 import `data/adapter`。

（若 scene 能在 setup 同步路径上创建——例如地图实例由父组件注入且无需等待 loaded——[scene-factory.md](scene-factory.md) 中 SceneStore 的 `useSceneState` 桥接函数可直接使用；本例 scene 晚绑定在异步回调里，故用裸订阅 + 手动解绑。只要订阅和解绑成对出现，两种写法都合规。）
