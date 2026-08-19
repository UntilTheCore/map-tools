# pointTool（点工具）

来源：`packages/map-tools/src/core/pointTool.ts`

## pointListToCoordList

将 Point 要素列表转换为坐标数组。

```ts
function pointListToCoordList(list: Feature<Point>[]): number[][]
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| list | `Feature<Point>[]` | turf Point 要素列表 |

- **返回值**：坐标数组 `number[][]`（每个元素为 `[lng, lat]`）。
- **实现**：内部逐项 `getCoord(point)` 提取坐标。

## 使用示例

```ts
import { pointListToCoordList } from "@ym/map-tools";

const points = [
  { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [116.4, 39.9] } },
  { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [116.46, 39.94] } },
];

const coords = pointListToCoordList(points as any);
// [[116.4, 39.9], [116.46, 39.94]]
```

## 相关函数

| 函数 | 模块 | 说明 |
| --- | --- | --- |
| `getLineStringEndpoint` | [lineTool](/api/lineTool) | 提取线要素端点 |
| `getPolygonVertex` | [polygonTool](/api/polygonTool) | 提取多边形顶点 |
| `setViewPort` | [mapTool](/api/mapTool) | 内部组合使用以上函数计算包围盒 |
