import { feature } from "@turf/turf";
import { checkSourceLoaded } from "./sourceTools";
/**
 * 设置 source 的 id 名
 * @param prefix - 前缀
 * @param name - 名称
 * @return {string}
 */
export function setSourceIdName(prefix: string, name = "") {
    return `${prefix}-${name}-source`;
}

/**
 * 设置 layer 的 id 名
 * @param prefix
 * @param name
 * @return {string}
 */
export function setLayerIdName(prefix: string, name = "") {
    return `${prefix}-${name}-layer`;
}

// 显示一个图层
export function showLayer(map: minemap.Map, layerId: string) {
    if (map && map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "visible");
    }
}

// 隐藏一个图层
export function hideLayer(map: minemap.Map, layerId: string) {
    if (map && map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "none");
    }
}

/**
 * 隐藏多个图层
 * @param map
 * @param layerIdList
 */
export function hideLayers(map: minemap.Map, layerIdList: string[]) {
    if (Array.isArray(layerIdList) && layerIdList.length > 0) {
        layerIdList.forEach((layerId) => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, "visibility", "none");
            }
        });
    }
}

/**
 * 隐藏一个图层
 * @deprecated 弃用，请使用 hideLayer
 * */
export function hiddenLayer(map: minemap.Map, layerId: string) {
    if (map && map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", "none");
    }
}

/**
 * 隐藏多个图层
 * @deprecated 弃用，请使用 hideLayers
 * @param map
 * @param layerIdList
 */
export function hiddenLayers(map: minemap.Map, layerIdList: string[]) {
    if (Array.isArray(layerIdList) && layerIdList.length > 0) {
        layerIdList.forEach((layerId) => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, "visibility", "none");
            }
        });
    }
}

// 显示多个图层
export function showLayers(map: minemap.Map, layerIdList: string[]) {
    if (Array.isArray(layerIdList) && layerIdList.length > 0) {
        layerIdList.forEach((layerId) => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, "visibility", "visible");
            }
        });
    }
}

/**
 * 切换图层的显示和隐藏。分受控和非受控模式，判定的条件是是否传入了getData方法。
 * 非受控模式下：内部只控制图层的显示和隐藏，不关心数据是否存在，若图层本身就不存在，则什么都不做。因此，你可以只配置  map 和 layerId 属性。
 * 受控模式：内部通过 visible 属性和 getData 属性联合控制数据的获取和显隐操作。getData的执行以及图层的显隐受visible的控制。
 * 为了保证图层在 visible = true 时一定显示，getData 需要返回一个 Promise, 来确保数据加载完成后主动控制显隐操作。
 */
export function toggleLayer(option: {
    map: minemap.Map;
    layerId: string;
    sourceId?: string;
    visible?: boolean;
    getData?: (map: minemap.Map) => Promise<any>;
}) {
    const { map, layerId, sourceId, visible, getData } = option;
    if (!map) {
        console.warn("map is null");
        return;
    }

    if (!layerId) {
        console.warn("layerId is null");
        return;
    }

    if (!layerId) {
        console.warn("sourceId is null");
        return;
    }

    function _getData() {
        if (visible === true) {
            getData?.(map).then(() => {
                visible ? showLayer(map, layerId) : hideLayer(map, layerId);
            });
        }
    }

    function setLayerVisible() {
        if (visible === true) {
            showLayer(map, layerId);
        } else if (visible === false) {
            hideLayer(map, layerId);
        }
    }

    /**
     * 受控型
     */
    function controlled() {
        if (typeof getData === "function") {
            if (!sourceId) {
                console.warn("toggleLayer: missing sourceId");
                return;
            }
            const layer = map.getLayer(layerId);
            const source = map.getSource(sourceId);

            if (layer) {
                const features = source._data.features;
                if (features.length > 0) {
                    setLayerVisible();
                } else {
                    _getData();
                }
            } else {
                _getData();
            }
        } else {
            console.error("toggleLayer`s getData properties is not a function");
        }
    }

    /**
     * 非受控型
     */
    function uncontrolled() {
        const layer = map.getLayer(layerId);
        if (layer) {
            const visibleStr: "visible" | "none" | undefined =
                map.getLayoutProperty(layerId, "visibility");
            if (visibleStr === "visible" || !visibleStr) {
                hideLayer(map, layerId);
            } else {
                showLayer(map, layerId);
            }
        }
    }

    getData ? controlled() : uncontrolled();
}

/**
 * 获取pbf图层的feature列表数据的同步方法，但能否获取到数据要看地图中是否含有该图层数据。
 * 它还有一个异步方法：getPbfFeatureListAsync
 */
export function getPbfFeatureListSync(map: minemap.Map, pbfLayerId: string) {
    const features = map.queryRenderedFeatures({ layers: [pbfLayerId] });
    if (features && features.length > 0) {
        return features.map((item) => feature(item.geometry, item.properties));
    }
    return [];
}

/**
 * 获取pbf图层的feature列表数据的异步方法，不保证一定能获取到数据。此方法会根据根据 limit 值(默认30)来触发等待获取数据的最大等待时间，单位是秒(s)，超时后会返回空数组。
 * 它还有一个同步方法：getPbfFeatureListSync
 */
export async function getPbfFeatureListAsync(
  map: minemap.Map,
  layerId: string,
  sourceId: string,
  option?: { limit: number }
) {
  return checkSourceLoaded({
    map,
    sourceId,
    limit: option?.limit,
  }).then((status) => {
    if (status) {
      const features = map.queryRenderedFeatures({ layers: [layerId] });
      if (features && features.length > 0) {
        return features.map((item) =>
          feature(item.geometry, item.properties)
        );
      }
    }

    return [];
  });
}
