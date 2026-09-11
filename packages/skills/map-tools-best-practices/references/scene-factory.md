# controller 层：scene 工厂

对应页面目录 `map/controller/`（store.ts / vehicleScene.ts）。controller 推荐组织为**一个工厂函数**：所有可变状态（覆盖物登记、当前数据集、聚焦 id、筛选条件）进闭包，页面 `create` 必配对 `destroy`——评审时只看一行赋值就能发现泄漏点。意图命名一操作一方法：`render` / `focus` / `clearFocus` / `filterByXxx` / `showAll` / `onLayerClick` / `destroy`。

## 通用约定（与具体示例无关）

- **高亮 = 向状态图层写数据；移除 = 同一函数传空集合。** "清空"与"设置"共用一条幂等路径，不另写删除逻辑。
- **id 类型归一**：后端可能返回字符串或数字，查找统一 `String(f.id) === String(targetId)`。
- **筛选条件分开存储、单一函数合成**：聚焦、车队过滤等条件是**独立的状态维度**，分开存变量；所有写入 style filter 的操作收敛到**一个** `applyXxxFilter()` 函数内合成（`["all", ...]` 组合），任何维度变化都重算全量 filter。**禁止每个业务方法各自调用 `setSourceFilter`**——各自设置会互相覆盖：先设的过滤被后设的覆盖，而高亮等其他状态不会跟着恢复。
- **状态变化要广播**：闭包状态对 UI 框架不可见；凡是侧栏/统计卡需要映射的状态，进 `SceneStore` 订阅（见下方 SceneStore 一节），禁止页面轮询查询方法或手写回调同步。
- **过滤/显隐双通道**：

  | 需求                     | 通道              | API                                                                   |
  | ------------------------ | ----------------- | --------------------------------------------------------------------- |
  | 整层临时隐藏（轨迹开关） | layout visibility | `setLayerVisibility(map, layerId, boolean)`（`@ym/map-tools/layers`） |
  | 层内按属性筛部分 feature | style filter      | `setSourceFilter(map, sourceId, filter)`（`@ym/map-tools/layers`）    |

  `setSourceFilter`（≥3.1.0）从**地图真实状态**反查引用该 source 的全部图层并统一 `setFilter`——fill + outline 天然成对，操作的是"图上真实存在"的图层，而非"声明里应该有"的。传 `null` 清除，返回命中图层数。"哪些 id 可见"优先从当前 FeatureCollection 用 turf 推导，不依赖外部缓存，数据刷新后自动跟随。

- **视野与异步**：`waitForSourceLoaded`（**导入路径是 `@ym/map-tools/query`**，不是 viewport）后 `fitToFeatures(map, features)`（默认 padding `{top:150, right:250, bottom:150, left:250}` 已避让左右面板，可传 options 覆盖），替代 `setTimeout(100)` 猜时间。**语义要点**：该 Promise 超时是 **resolve(false) 而非 reject**，默认超时 30 秒——示例统一显式传 `timeoutMs`，等待失败不中断后续渲染。

## 响应式状态出口：SceneStore

闭包状态的天然缺口：`focusedId`、`current` 活在闭包里，UI 框架看不见。"意图出 scene"（方法返回值）只覆盖一次性命令；**持续性状态映射**（侧栏显示"当前聚焦车辆"、统计卡显示"当前可见 23 辆"）需要订阅机制。方案：框架无关的极简可订阅 store，契约对齐 React 18 `useSyncExternalStore`，Vue 侧十行桥接：

```ts
// map/controller/store.ts —— 框架无关，约 20 行
export interface SceneStore<T> {
  get(): T;
  set(next: T): void;
  subscribe(listener: () => void): () => void;
}

/** 页面侧只拿到只读视图：set 仅 scene 内部调用 */
export type SceneStoreView<T> = Pick<SceneStore<T>, "get" | "subscribe">;

export function createStore<T>(initial: T): SceneStore<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
```

框架桥接（放页面侧或共享 composables，属基础设施，不承载业务）：

```ts
// Vue 3：SceneStore → shallowRef
import { onUnmounted, shallowRef, type ShallowRef } from "vue";
import type { SceneStoreView } from "./map/controller/store";

export function useSceneState<T>(store: SceneStoreView<T>): Readonly<ShallowRef<T>> {
  const state = shallowRef(store.get());
  const unsubscribe = store.subscribe(() => (state.value = store.get()));
  onUnmounted(unsubscribe);
  return state;
}
```

```ts
// React 18：原生契约，零桥接代码
import { useSyncExternalStore } from "react";
const state = useSyncExternalStore(scene.state.subscribe, scene.state.get);
```

若状态维度增多（≥5 个字段）或需要派生/原子组合，可升级为 nanostores（多框架官方桥接、~1KB）——`SceneStore` 的 `get/subscribe` 契约与迁移路径兼容。store 本身只有二十行，先放在项目里即可；多个项目都在复制时，再考虑把它进库。

## 依赖注入：框架 DOM 工厂

