# layerTool（图层与要素）

来源：`packages/map-tools/src/core/layerTool.ts`

## setSourceIdName

生成 source id 名。

```ts
function setSourceIdName(prefix: string, name?: string): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| prefix | `string` | - | 前缀 |
| name | `string` | `""` | 名称 |

- **返回值**：`` `${prefix}-${name}-source` ``，如 `setSourceIdName("demo", "district")` → `"demo-district-source"`。

## setLayerIdName

生成 layer id 名。

```ts
function setLayerIdName(prefix: string, name?: string): string
```

- **返回值**：`` `${prefix}-${name}-layer` ``，如 `setLayerIdName("demo", "district")` → `"demo-district-layer"`。

## showLayer

显示一个图层。

```ts
function showLayer(map: minemap.Map, layerId: string): void
```

- **说明**：图层存在时设置 `visibility = "visible"`。

## hideLayer

隐藏一个图层。

```ts
function hideLayer(map: minemap.Map, layerId: string): void
```

- **说明**：图层存在时设置 `visibility = "none"`。

## hideLayers

隐藏多个图层。

```ts
function hideLayers(map: minemap.Map, layerIdList: string[]): void
```

## showLayers

显示多个图层。

```ts
function showLayers(map: minemap.Map, layerIdList: string[]): void
```

## hiddenLayer（已弃用）

```ts
/** @deprecated 请使用 hideLayer */
function hiddenLayer(map: minemap.Map, layerId: string): void
```

## hiddenLayers（已弃用）

```ts
/** @deprecated 请使用 hideLayers */
function hiddenLayers(map: minemap.Map, layerIdList: string[]): void
```

## toggleLayer

切换图层显隐，分受控 / 非受控两种模式（判定条件：是否传入 `getData`）。

```ts
function toggleLayer(option: {
  map: minemap.Map;
  layerId: string;
  sourceId?: string;
  visible?: boolean;
  getData?: (map: minemap.Map) => Promise<any>;
}): void
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |
| layerId | `string` | 图层 id |
| sourceId | `string` | 数据源 id（受控模式必填） |
| visible | `boolean` | 受控模式下控制数据获取与显隐 |
| getData | `(map) => Promise<any>` | 数据获取函数，返回 Promise 保证数据加载完成后主动控制显隐 |

- **非受控模式**（不传 `getData`）：只根据当前 `visibility` 取反显隐，图层不存在时什么都不做。
- **受控模式**（传 `getData`）：通过 `visible` + `getData` 联合控制数据获取与显隐。

## getPbfFeatureListSync

同步获取 PBF 图层当前视口内的要素列表。

```ts
function getPbfFeatureListSync(map: minemap.Map, pbfLayerId: string): Feature[]
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| map | `minemap.Map` | 地图实例 |
| pbfLayerId | `string` | PBF 图层 id |

- **返回值**：turf `Feature[]`；当前视口无数据时返回 `[]`。
- **说明**：能否获取数据取决于地图中是否已加载该图层数据（异步方法见 `getPbfFeatureListAsync`）。

## getPbfFeatureListAsync

异步获取 PBF 图层要素列表（内部先 `checkSourceLoaded` 轮询数据源）。

```ts
async function getPbfFeatureListAsync(
  map: minemap.Map,
  layerId: string,
  sourceId: string,
  option?: { limit?: number } // 默认 30（秒）
): Promise<Feature[]>
```

- **返回值**：`Promise<Feature[]>`；超时后返回空数组，不保证一定能获取到数据。
