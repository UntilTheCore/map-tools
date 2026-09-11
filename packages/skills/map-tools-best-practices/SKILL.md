---
name: map-tools-best-practices
description: 基于 @ym/map-tools + minemap + turf 构建中大型地图业务页面的架构最佳实践：三层结构（layer/data/controller）、scene 工厂闭包、LayerGroup 登记表、覆盖物 Marker/Popup 登记销毁、SceneStore 状态订阅、deps 框架注入、useMap 事件接线、内存泄漏排查与 Code Review。在搭建地图页面工程结构、拆分或复用地图业务模块、排查覆盖物泄漏、评审地图页面代码时使用，适用 Vue2/Vue3/React 多框架复用场景。
---

# @ym/map-tools 地图页面架构最佳实践

本技能回答「基于 `@ym/map-tools` + minemap SDK + `@turf/turf` 的业务页面如何组织代码」：三层结构（layer/data/controller）、scene 工厂、LayerGroup 登记表、覆盖物销毁协议、升级与复用规则。各 API 的完整签名见 [../map-tools/SKILL.md](../map-tools/SKILL.md)；全部示例按 `@ym/map-tools` 3.1.0 实际 API 编写，可直接照抄；从旧版本迁移见 docs-preview 的 `guide/migration.md`。

阅读顺序：先读本文件拿到全部规则与判断 → 需要完整示例代码时按第 7 节路由表读 `references/` 对应文件。简单页面不需要全部结构——先读第 1 节判断适用范围。

## 目录

1. 适用边界
2. 核心约定与目录结构
3. 类型基准：以 @ym/minemap-types 为准
4. 各层要点与示例路由
5. 升级规则：状态机 / scene 拆分 / 提升与边界
6. Code Review 清单
7. references 路由表

---

## 1. 适用边界

三层结构（layer / data / controller）是为**中大型地图页面**支付的复杂度预算，不是所有地图页的默认起点。

**不需要本结构的场景**：单图层、无覆盖物、无交互态的纯展示页面（画一批点位 / 一个区域面）。直接用 `@ym/map-tools` 纯函数 + `useMap` 即可，两层结构都不必建——为一张静态点位图建 `layer/data/controller` 三个目录是过度设计。

**建议采用的情况**（满足任一）：

- 图层 ≥ 3 组，或存在多图层共用一个 source（fill + outline）；
- 有覆盖物（Marker/Popup）需要登记与销毁；
- 有聚焦 / 锁定 / 过滤等持续交互状态；
- 页面多人协作；

简单页面后续需要扩展时，再按本技能迁移——scene 工厂的结构允许渐进升级，不需要推翻重来。

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
        ├── store.ts            #   极简可订阅状态（框架无关，见 references/scene-factory.md）
        └── vehicleScene.ts      #   createVehicleScene：状态 + 业务动作 + destroy
