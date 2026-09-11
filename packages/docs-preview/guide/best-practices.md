# 最佳实践

> 面向基于 `@ym/map-tools` + minemap SDK + `@turf/turf` 开发中大型地图业务页面的进阶指南。
> 全部示例按 `@ym/map-tools` 3.1.0 实际 API 编写，可直接照抄。简单页面不需要全部结构——先读第 0 节判断适用范围。
> 各 API 的完整签名见 [API 参考](/api/overview)；从旧版本迁移见 [迁移指南](/guide/migration)。

## 目录

1. 适用边界
2. 核心约定与目录结构
3. 类型基准：以 @ym/minemap-types 为准
4. 数据层：类型化 FeatureCollection + 入口适配器
5. layer 层：LayerGroup 登记表与装配
6. controller 层：scene 工厂
7. 覆盖物（Marker / Popup）的管理与销毁
8. 页面层：只做装配与意图转发
9. 交互状态机：何时升级
10. scene 切片：何时拆分
11. 提升与边界规则
12. Code Review

---

## 1. 适用边界

本指南的三层结构（layer / data / controller）是为**中大型地图页面**支付的复杂度预算，不是所有地图页的默认起点。

**不需要本结构的场景**：单图层、无覆盖物、无交互态的纯展示页面（画一批点位 / 一个区域面）。直接用 `@ym/map-tools` 纯函数 + `useMap` 即可，两层结构都不必建——为一张静态点位图建 `layer/data/controller` 三个目录是过度设计。

**建议采用的情况**（满足任一）：

- 图层 ≥ 3 组，或存在多图层共用一个 source（fill + outline）；
- 有覆盖物（Marker/Popup）需要登记与销毁；
- 有聚焦 / 锁定 / 过滤等持续交互状态；
- 页面多人协作；

简单页面后续需要扩展时，再按本指南迁移——scene 工厂的结构允许渐进升级，不需要推翻重来。

## 2. 核心约定与目录结构

任何地图功能必须落在 `map/` 子目录，禁止把 source/layer 声明、样式、数据写入、交互编排、原始字段兜底堆进 `.vue`。推荐形态是**场景实例（scene）**，最小形态可退化为纯函数 controller：

```
vehicle-management/
├── vehicleManagement.vue        # 页面：布局、事件接线，只调 scene
├── components/
│   └── VehicleLabel.vue         # 标签组件：框架相关，只被页面引用后注入 scene
└── map/
    ├── layer/                   # 纯图层声明层（框架无关）
    │   ├── common.ts            #   共享常量：色板、等级阈值、图标（唯一数据源）
    │   ├── kit.ts               #   mountLayerGroup：成组装配一步到位
    │   └── vehicleLayer.ts      #   LayerGroup 登记表（source ↔ 图层配对）
    ├── data/
    │   └── vehicleAdapter.ts    #   后端原始行 → 类型化 FeatureCollection（唯一脏数据入口）
    └── controller/
        ├── store.ts            #   极简可订阅状态（框架无关，见 5.2）
        └── vehicleScene.ts      #   createVehicleScene：状态 + 业务动作 + destroy
```

依赖严格单向：**页面 → scene → layer/data**。controller/scene 本体框架无关，同一套图层操作可被 Vue2/Vue3/React 页面复用：框架相关的一切（弹窗/标签 DOM 工厂）经 `deps` 参数由页面注入（见 5.3）。三条边界：

| 层       | 回答的问题           | 允许                                       | 禁止                                         |
| -------- | -------------------- | ------------------------------------------ | -------------------------------------------- |
| `layer/` | 地图"长什么样"       | id 常量、paint 样式、装配 helper           | 业务分支、事件、请求、组件                   |
| `scene/` | 对图层"能做哪些操作" | `@ym/map-tools`、`minemap.*`、`@turf/turf` | Vue/React API、import 框架弹窗入口、DOM 组件 |
| `.vue`   | "谁在何时触发"       | 调 scene、绑事件、注入 deps                | 直接 `addLayer`/`addSource`/裸图层 id        |

