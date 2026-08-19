# lineTool（线工具）

来源：`packages/map-tools/src/core/lineTool.ts`

## getLineStringEndpoint

提取线要素（LineString / MultiLineString）的全部端点。

```ts
function getLineStringEndpoint(
  lineFeatureCollection: FeatureCollection<LineString | MultiLineString>
): number[][]
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| lineFeatureCollection | `FeatureCollection<LineString \| MultiLineString>` | 线要素集合 |

- **返回值**：端点坐标数组 `number[][]`；参数为空时返回 `[]`。
- **说明**：内部使用 turf `geomEach` + `getCoords` 遍历，按几何类型提取端点：
  - `LineString`：首尾两端点；
  - `MultiLineString`：每条线的首尾端点；
  - 其他类型忽略。

## 使用示例

```ts
import { getLineStringEndpoint } from "@ym/map-tools";

const fc = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "演示线路" },
      geometry: {
        type: "LineString",
        coordinates: [[116.31, 39.95], [116.34, 39.96], [116.39, 39.95]],
      },
    },
  ],
};

const endpoints = getLineStringEndpoint(fc as any);
// [[116.31, 39.95], [116.39, 39.95]]
```

## 相关函数

| 函数 | 模块 | 说明 |
| --- | --- | --- |
| `pointListToCoordList` | [pointTool](/api/pointTool) | 点要素坐标提取 |
| `getPolygonVertex` | [polygonTool](/api/polygonTool) | 多边形顶点提取 |
| `setViewPort` | [mapTool](/api/mapTool) | 内部组合使用以上函数计算包围盒 |
