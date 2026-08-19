# sourceTools（数据源）

来源：`packages/map-tools/src/core/sourceTools.ts`

## checkSourceLoaded

异步检查数据源是否加载完成（轮询）。

```ts
async function checkSourceLoaded(data: {
  map: minemap.Map;
  sourceId: string;
  limit?: number; // 默认 30（秒）
}): Promise<boolean>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| map | `minemap.Map` | - | 地图实例 |
| sourceId | `string` | - | 数据源 id |
| limit | `number` | `30` | 轮询次数上限，每 1 秒查询一次，超时返回 `false` |

- **返回值**：`Promise<boolean>`；`map` 或 `sourceId` 缺失时打印警告并返回 `false`。
- **说明**：内部使用 `map.isSourceLoaded(sourceId)` 每秒轮询，加载完成返回 `true`，超过 `limit` 次未完成打印超时警告并返回 `false`。

## 使用示例

```ts
import { checkSourceLoaded, setPbfSourceData, getPbfFeatureListAsync } from "@ym/map-tools";

setPbfSourceData(map, sourceId, layer, tiles);

checkSourceLoaded({ map, sourceId, limit: 15 }).then((loaded) => {
  if (!loaded) {
    console.warn("数据源加载超时");
    return;
  }
  getPbfFeatureListAsync(map, layerId, sourceId, { limit: 15 }).then((features) => {
    console.log("要素数量:", features.length);
  });
});
```

## 相关函数

| 函数 | 模块 | 说明 |
| --- | --- | --- |
| `setSourceData` | [mapTool](/api/mapTool) | GeoJSON 数据源与图层 |
| `setMultipleLayerSourceData` | [mapTool](/api/mapTool) | 多图层共用数据源 |
| `setPbfSourceData` | [mapTool](/api/mapTool) | PBF 矢量瓦片数据源 |
| `getPbfFeatureListSync` / `Async` | [layerTool](/api/layerTool) | 读取 PBF 要素 |
| `setPbfLayerViewport` | [mapTool](/api/mapTool) | 内部使用 checkSourceLoaded 的视口适配 |