三条硬规则：

- **scene 是页面唯一允许 import 的地图业务模块**；`layer/*`、`data/adapter` 不直接暴露给 `.vue`。唯一例外：`controller/store` 的类型与通用桥接（框架无关叶子模块，不承载业务，见 5.2）；
- **页面不持有业务数据集**：数据进 scene、状态在 scene、意图出 scene；
- **框架 DOM 从 deps 进 scene**：scene 内禁止出现 `import ... from "@ym/map-tools/vue3|vue2|react"` 与 `.vue`/组件 import。

这套结构针对的是四种随项目变大会失控的旧写法：模块级可变状态（等效全局单例，多地图/路由切换互相污染）、销毁靠页面自觉（忘调即泄漏）、`properties` 杂散字段（`dept_id/deptId` 兜底到处蔓延）、**筛选状态互相覆盖**（focus 与 filter 各写各的 style filter，后者覆盖前者且高亮残留——正确做法是筛选条件分开存、统一合成，见 5.1）。

## 3. 类型基准：以 @ym/minemap-types 为准

minemap SDK 类型由独立包 **`@ym/minemap-types`** 提供（`map-tools` 依赖自动传递），业务代码所有地图类型一律用 `minemap.*` 全局命名空间：

```ts
/// <reference types="@ym/map-tools/minemap" />
// 或在入口/单文件中：import type {} from "@ym/minemap-types";
```

激活后可直接书写的类型：

| 用途                   | 类型                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| 地图实例               | `minemap.Map`（layer/scene 函数第一参数统一用它）                                              |
| addLayer 的图层声明    | `minemap.MapLayer`                                                                             |
| addSource 的数据源声明 | `minemap.MapSource`（GeoJSON 源即 `{ type: "geojson", data }`）                                |
| 覆盖物                 | `minemap.Marker`、`minemap.Popup`                                                              |
| 坐标                   | `minemap.LngLat` / `minemap.LngLatLikeInput`                                                   |
| GeoJSON 数据形状       | `geojson` 包的 `Feature` / `FeatureCollection` / `Point`（turf 同源，不用 minemap 命名空间凑） |

**关于 map-tools 的 `MapLike` / `MapLayer` / `MapSource`**：那是无类型时代遗留的兼容用结构类型，仅作库内部签名约束（如 `Pick<MapLike, "getSource" | "addSource">`、`Pick<MapLike, "getAllLayers" | "setFilter">`）。TypeScript 是结构化类型系统，`minemap.Map` 实例天然满足这些签名，**调用处无需任何断言或转换**。业务代码不要 import 这几个类型、更不要给它们起别名继续使用——`minemap-types` 是唯一数据源。

推论：页面**自己持有** `minemap.Map` 引用并直接喂给库函数，业务链路零断言。唯一可能出现断言的位置是事件回调里使用 `payload.map`（其类型为库的结构类型 `MapLike`）——**优先用页面自己的 map 引用，即可完全绕开**（见第 7 节示例的写法）。

`useMap` 是事件模型，不是地图容器：控制器只有在拿到地图实例后才开始转发事件。**无参 `useMap()` 只建控制器不接线**，必须在其后调用 `setMap(map)` 完成挂接（见第 7 节），否则订阅的事件不会触发：

```ts
import { useMap } from "@ym/map-tools/vue3"; // 框架入口按需选择

const { on, setMap } = useMap();
const map = new minemap.Map({ container, ... }); // 页面自己的引用，类型即 minemap.Map
on("loaded", () => {
  const scene = createVehicleScene(map); // 传给 scene 的就是 minemap.Map，零断言
});
setMap(map); // 关键接线：事件控制器挂到地图实例（须在 load 触发前；new 后同步调用即可）
```

## 4. 数据层：类型化 FeatureCollection + 入口适配器

