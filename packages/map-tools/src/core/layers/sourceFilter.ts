import type { LayerInstance } from "../../types/layer";
import type { MapLike } from "../../types/map";
import { invalidArgument, sdkError } from "../errors";

/**
 * 收集引用了指定 source 的全部图层 id。
 * 内联 source（layer.source 为对象）不参与匹配，仅比较字符串 source id。
 */
function collectLayerIds(layers: readonly LayerInstance[], sourceId: string): string[] {
  return layers
    .filter((layer) => typeof layer.source === "string" && layer.source === sourceId)
    .map((layer) => layer.id);
}

/**
 * 对引用同一 source 的全部图层统一设置 style filter。
 * filter 传 null 表示清除过滤。
 *
 * 与 setLayerVisibility（整层 layout 显隐）互补：本函数做"层内按属性筛 feature"。
 *
 * @returns 成功设置 filter 的图层数量（source 无对应图层时返回 0）
 */
export function setSourceFilter(
  map: Pick<MapLike, "getAllLayers" | "setFilter">,
  sourceId: string,
  filter: readonly unknown[] | null,
): number {
  if (!map) invalidArgument("map is required");
  if (!sourceId) invalidArgument("sourceId is required");
  if (filter !== null && !Array.isArray(filter)) {
    invalidArgument("filter must be an array or null");
  }

  let layerIds: string[];
  try {
    layerIds = collectLayerIds(map.getAllLayers(), sourceId);
  } catch (error) {
    throw sdkError(`Failed to inspect layers of source: ${sourceId}`, error);
  }

  try {
    for (const layerId of layerIds) {
      map.setFilter(layerId, filter);
    }
  } catch (error) {
    throw sdkError(`Failed to set filter on layers of source: ${sourceId}`, error);
  }
  return layerIds.length;
}

/**
 * 获取引用了指定 source 的全部图层 id。
 * 常用于把 filter 目标限制在某组图层内，或校验图层是否已挂载。
 */
export function getSourceLayerIds(map: Pick<MapLike, "getAllLayers">, sourceId: string): string[] {
  if (!map) invalidArgument("map is required");
  if (!sourceId) invalidArgument("sourceId is required");
  try {
    return collectLayerIds(map.getAllLayers(), sourceId);
  } catch (error) {
    throw sdkError(`Failed to inspect layers of source: ${sourceId}`, error);
  }
}
