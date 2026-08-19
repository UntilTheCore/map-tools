# polygonTool（面工具）

来源：`packages/map-tools/src/core/polygonTool.ts`

## getPolygonVertex

提取多边形（Polygon / MultiPolygon）的全部顶点。

```ts
function getPolygonVertex(
  polygonFeatureCollection: FeatureCollection<Polygon | MultiPolygon>
): number[][]
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| polygonFeatureCollection | `FeatureCollection<Polygon \| MultiPolygon>` | 多边形要素集合 |

- **返回值**：顶点坐标数组 `number[][]`；参数为空时返回 `[]`。
- **实现**：内部使用 turf `geomEach` + `explode`（炸开为点）+ `getCoord` 提取每个顶点坐标。

## 使用示例

```ts
import { getPolygonVertex } from "@ym/map-tools";

const fc = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "核心区" },
      geometry: {
        type: "Polygon",
        coordinates: [[[116.35, 39.88], [116.42, 39.88], [116.42, 39.93], [116.35, 39.88]]],
      },
    },
  ],
};

const vertices = getPolygonVertex(fc as any);
// 4 个顶点坐标
```

## 相关函数

| 函数 | 模块 | 说明 |
| --- | --- | --- |
| `pointListToCoordList` | [pointTool](/api/pointTool) | 点要素坐标提取 |
| `getLineStringEndpoint` | [lineTool](/api/lineTool) | 线要素端点提取 |
| `setViewPort` | [mapTool](/api/mapTool) | 内部组合使用以上函数计算包围盒 |
| `setViewPortByPolygon` | [mapTool](/api/mapTool) | 按多边形包围盒适配视野 |
| `getCenterBetweenRightPointIntersection` | [mapTool](/api/mapTool) | 多边形质心与最东点连线交点 |