杜绝 `properties` 裸奔，从数据进地图的那一刻即固定。GeoJSON 类型泛型用 `geojson` 包，与 `@turf/turf` 同源；运行时对象一律用 turf 的辅助函数创建（`point` / `lineString` / `polygon` / `featureCollection` 等），不要手写 `{ type: "Point", coordinates: [...] }` 这类字面量——辅助函数对类型字段和参数顺序都有约束，写错直接编译报错：

```ts
// map/data/vehicleAdapter.ts
import { featureCollection, point } from "@turf/turf";
import type { Feature, FeatureCollection, Point } from "geojson";

/** 状态等级：阈值判断唯一来源在 layer/common.ts 的 getScoreLevel */
export type VehicleProps = {
  vehicleId: string; // 统一 string，归一在适配器完成
  plateNo: string;
  fleetId: number;
  status: "safe" | "normal" | "warning" | "danger";
  lng: number;
  lat: number;
};
export type VehicleFeature = Feature<Point, VehicleProps>;
export type VehicleFC = FeatureCollection<Point, VehicleProps>;

/** 后端结构（字段混乱）只允许出现在这个函数签名里 */
export interface RawVehicleRow {
  id: number | string;
  plate_no?: string;
  plateNo?: string;
  fleet_id: number;
  status: number; // 数字码
  lng?: string; // 经度字段两道兜底，都在适配器完成
  lon?: string;
  lat: string;
  [k: string]: unknown;
}

export function toVehicleFC(rows: RawVehicleRow[]): VehicleFC {
  return featureCollection(
    rows.map((r) => {
      const lng = Number(r.lng ?? r.lon ?? "");
      const lat = Number(r.lat ?? "");
      return point(
        [lng, lat],
        {
          vehicleId: String(r.id),
          plateNo: r.plateNo ?? r.plate_no ?? "",
          fleetId: r.fleet_id,
          status: codeToLevel(r.status),
          lng,
          lat,
        },
        { id: String(r.id) }, // feature.id 归一
      );
    }),
  );
}
```

这样做的好处：`layer/` 的表达式属性、`scene` 的 filter 字段、事件的 `features[0].properties` 全部编译期对齐；"字段混用"从规范问题变成编译错误。后端原始结构只从 `toVehicleFC` 这一道门进入，其余任何地方只见 `VehicleProps`。注意兜底必须**用尽声明的字段**——声明了 `lon` 却从不读取，等于给下个读代码的人埋"这是不是没用？"的疑问。

## 5. layer 层：LayerGroup 登记表与装配

### 5.1 铁律：id 来自登记表，禁止裸字符串

用 `@ym/map-tools/resources` 的 `createSourceId(prefix, name)` / `createLayerId(prefix, name)` 生成带 `-source` / `-layer` 后缀的确定性 id。**一个业务功能一个 `prefix`；所有 source 进登记表；代码任何位置禁止裸字符串 id。** 事件绑定数组、`setSourceFilter` 目标、`removeResources` 清理清单全部引用登记常量——重命名改一处，排查按常量反查所有写入点。

推荐把登记表组织成 **LayerGroup**（一个 source + 它的图层工厂），保留 source↔layer 的配对信息，供装配和销毁复用：

