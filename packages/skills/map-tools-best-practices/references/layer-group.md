# layer 层：LayerGroup 登记表与装配

对应页面目录 `map/layer/`（common.ts / kit.ts / vehicleLayer.ts）——纯图层声明层，框架无关。

## 铁律：id 来自登记表，禁止裸字符串

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

## 装配：`upsert` 数据 + `ensure` 图层

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

## 进入即初始化：空集合建齐所有图层

`scene` 工厂入口处对每个组 `mountLayerGroup(map, g, emptyFC())`（完整用法见 [scene-factory.md](scene-factory.md)），此后任何 `setSourceFilter` / `updateSourceData` 都不必再判"图层是否存在"。
