/// <reference path="minemap.d.ts" />
/**
 * 设置 source 的 id 名
 * @param prefix - 前缀
 * @param name - 名称
 * @return {string}
 */
export declare function setSourceIdName(prefix: string, name?: string): string;
/**
 * 设置 layer 的 id 名
 * @param prefix
 * @param name
 * @return {string}
 */
export declare function setLayerIdName(prefix: string, name?: string): string;
export declare function showLayer(map: minemap.Map, layerId: string): void;
export declare function hideLayer(map: minemap.Map, layerId: string): void;
/**
 * 隐藏多个图层
 * @param map
 * @param layerIdList
 */
export declare function hideLayers(map: minemap.Map, layerIdList: string[]): void;
/**
 * 隐藏一个图层
 * @deprecated 弃用，请使用 hideLayer
 * */
export declare function hiddenLayer(map: minemap.Map, layerId: string): void;
/**
 * 隐藏多个图层
 * @deprecated 弃用，请使用 hideLayers
 * @param map
 * @param layerIdList
 */
export declare function hiddenLayers(map: minemap.Map, layerIdList: string[]): void;
export declare function showLayers(map: minemap.Map, layerIdList: string[]): void;
/**
 * 切换图层的显示和隐藏。分受控和非受控模式，判定的条件是是否传入了getData方法。
 * 非受控模式下：内部只控制图层的显示和隐藏，不关心数据是否存在，若图层本身就不存在，则什么都不做。
 * 受控模式：内部通过 visible 属性和 getData 属性联合控制数据的获取和显隐操作。getData的执行以及图层的显隐受visible的控制。
 * 为了保证图层在 visible = true 时一定显示，getData 需要返回一个 Promise, 来确保数据加载完成后主动控制显隐操作。
 */
export declare function toggleLayer(option: {
    map: minemap.Map;
    layerId: string;
    sourceId: string;
    visible?: boolean;
    getData?: (map: minemap.Map) => Promise<any>;
}): void;