```ts
// map/layer/vehicleLayer.ts
import { createSourceId } from "@ym/map-tools/resources";
import { AREA_COLORS } from "./common";
// 图层类型直接用全局命名空间的 minemap.MapLayer（激活后无需 import）

const prefix = "vehicle";

/** 一个组 = 一个 source + 建组函数（可产出多个图层，天然知道 source id） */
export interface LayerGroup {
  name: string;
  sourceId: string;
  buildLayers: (sourceId: string) => minemap.MapLayer[];
}

export const VEHICLE_GROUPS: LayerGroup[] = [
  {
    name: "point",
    sourceId: createSourceId(prefix, "point"),
    buildLayers: (source) => [
      {
        id: `${source}-circle`,
        type: "circle",
        source,
        paint: {
          "circle-color": {
            type: "categorical",
            property: "status",
            stops: Object.keys(AREA_COLORS).map((k) => [k, AREA_COLORS[k]]),
            default: AREA_COLORS.safe,
          },
          "circle-radius": 6,
        },
      },
    ],
  },
  {
    name: "track",
    sourceId: createSourceId(prefix, "track"),
    buildLayers: (source) => [
      {
        id: `${source}-line`,
        type: "line",
        source,
        paint: { "line-color": "#25E5FF", "line-width": 3 },
      },
      { id: `${source}-dot`, type: "circle", source, paint: { "circle-color": "#FFFFFF" } },
    ],
  },
  {
    name: "selected",
    sourceId: createSourceId(prefix, "selected"),
    buildLayers: (source) => [
      {
        id: `${source}-ring`,
        type: "line",
        source,
        paint: { "line-color": "#FFE700", "line-width": 4 },
      },
    ],
  },
];
```

简单单图层页面也可退化为扁平登记（注意 `createLayerId` 一并导入）：

```ts
import { createLayerId, createSourceId } from "@ym/map-tools/resources";

const POINT = {
  sourceId: createSourceId(prefix, "point"),
  layerId: createLayerId(prefix, "point"),
};
```

LayerGroup 的价值在多图层共源（fill + outline）和按 source 成组销毁时才显现——能反查 source 下的全部图层。

命名约定：图层 id 由 `${sourceId}-语义` 派生，保证组内不冲突、销毁可按 source 反查。

### 5.2 装配：`upsert` 数据 + `ensure` 图层

v3 的终装配是两步组合，二者都幂等——`upsertGeoJSONSource` 存在则 `setData`、否则创建；`ensureLayer(s)` 存在则跳过。所以同一装配函数可放心重复调用（轮询、页面回退），不报错不重复建层。项目侧用一个十几行的 helper 把这两步收进一个函数，效果相当于旧包的 `setMultipleLayerSourceData`：一条语句同时更新数据和确保图层：

```ts
// map/layer/kit.ts
import type { GeoJSON } from "geojson";
import { ensureLayers, upsertGeoJSONSource } from "@ym/map-tools/resources";
import type { LayerGroup } from "./vehicleLayer";

/** 数据 upsert + 组内全部图层 ensure，一步到位 */
export function mountLayerGroup(map: minemap.Map, group: LayerGroup, data: GeoJSON): void {
  upsertGeoJSONSource(map, { id: group.sourceId, data });
  ensureLayers(map, group.buildLayers(group.sourceId));
}
```

要点：

- **样式集中**：色板/等级判断唯一数据源在 `layer/common.ts`；feature 在数据层就写好着色属性（`status`/`level`），图层用表达式渲染，**不在 JS 里逐 feature 拼颜色**。
- **状态独立成组**：hover / selected / locked 各一个 LayerGroup，互不污染。
- **高频刷数据、样式不变**（车辆位置每秒更新）走 `updateSourceData(map, sourceId, data)`——只动数据不动图层，别反复 `mountLayerGroup`。
- **kit.ts 是临时方案**：这个组合 helper 是进库候选（库直接提供 `mountLayerGroup` 时，项目里的 kit.ts 可以删掉，届时只剩登记表和 scene）。

### 5.3 进入即初始化：空集合建齐所有图层

`scene` 工厂入口处对每个组 `mountLayerGroup(map, g, emptyFC())`（见第 5 节），此后任何 `setSourceFilter` / `updateSourceData` 都不必再判"图层是否存在"。

## 6. controller 层：scene 工厂

controller 推荐组织为**一个工厂函数**：所有可变状态（覆盖物登记、当前数据集、聚焦 id、筛选条件）进闭包，页面 `create` 必配对 `destroy`——评审时只看一行赋值就能发现泄漏点。意图命名一操作一方法：`render` / `focus` / `clearFocus` / `filterByXxx` / `showAll` / `onLayerClick` / `destroy`。

### 6.1 通用约定（与具体示例无关）