```

依赖严格单向：**页面 → scene → layer/data**。controller/scene 本体框架无关，同一套图层操作可被 Vue2/Vue3/React 页面复用：框架相关的一切（弹窗/标签 DOM 工厂）经 `deps` 参数由页面注入（见 references/scene-factory.md）。三条边界：

| 层       | 回答的问题           | 允许                                       | 禁止                                         |
| -------- | -------------------- | ------------------------------------------ | -------------------------------------------- |
| `layer/` | 地图"长什么样"       | id 常量、paint 样式、装配 helper           | 业务分支、事件、请求、组件                   |
| `scene/` | 对图层"能做哪些操作" | `@ym/map-tools`、`minemap.*`、`@turf/turf` | Vue/React API、import 框架弹窗入口、DOM 组件 |
| `.vue`   | "谁在何时触发"       | 调 scene、绑事件、注入 deps                | 直接 `addLayer`/`addSource`/裸图层 id        |

三条硬规则：

- **scene 是页面唯一允许 import 的地图业务模块**；`layer/*`、`data/adapter` 不直接暴露给 `.vue`。唯一例外：`controller/store` 的类型与通用桥接（框架无关叶子模块，不承载业务，见 references/scene-factory.md）；
- **页面不持有业务数据集**：数据进 scene、状态在 scene、意图出 scene；
- **框架 DOM 从 deps 进 scene**：scene 内禁止出现 `import ... from "@ym/map-tools/vue3|vue2|react"` 与 `.vue`/组件 import。

这套结构针对的是四种随项目变大会失控的旧写法：模块级可变状态（等效全局单例，多地图/路由切换互相污染）、销毁靠页面自觉（忘调即泄漏）、`properties` 杂散字段（`dept_id/deptId` 兜底到处蔓延）、**筛选状态互相覆盖**（focus 与 filter 各写各的 style filter，后者覆盖前者且高亮残留——正确做法是筛选条件分开存、统一合成，见 references/scene-factory.md）。

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

**关于 map-tools 的 `MapLike` / `MapLayer` / `MapSource`**：那是无类型时代遗留的兼容用结构类型，仅作库内部签名约束。TypeScript 是结构化类型系统，`minemap.Map` 实例天然满足这些签名，**调用处无需任何断言或转换**。业务代码不要 import 这几个类型、更不要给它们起别名继续使用——`minemap-types` 是唯一数据源。

推论：页面**自己持有** `minemap.Map` 引用并直接喂给库函数，业务链路零断言。唯一可能出现断言的位置是事件回调里使用 `payload.map`（其类型为库的结构类型 `MapLike`）——**优先用页面自己的 map 引用，即可完全绕开**（写法见 references/page-assembly.md）。

`useMap` 是事件模型，不是地图容器：控制器只有在拿到地图实例后才开始转发事件。**无参 `useMap()` 只建控制器不接线**，必须在其后调用 `setMap(map)` 完成挂接（完整页面见 references/page-assembly.md），否则订阅的事件不会触发：

```ts
import { useMap } from "@ym/map-tools/vue3"; // 框架入口按需选择

const { on, setMap } = useMap();
const map = new minemap.Map({ container, ... }); // 页面自己的引用，类型即 minemap.Map
on("loaded", () => {
  const scene = createVehicleScene(map); // 传给 scene 的就是 minemap.Map，零断言
});
setMap(map); // 关键接线：事件控制器挂到地图实例（须在 load 触发前；new 后同步调用即可）
```

## 4. 各层要点与示例路由

各层规则速览；完整可照抄代码在 `references/` 对应文件（路由表见第 7 节）。

### 4.1 数据层：类型化 FeatureCollection + 入口适配器

- 杜绝 `properties` 裸奔，从数据进地图的那一刻即固定：`Feature<Point, XxxProps>` 泛型对齐 layer 表达式、scene filter、事件回调三处；
- GeoJSON 类型泛型用 `geojson` 包（与 turf 同源）；运行时对象一律用 turf 辅助函数创建（`point` / `featureCollection` 等），不手写字面量；
- 后端原始结构（字段混乱）只允许出现在 `toXxxFC` 这一道门的函数签名里，其余任何地方只见 `XxxProps`；
- 兜底必须**用尽声明的字段**。

完整示例：[references/data-adapter.md](references/data-adapter.md)。

### 4.2 layer 层：LayerGroup 登记表与装配

- **铁律：id 来自登记表，禁止裸字符串**。用 `@ym/map-tools/resources` 的 `createSourceId(prefix, name)` / `createLayerId(prefix, name)` 生成确定性 id；一个业务功能一个 `prefix`；所有 source 进登记表；事件绑定数组、`setSourceFilter` 目标、`removeResources` 清理清单全部引用登记常量；
- 登记表组织成 **LayerGroup**（一个 source + 它的图层工厂），保留 source↔layer 配对信息，供装配和销毁复用；多图层共源（fill + outline）与按 source 成组销毁时价值最大；
- 装配是两步幂等组合：`upsertGeoJSONSource`（存在则 `setData`）+ `ensureLayers`（存在则跳过）——同一装配函数可放心重复调用，项目侧用十几行 `mountLayerGroup` helper 收进一个函数；
- **进入即初始化**：scene 工厂入口处对每个组 `mountLayerGroup(map, g, emptyFC())`，此后任何 `setSourceFilter` / `updateSourceData` 不必再判"图层是否存在"；
- 样式集中：色板/等级判断唯一数据源在 `layer/common.ts`；feature 在数据层写好着色属性，图层用表达式渲染，不在 JS 里逐 feature 拼颜色；
- 状态独立成组：hover / selected / locked 各一个 LayerGroup；
- 高频刷数据、样式不变走 `updateSourceData`——只动数据不动图层。

完整示例：[references/layer-group.md](references/layer-group.md)。

### 4.3 controller 层：scene 工厂

- 组织为**一个工厂函数**：所有可变状态（覆盖物登记、当前数据集、聚焦 id、筛选条件）进闭包，页面 `create` 必配对 `destroy`；意图命名一操作一方法：`render` / `focus` / `clearFocus` / `filterByXxx` / `showAll` / `onLayerClick` / `destroy`；
- **高亮 = 向状态图层写数据；移除 = 同一函数传空集合**。"清空"与"设置"共用一条幂等路径，不另写删除逻辑；
- id 类型归一：查找统一 `String(f.id) === String(targetId)`；
- **筛选条件分开存储、单一函数合成**：聚焦、过滤等条件是独立状态维度，分开存变量；所有写入 style filter 的操作收敛到一个 `applyXxxFilter()` 内合成（`["all", ...]` 组合）。**禁止每个业务方法各自调用 `setSourceFilter`**——各自设置会互相覆盖；
- **状态变化要广播**：闭包状态对 UI 框架不可见；持续性状态映射进 `SceneStore` 订阅（`get/set/subscribe` 契约对齐 React 18 `useSyncExternalStore`，Vue 侧十行桥接）；
- 过滤/显隐双通道：整层临时隐藏用 `setLayerVisibility`；层内按属性筛 feature 用 `setSourceFilter`（从地图真实状态反查该 source 的全部图层成对 `setFilter`，`null` 清除）；
- 视野与异步：`waitForSourceLoaded`（**导入路径是 `@ym/map-tools/query`**，超时是 resolve(false) 而非 reject）后 `fitToFeatures`，替代 `setTimeout(100)` 猜时间；
- **依赖注入：框架 DOM 工厂**。scene 保持框架无关，`createPopupDom` 等框架能力经 `deps.createLabelDom` 由页面注入，三个框架同一份 scene；React 入口 `createPopupDom` 是单参数 `(element)`，与 vue2/vue3 的 `(component, props)` 双参数不同；
- 纯函数退化边界：单图层、无覆盖物、无交互态的极简页面可用纯函数；但出现"覆盖物登记"、"聚焦/锁定态"或"多维度筛选"，就必须升级为 scene 闭包——**模块级 `let` 登记可变状态是红线**。

完整示例：[references/scene-factory.md](references/scene-factory.md)。

### 4.4 覆盖物（Marker / Popup）的管理与销毁

- **Marker 与 Popup 挂在地图容器 DOM 上，不属于任何 source/layer，必须单独登记、单独销毁**——大屏项目最常见的内存泄漏点；
- 登记结构：**实例 + DOM 句柄存同一条记录**（`OverlayRecord`），销毁由一个函数保证成对——只 `marker.remove()` 不调 `dom.dispose()`，内部 Vue/React 应用不会卸载；只 dispose 不 remove，DOM 节点残留在地图容器；
- Popup 两种用法：Marker 绑定式（`marker.setPopup`，不要指望 `marker.remove()` 级联清理）与游离式（`setLngLat().setDOMContent().addTo(map)`），都要入册；
- **先清后画**：任何 `renderXxx` 覆盖物的函数，第一步清空本函数名下登记；页面卸载走 scene 的 `destroy()`；
- 销毁顺序固定：**覆盖物 → layer → source → 地图实例**。

完整协议：[references/overlays.md](references/overlays.md)。

### 4.5 页面层：只做装配与意图转发

- `useMap(options)` 不传 `map` 时只创建事件控制器、**不挂到任何地图实例**——必须在其后调用 `setMap(map)` 完成挂接；`setMap` 必须赶在地图 `load` 事件之前（`new minemap.Map()` 之后同步调用即可）；
- 页面不知道 source/layer/Marker 任何细节，只搬运三样东西：**原始数据进、deps 注入进、导航意图出**；
- 红线：页面里出现 `addSource`/`addLayer`/`setSourceFilter`/`setPaint`、`new Marker/Popup`、字符串图层 id → 违规，下沉到 scene/layer；
- `useMap({ layers: { click: [...] } })` 接收**图层 id 数组**，清单由 scene 导出的 `VEHICLE_CLICK_LAYER_IDS` 供给——页面据此保持"只 import scene"。

完整示例：[references/page-assembly.md](references/page-assembly.md)。

## 5. 升级规则：状态机 / scene 拆分 / 提升与边界

### 5.1 交互状态机：何时升级

分开存储 + 单一合成能干净支撑 2~3 个筛选维度。当交互状态继续增长（锁定、框选、临时高亮、多选集合……），散变量的组合语义会重新失控——此时**升级为显式状态机**：状态枚举 + 转移表 + 单一 `transition(state, event)` 入口，把"什么操作在什么状态下允许/互斥/复合"从散落的 if 变成可测试的纯数据。

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

判定信号：筛选/交互维度 ≥ 4，或出现"某状态下另一操作被拒绝"的产品规则。状态机依旧是 scene 内部实现细节，对页面暴露的接口不变（方法 + SceneStore）。

### 5.2 scene 拆分

"一个页面一个 scene"在初期清晰，但方法数超过 ~10 个后 scene 会变成一个什么都管的大模块。5.3 的"提升规则"只解决**跨页面复用**，不解决**单个 scene 内部膨胀**。补充机制：**按 feature 切片组合**：

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
      /* 覆盖物/资源清理同完整示例 */
    },
  };
}
```

规则：feature 模块闭包持有自己的状态与登记，通过共享 `ctx`（map、store、组引用）协作；**筛选合成仍收敛在单一 `applyPointFilter`**（可挂在 ctx 上），切片不重新引入多写入通道。页面面对的接口与红线不变。触发阈值：scene 方法 > ~10 个，或单文件 > ~300 行。

### 5.3 提升与边界规则

1. **第二次复用即提升**：`map/` 先随页面目录走；同一能力被**第 2 个页面**需要时，整包提升到 `src/map-features/vehicle/`，页面 import 路径变化、内部零改动——scene 工厂天然可移植（状态不寄生模块级），提升只改 import 路径、成本很低：第二次复用就动手，避免两个页面各自维护一份拷贝。
2. **胶水阈值**：页面 `<script setup>` 事件接线超过 ~50 行（多层联动、锁定态、路由下钻），允许加一个页面级 composable 做 `useMap` 事件 → scene 方法的**纯转发**；规则是"可以搬出去，只准搬接线、不准搬逻辑"——业务逻辑的家永远是 scene。
3. **scene 命名与隔离**：一个页面/一个可独立存亡的地图能力一个 scene，导出 `createXxxScene(map, deps?): XxxScene`；禁止两个 scene 共用一个 `prefix`（登记表按 prefix 隔离 source，销毁互不越界）。
4. **deps 是唯一的框架入口**：scene 新增任何框架相关能力（弹窗、标签、图表浮层），一律扩展 `deps` 注入工厂，不在 controller 层 import 框架模块。

## 6. Code Review 清单

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

## 7. references 路由表

| 任务                                                                | 文件                                            |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| 写数据适配器：类型化 FeatureCollection、后端原始行归一              | [data-adapter.md](references/data-adapter.md)   |
| 建图层登记表：LayerGroup、扁平退化、`mountLayerGroup` 装配 helper   | [layer-group.md](references/layer-group.md)     |
| 写 scene 工厂：SceneStore、deps 依赖注入、完整 `createVehicleScene` | [scene-factory.md](references/scene-factory.md) |
| 管理覆盖物：Marker/Popup 登记结构、Popup 两种用法、销毁协议         | [overlays.md](references/overlays.md)           |
| 接页面：useMap 事件接线、Vue 页面完整示例、页面红线                 | [page-assembly.md](references/page-assembly.md) |