scene 必须保持框架无关，不能自己 import `@ym/map-tools/vue3|vue2|react` 或组件文件。解法沿用 core 层 `createPopupDom` 的挂载注入思路，再推一层：框架相关的 DOM 创建由页面注入：

```ts
/** 框架 DOM 句柄的结构契约（与库的 PopupDomHandle 结构一致，无需 import 库类型） */
export interface DomHandleLike {
  element: HTMLElement;
  dispose(): void;
}

/** 页面注入的依赖：框架相关的一切从这道门进来 */
export interface VehicleSceneDeps {
  createLabelDom?: (props: { plateNo: string }) => DomHandleLike | null;
}
```

三个框架的页面各自注入，**同一份 scene 复用**：

```ts
// Vue 3 页面
createVehicleScene(map, {
  createLabelDom: (p) => createPopupDom(VehicleLabel, p), // from "@ym/map-tools/vue3"
});

// Vue 2 页面：签名相同，from "@ym/map-tools/vue2"
createVehicleScene(map, { createLabelDom: (p) => createPopupDom(VehicleLabel, p) });

// React 页面：单参数收 ReactElement，先 createElement
createVehicleScene(map, {
  createLabelDom: (p) => createPopupDom(<VehicleLabel plateNo={p.plateNo} />), // from "@ym/map-tools/react"
});
```

注意 React 入口的 `createPopupDom` 是**单参数** `(element: ReactElement)`，与 vue2/vue3 的 `(component, props)` 双参数不同。

## 完整示例