- **高亮 = 向状态图层写数据；移除 = 同一函数传空集合。** "清空"与"设置"共用一条幂等路径，不另写删除逻辑。
- **id 类型归一**：后端可能返回字符串或数字，查找统一 `String(f.id) === String(targetId)`。
- **筛选条件分开存储、单一函数合成**：聚焦、车队过滤等条件是**独立的状态维度**，分开存变量；所有写入 style filter 的操作收敛到**一个** `applyXxxFilter()` 函数内合成（`["all", ...]` 组合），任何维度变化都重算全量 filter。**禁止每个业务方法各自调用 `setSourceFilter`**——各自设置会互相覆盖：先设的过滤被后设的覆盖，而高亮等其他状态不会跟着恢复。
- **状态变化要广播**：闭包状态对 UI 框架不可见；凡是侧栏/统计卡需要映射的状态，进 `SceneStore` 订阅（见 5.2），禁止页面轮询查询方法或手写回调同步。
- **过滤/显隐双通道**：

  | 需求                     | 通道              | API                                                                   |
  | ------------------------ | ----------------- | --------------------------------------------------------------------- |
  | 整层临时隐藏（轨迹开关） | layout visibility | `setLayerVisibility(map, layerId, boolean)`（`@ym/map-tools/layers`） |
  | 层内按属性筛部分 feature | style filter      | `setSourceFilter(map, sourceId, filter)`（`@ym/map-tools/layers`）    |

  `setSourceFilter`（≥3.1.0）从**地图真实状态**反查引用该 source 的全部图层并统一 `setFilter`——fill + outline 天然成对，操作的是"图上真实存在"的图层，而非"声明里应该有"的。传 `null` 清除，返回命中图层数。"哪些 id 可见"优先从当前 FeatureCollection 用 turf 推导，不依赖外部缓存，数据刷新后自动跟随。

- **视野与异步**：`waitForSourceLoaded`（**导入路径是 `@ym/map-tools/query`**，不是 viewport）后 `fitToFeatures(map, features)`（默认 padding `{top:150, right:250, bottom:150, left:250}` 已避让左右面板，可传 options 覆盖），替代 `setTimeout(100)` 猜时间。**语义要点**：该 Promise 超时是 **resolve(false) 而非 reject**，默认超时 30 秒——示例统一显式传 `timeoutMs`，等待失败不中断后续渲染。

### 6.2 响应式状态出口：SceneStore

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

### 6.3 依赖注入：框架 DOM 工厂

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

### 6.4 完整示例

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

// DomHandleLike / VehicleSceneDeps 声明在本文件顶部（见 5.3 的定义）

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
    overlays.forEach((o) => o.dom.dispose()); // 实例与 DOM 句柄成对销毁，见第 6 节
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
      // 若业务要求跟随：在此重算 focus 快照重挂 selected，并按需 renderLabels——见 5.5。
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
      destroyOverlays(); // 顺序：覆盖物 → layer → source（→ 地图实例归页面，见 6.4）
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

### 6.5 已知语义边界（有意为之的取舍）

- `updatePositions` 只刷 point source 数据，selected 快照与标签不移动——高频场景的刻意取舍；需要跟随时在该方法内补重挂逻辑（注释已标注位置）；
- `focus` 与 `filterByFleet` 可共存（`["all", ...]` 合成）：聚焦高亮环不受车队过滤影响（用户显式聚焦优先）——若产品语义要求"聚焦对象不在过滤结果内则取消聚焦"，在 `applyPointFilter` 前加一条转移规则即可，改动收敛在合成函数；
- 未注入 `createLabelDom` 时 scene 降级运行（无标签），不抛错。

## 7. 覆盖物（Marker / Popup）的管理与销毁

GeoJSON 图层走 source/layer 生命周期，由 `removeResources` 统一销毁；**Marker 与 Popup 挂在地图容器 DOM 上，不属于任何 source/layer，必须单独登记、单独销毁**——这是大屏项目最常见的内存泄漏点。

### 7.1 登记结构：实例与 DOM 句柄存同一条记录

`removeOverlays`（`@ym/map-tools/overlays`）只认 `remove()`：`minemap.Marker`/`minemap.Popup` 都符合，但弹窗句柄是 `dispose()`——所以登记表不能只存 marker，要把"实例 + DOM 句柄"绑成一条记录（即上文 `OverlayRecord`），销毁由一个函数保证成对：

只 `marker.remove()` 不调 `dom.dispose()`，内部 Vue/React 应用（组件实例、响应式副作用）不会卸载；只 dispose 不 remove，DOM 节点残留在地图容器。两条必须成对，故登记时就存成一条记录。

### 7.2 组件内容物：页面注入 DOM 工厂

scene **不直接 import** `@ym/map-tools/vue3|vue2|react` 的 `createPopupDom`——框架相关的创建经 `deps.createLabelDom` 注入（见 5.3），三个框架同一份 scene。core 层的 `createPopupDom(content, mount)` 本身就是挂载注入模式（vue3 `createApp`、vue2 `new Vue`、react `createRoot`），业务侧在 scene 边界沿用同一模式。

```ts
// 页面侧（vue3）：注入工厂
const scene = createVehicleScene(map, {
  createLabelDom: (p) => createPopupDom(VehicleLabel, p), // { element, dispose }
});
```

### 7.3 Popup 的两种用法与各自销毁路径

- **Marker 绑定式**（悬浮牌点开详情）：`new minemap.Popup()` → `marker.setPopup(popup)` → `marker.togglePopup()` 或点击事件开合。**不要指望 `marker.remove()` 级联清理 Popup**（minemap 派生自 mapbox-gl，级联行为跨版本不可靠）——登记时 `popup` 字段照填，销毁走同一 `destroyOverlays`。
- **游离式**（点击地图弹信息框，无宿主 marker）：`new minemap.Popup().setLngLat(...).setDOMContent(dom.element).addTo(map)`。同样入册 `{ popup, dom }`；页面级"当前信息框"至多一个，可用单变量登记，打开前先销毁旧的。
- 内容物用组件走 `setDOMContent(dom.element)` + 同一条记录里的 `dom`；用字符串走 `setHTML()`，无 dispose 负担。

### 7.4 先清后画 + 卸载全销

与图层协议同构：**任何 `renderXxx` 覆盖物的函数，第一步清空本函数名下登记**；页面卸载走 scene 的 `destroy()`。销毁顺序固定：**覆盖物 → layer → source → 地图实例**（页面自建且自管的 map 最后 `destroyMap(map)`，`@ym/map-tools/resources`）。

## 8. 页面层：只做装配与意图转发

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
  // 自建且自管的 map 最后销毁（销毁顺序见 6.4）
  destroyMap(map);
});
</script>
```

页面不知道 source/layer/Marker 任何细节，只搬运三样东西：**原始数据进、deps 注入进、导航意图出**。红线：页面里出现 `addSource`/`addLayer`/`setSourceFilter`/`setPaint`、`new Marker/Popup`、字符串图层 id → 违规，下沉到 scene/layer。

注意 `useMap({ layers: { click: [...] } })` 接收的是**图层 id 数组**（对应 `MapLayerBindings.click?: readonly string[]`），清单由 scene 导出的 `VEHICLE_CLICK_LAYER_IDS` 供给——页面据此保持"只 import scene"。数据侧同理：`fetchVehicles()` 返回后端原始行 `RawVehicleRow[]`，`toVehicleFC` 归一在 scene 内部完成，页面不 import `data/adapter`。

（若 scene 能在 setup 同步路径上创建——例如地图实例由父组件注入且无需等待 loaded——5.2 节的 `useSceneState` 桥接函数可直接使用；本例 scene 晚绑定在异步回调里，故用裸订阅 + 手动解绑。只要订阅和解绑成对出现，两种写法都合规。）

## 9. 交互状态机：何时升级

分开存储 + 单一合成（5.1/5.4）能干净支撑 2~3 个筛选维度。当交互状态继续增长（锁定、框选、临时高亮、多选集合……），散变量的组合语义会重新失控——此时**升级为显式状态机**：状态枚举 + 转移表 + 单一 `transition(state, event)` 入口，把"什么操作在什么状态下允许/互斥/复合"从散落的 if 变成可测试的纯数据。

不必引入 XState（对单场景过重），手写 30 行即可：

```ts
type InteractionState = "idle" | "focused" | "locked" | "box-selecting";
type SceneEvent = "FOCUS" | "BLUR" | "LOCK" | "UNLOCK" | "START_BOX" | "COMMIT_BOX" | "CANCEL";