```ts
// map/controller/vehicleScene.ts
import type { Feature } from "geojson";
import { featureCollection, getCoord } from "@turf/turf";
import { removeOverlays } from "@ym/map-tools/overlays";
import { waitForSourceLoaded } from "@ym/map-tools/query";
import { fitToFeatures } from "@ym/map-tools/viewport";
import { removeResources, updateSourceData } from "@ym/map-tools/resources";
import { setSourceFilter } from "@ym/map-tools/layers";
import { VEHICLE_GROUPS, type LayerGroup } from "../layer/vehicleLayer";
import { mountLayerGroup } from "../layer/kit";
import {
  toVehicleFC,
  type RawVehicleRow,
  type VehicleFC,
  type VehicleProps,
} from "../data/vehicleAdapter";
import { createStore, type SceneStoreView } from "./store";

// DomHandleLike / VehicleSceneDeps 声明在本文件顶部（定义见上方「依赖注入」一节）

/** 对外可订阅状态：侧栏/统计卡的数据源 */
export interface VehicleSceneState {
  focusedId: string | null;
  fleetFilter: number[] | null;
  vehicleCount: number;
}

interface OverlayRecord {
  marker: minemap.Marker;
  dom: DomHandleLike;
}

export interface VehicleScene {
  readonly state: SceneStoreView<VehicleSceneState>;
  render(rows: RawVehicleRow[]): Promise<void>;
  updatePositions(rows: RawVehicleRow[]): void;
  focus(vehicleId: string): void;
  clearFocus(): void;
  filterByFleet(fleetIds: number[]): void;
  showAll(): void;
  onLayerClick(payload: { features: readonly Feature[] }): { vehicleId: string } | null;
  destroy(): void;
}

const emptyFC = (): VehicleFC => featureCollection([]);
const findGroup = (name: string): LayerGroup => {
  const g = VEHICLE_GROUPS.find((x) => x.name === name);
  if (!g) throw new Error(`vehicle layer group not found: ${name}`);
  return g;
};

/** 页面绑定 useMap 点击监听的图层清单由 scene 统一供给（页面不 import layer/*） */
export const VEHICLE_CLICK_LAYER_IDS = ["point", "track", "selected"].flatMap((n) =>
  findGroup(n)
    .buildLayers(findGroup(n).sourceId)
    .map((l) => l.id),
);

export function createVehicleScene(map: minemap.Map, deps: VehicleSceneDeps = {}): VehicleScene {
  // —— 全部可变状态收进闭包：实例之间互不污染 ——
  let overlays: OverlayRecord[] = [];
  let current: VehicleFC = emptyFC();

  // —— 聚焦与车队过滤是两个独立维度，分开存储 ——
  let focusedId: string | null = null;
  let fleetFilter: number[] | null = null;
  const state = createStore<VehicleSceneState>({
    focusedId: null,
    fleetFilter: null,
    vehicleCount: 0,
  });

  const point = findGroup("point");
  const selected = findGroup("selected");

  // 创建即初始化：空集合建齐全部图层（页面在 "loaded" 事件后才 create）
  for (const g of VEHICLE_GROUPS) mountLayerGroup(map, g, emptyFC());

  function syncState() {
    state.set({ focusedId, fleetFilter, vehicleCount: current.features.length });
  }

  /** 唯一写 filter 的地方：所有维度在此合成，避免互相覆盖 */
  function applyPointFilter() {
    const conditions: unknown[][] = [];
    if (focusedId !== null) conditions.push(["!in", "vehicleId", focusedId]); // 聚焦者改由 selected 高亮环表达
    if (fleetFilter !== null) conditions.push(["in", "fleetId", ...fleetFilter]);
    const filter =
      conditions.length === 0
        ? null
        : conditions.length === 1
          ? conditions[0]
          : ["all", ...conditions];
    setSourceFilter(map, point.sourceId, filter);
  }

  function focusById(vehicleId: string) {
    const find = current.features.find((f) => String(f.id) === String(vehicleId));
    if (!find) return;
    focusedId = String(find.properties.vehicleId);
    mountLayerGroup(map, selected, featureCollection([find]));
    applyPointFilter();
    syncState();
  }

  function resetFocus() {
    focusedId = null;
    mountLayerGroup(map, selected, emptyFC()); // 移除 = 空集，同一条幂等路径
    applyPointFilter();
    syncState();
  }

  function destroyOverlays() {
    removeOverlays(overlays.map((o) => o.marker));
    overlays.forEach((o) => o.dom.dispose()); // 实例与 DOM 句柄成对销毁，协议见 overlays.md
    overlays = [];
  }

  function renderLabels(fc: VehicleFC) {
    destroyOverlays(); // 先清后画
    if (!deps.createLabelDom) return; // 未注入工厂 = 不渲染标签，其余能力不受影响
    for (const f of fc.features) {
      const dom = deps.createLabelDom({ plateNo: f.properties.plateNo });
      if (!dom) continue;
      const marker = new minemap.Marker({ element: dom.element })
        .setLngLat(getCoord(f)) // f 是 Point feature，直接取坐标
        .addTo(map);
      overlays.push({ marker, dom }); // 登记：marker 与 dom 成对入册
    }
  }

  return {
    state,

    async render(rows) {
      current = toVehicleFC(rows); // 脏数据只在适配器这一道门
      mountLayerGroup(map, point, current);
      renderLabels(current);
      syncState();
      // 超时 resolve(false) 而非 reject：等待失败不中断渲染，fitToFeatures 用当前数据 bbox 尽力而为
      await waitForSourceLoaded(map, point.sourceId, { timeoutMs: 3_000 });
      fitToFeatures(map, current.features); // 替代 setTimeout(100)
    },

    updatePositions(rows) {
      current = toVehicleFC(rows);
      updateSourceData(map, point.sourceId, current); // 只刷数据不动图层
      // 语义边界：selected 高亮快照与 Marker 标签不跟随移动（高频下重建整组 Marker 代价过高）。
      // 若业务要求跟随：在此重算 focus 快照重挂 selected，并按需 renderLabels。
    },

    focus(vehicleId) {
      focusById(vehicleId);
    },

    clearFocus() {
      resetFocus();
    },

    filterByFleet(fleetIds) {
      fleetFilter = [...fleetIds];
      applyPointFilter(); // 与聚焦条件合成，互不覆盖
      syncState();
    },

    showAll() {
      fleetFilter = null;
      applyPointFilter();
      syncState();
    },

    onLayerClick(payload) {
      const first = payload.features[0];
      const id = first ? String((first.properties as VehicleProps).vehicleId) : null;
      // properties 形状由数据层适配器保证
      if (id === null) {
        resetFocus(); // 防御性兜底（click:layer 正常不携带空 features）
        return null;
      }
      if (id !== focusedId) focusById(id);
      return { vehicleId: id }; // 只回传意图，路由跳转归页面
    },

    destroy() {
      destroyOverlays(); // 顺序：覆盖物 → layer → source（地图实例归页面，协议见 overlays.md）
      removeResources(map, {
        layerIds: VEHICLE_GROUPS.flatMap((g) => g.buildLayers(g.sourceId).map((l) => l.id)),
        sourceIds: VEHICLE_GROUPS.map((g) => g.sourceId),
      });
      current = emptyFC();
      focusedId = null;
      fleetFilter = null;
      syncState(); // 订阅方（侧栏/统计卡）同步归零
    },
  };
}
```

纯函数风格并未废弃：单图层、无覆盖物、无交互态的极简页面，可以直接导出 `renderVehicles`/`setSelectedVehicle` 等纯函数（内部仍调 `mountLayerGroup`/`setSourceFilter`）。但只要出现"覆盖物登记"、"聚焦/锁定态"或"多维度筛选"，就必须升级为 scene 闭包——模块级 `let` 登记可变状态是红线。

## 已知语义边界（有意为之的取舍）

- `updatePositions` 只刷 point source 数据，selected 快照与标签不移动——高频场景的刻意取舍；需要跟随时在该方法内补重挂逻辑（注释已标注位置）；
- `focus` 与 `filterByFleet` 可共存（`["all", ...]` 合成）：聚焦高亮环不受车队过滤影响（用户显式聚焦优先）——若产品语义要求"聚焦对象不在过滤结果内则取消聚焦"，在 `applyPointFilter` 前加一条转移规则即可，改动收敛在合成函数；
- 未注入 `createLabelDom` 时 scene 降级运行（无标签），不抛错。