const TRANSITIONS: Record<InteractionState, Partial<Record<SceneEvent, InteractionState>>> = {
  idle: { FOCUS: "focused", START_BOX: "box-selecting" },
  focused: { BLUR: "idle", LOCK: "locked", START_BOX: "box-selecting" },
  locked: { UNLOCK: "idle" }, // 锁定期拒绝聚焦/框选——互斥规则写在这张表里，不写在 if 里
  "box-selecting": { COMMIT_BOX: "idle", CANCEL: "idle" },
};

function transition(state: InteractionState, event: SceneEvent): InteractionState {
  return TRANSITIONS[state][event] ?? state; // 未声明的转移 = 保持（拒绝）
}
```

判定信号：筛选/交互维度 ≥ 4，或出现"某状态下另一操作被拒绝"的产品规则——散变量组合写不出这种规则的可读版本。状态机依旧是 scene 内部实现细节，对页面暴露的接口不变（方法 + SceneStore）。

## 10. scene 拆分

何时拆分："一个页面一个 scene"在初期清晰，但方法数超过 ~10 个后（render/updatePositions/focus/clearFocus/filterByFleet/showAll/onLayerClick/destroy + 锁定 + 框选 + 聚合……）scene 会变成一个什么都管的大模块。第 11 节的"提升规则"只解决**跨页面复用**，不解决**单个 scene 内部膨胀**。补充机制：**按 feature 切片组合**。

```ts
// map/controller/vehicleScene.ts —— 只做组合与 destroy 聚合
interface SceneContext {
  map: minemap.Map;
  store: SceneStore<VehicleSceneState>;
  point: LayerGroup;
  selected: LayerGroup;
}

interface SceneFeature {
  destroy(): void;
}

export function createVehicleScene(map: minemap.Map, deps: VehicleSceneDeps): VehicleScene {
  const ctx: SceneContext = {/* ... */};
  const focus = createFocusFeature(ctx); // focus/clearFocus/applyPointFilter 的筛选贡献
  const fleet = createFleetFeature(ctx); // filterByFleet/showAll 的筛选贡献
  const labels = createLabelFeature(ctx, deps.createLabelDom);

  return {
    state: ctx.store,
    focus: (id) => focus.set(id),
    clearFocus: () => focus.clear(),
    filterByFleet: (ids) => fleet.set(ids),
    showAll: () => fleet.clear(),
    /* render 等仍留主工厂 */
    destroy() {
      labels.destroy();
      focus.destroy();
      fleet.destroy();
      /* 覆盖物/资源清理同 5.4 */
    },
  };
}
```

规则：feature 模块闭包持有自己的状态与登记，通过共享 `ctx`（map、store、组引用）协作；**筛选合成仍收敛在单一 `applyPointFilter`**（可挂在 ctx 上），切片不重新引入多写入通道。页面面对的接口与红线不变——"只 import scene"不受影响，内部却可独立测试、独立演进。触发阈值：scene 方法 > ~10 个，或单文件 > ~300 行。

## 11. 提升与边界规则

1. **第二次复用即提升**：`map/` 先随页面目录走；同一能力（车辆 scene/layer/adapter）被**第 2 个页面**需要时，整包提升到 `src/map-features/vehicle/`，页面 import 路径变化、内部零改动——scene 工厂天然可移植（状态不寄生模块级），提升只改 import 路径、成本很低：第二次复用就动手，避免两个页面各自维护一份拷贝。
2. **胶水阈值**：页面 `<script setup>` 事件接线超过 ~50 行（多层联动、锁定态、路由下钻），允许加一个页面级 composable 做 `useMap` 事件 → scene 方法的**纯转发**；规则是"可以搬出去，只准搬接线、不准搬逻辑"——业务逻辑的家永远是 scene。
3. **scene 命名与隔离**：一个页面/一个可独立存亡的地图能力一个 scene，导出 `createXxxScene(map, deps?): XxxScene`；禁止两个 scene 共用一个 `prefix`（登记表按 prefix 隔离 source，销毁互不越界）。
4. **deps 是唯一的框架入口**：scene 新增任何框架相关能力（弹窗、标签、图表浮层），一律扩展 `deps` 注入工厂，不在 controller 层 import 框架模块。

## 12. Code Review

1. `.vue` 内直接操作 source/layer、`new Marker/Popup`、写死图层字符串 → 下沉到 scene/layer。
2. controller/scene 模块出现**模块级 `let`** 登记可变状态 → 改 scene 闭包。
3. 页面 import `layer/*` 或 `data/adapter` → 只允许 import scene（`controller/store` 的类型/桥接除外）。
4. `createXxxScene` 没有配对的 `destroy` 调用点 → 泄漏，补齐 `onUnmounted`。
5. 业务代码 import `MapLike`/`MapLayer` 等 map-tools 兼容类型 → 类型一律以 `@ym/minemap-types` 为准（`minemap.Map`、`minemap.MapLayer`）。
6. 图层/source id 未进登记表，或散落第二套常量 → 收敛到 `createSourceId` + LayerGroup。
7. 色板/等级判断多处复制 → 唯一数据源 `layer/common.ts`。
8. `removeXxx` 与 `setXxx` 两套实现 → 改为 `setXxx(空集合)`。
9. **反推 filter 目标**（用 `buildLayers()` 声明反推筛选清单）或手调 `map.setFilter` 逐层 → 用库内 `setSourceFilter`（真实状态成对）。点击绑定/销毁清单的声明式反推（`VEHICLE_CLICK_LAYER_IDS` 等）**不在此列**。
10. 多个筛选方法各自调 `setSourceFilter` 互相覆盖 → 分开存储 + 单一 `applyXxxFilter` 合成通道。
11. 页面轮询 scene 查询方法或手写回调同步 UI → `SceneStore` + `useSceneState`/`useSyncExternalStore`。
12. scene/controller 内 import `@ym/map-tools/vue3|vue2|react` 或组件文件 → 框架 DOM 工厂经 `deps` 注入。
13. `setTimeout` 等渲染 → `waitForSourceLoaded`（注意：`@ym/map-tools/query`；超时 resolve(false) 非 reject）。
14. 高频刷数据反复 `mountLayerGroup` → 样式不变时用 `updateSourceData`。
15. `marker.remove()` 了但没 `dom.dispose()`（或反之）→ 覆盖物登记必须"实例 + DOM 句柄"成对销毁。
16. 指望 marker 级联清 Popup → Popup 必须独立入册销毁。
17. Marker/Popup 不登记、重渲染不清理、卸载不 `removeResources` → 违反清理协议。
18. `properties` 非 `Feature<Point, XxxProps>` 泛型，或 scene/layer 里出现 `||` 字段兜底 → 归一逻辑挪回数据适配器。
19. 事件监听不成对解绑（旧 EventBus 模式）→ 改用 `useMap` 的 `on`/`unbindAll`；无参 `useMap()` 后漏 `setMap(map)` 接线 → 补接线。
20. 装配链可测（假 map 可行）却无单测 → 至少覆盖幂等、filter 成对性、**筛选合成**与状态广播。
