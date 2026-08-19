import { useEffect, useRef } from "react";
import { destroyMap } from "../core/mapTool";
import type {
    BindFn,
    EventDispatcherData,
    MapHookOption,
    RenderedFeature,
    ZoomLayerEventData,
} from "../core/types";

export type {
    EventDispatcherData,
    ZoomLayerEventData,
    MapHookOption,
} from "../core/types";

/**
 * map hooks(React 版)。与 vue 版(useMap in @ym/map-tools/vue2|vue3)提供同等能力:
 * 参数兼容 MapHookOption,事件分发数据形状与 vue 版一致(EventDispatcherData / ZoomLayerEventData)。
 *
 * 差异说明:vue 版返回的 mapInstance 是 Ref(通过 .value 访问),react 版返回 MutableRefObject(通过 .current 访问)。
 * 卸载组件时自动解绑事件(与 vue 版一致,不销毁地图);仅当 destroyOnUnmount === true 时才调用 destroyMap。
 * 默认不销毁是刻意设计:外部传入的 map 实例其生命周期不由组件管理,
 * React StrictMode 开发模式下 effect 会双挂载(cleanup → 再次 setup),若无条件销毁会把外部地图一并移除。
 *
 * @param option
 * @param [option.map] - 如果未在调用时提供了map实例，则需要通过返回的 mapInitialize 绑定地图实例，否则功能将无法正常执行
 * @param [option.bindClickLayers] - 绑定地图内监听点击事件监听的图层
 * @param [option.bindMouseMoveLayers] - 绑定地图内监听鼠标移动事件监听的图层
 * @param [option.bindZoomLayers] - 绑定地图内监听缩放事件监听的图层
 * @param [option.zoomQueryBy] - onMapZoom 以哪个坐标为基准进行图层查询
 * @param [option.destroyOnUnmount] - 卸载时是否销毁地图实例，默认 false（仅解绑事件）
 * @returns
 */
export function useMap(option: MapHookOption) {
    const optionRef = useRef(option);
    const {
        bindClickLayers = [],
        bindMouseMoveLayers = [],
        bindZoomLayers = [],
        zoomQueryBy = "mouse",
        destroyOnUnmount = false,
    } = optionRef.current;

    const mapRef = useRef<minemap.Map | null>(optionRef.current.map ?? null);
    const mouseInfoRef = useRef({ lng: 0, lat: 0, x: 0, y: 0 });
    const handlerRef = useRef<BindFn>({});

    function onMapZoomEnd(e: any) {
        const map = mapRef.current;
        if (!map) return;
        const zoom = map.getZoom();
        const mapCenter = map.getCenter();
        let queryPoint: number[] | undefined;
        if (zoomQueryBy === "mouse") {
            queryPoint = [mouseInfoRef.current.x, mouseInfoRef.current.y];
        } else if (zoomQueryBy === "map") {
            // 使用坐标查询会有偏移，慎重使用
            queryPoint = [mapCenter.lng, mapCenter.lat];
        }

        if (!!queryPoint) {
            const features = map.queryRenderedFeatures(queryPoint, {
                layers: bindZoomLayers,
            }) as RenderedFeature[];

            if (Array.isArray(features) && features.length > 0) {
                const feature = features[0];
                const zoomLayerId = feature.layer.id;
                if (!!feature && bindZoomLayers.includes(zoomLayerId)) {
                    handlerRef.current.zoomLayerEventDispatcher &&
                        handlerRef.current.zoomLayerEventDispatcher({
                            zoom,
                            layerId: zoomLayerId,
                            feature,
                            mapEvent: e,
                            mouseCoordinate: [
                                mouseInfoRef.current.lng,
                                mouseInfoRef.current.lat,
                            ],
                            mapCenterCoordinate: [
                                mapCenter.lng,
                                mapCenter.lat,
                            ],
                        } as ZoomLayerEventData);
                }
            } else {
                handlerRef.current.zoomNoInLayer &&
                    handlerRef.current.zoomNoInLayer(e);
            }
        }
    }

    function setMouseInfo(e: any) {
        const { lng, lat } = e.lngLat;
        const { x, y } = e.point;
        mouseInfoRef.current.lng = lng;
        mouseInfoRef.current.lat = lat;
        mouseInfoRef.current.x = x;
        mouseInfoRef.current.y = y;
    }

    function onMapMouseMove(e: any) {
        const map = mapRef.current;
        if (!map) return;
        setMouseInfo(e);

        const features = map.queryRenderedFeatures(e.point, {
            layers: bindMouseMoveLayers,
        }) as RenderedFeature[];

        if (Array.isArray(features) && features.length > 0) {
            const feature = features[0];
            const moveLayerId = feature.layer.id;
            if (!!feature && bindMouseMoveLayers.includes(moveLayerId)) {
                handlerRef.current.mouseMoveLayerEventDispatcher &&
                    handlerRef.current.mouseMoveLayerEventDispatcher({
                        layerId: moveLayerId,
                        feature,
                        mapEvent: e,
                    } as EventDispatcherData);
            }
        } else {
            // 移动到了非图层区域
            handlerRef.current.moveNoInLayer &&
                handlerRef.current.moveNoInLayer(e);
        }
    }

    function onMapClick(e: any) {
        const map = mapRef.current;
        if (!map) return;
        const features = map.queryRenderedFeatures(e.point, {
            layers: bindClickLayers || [],
        }) as RenderedFeature[];

        if (Array.isArray(features) && features.length > 0) {
            const feature = features[0];
            const clickLayerId = feature.layer.id;
            if (!!feature && bindClickLayers.includes(clickLayerId)) {
                handlerRef.current.clickLayerEventDispatcher &&
                    handlerRef.current.clickLayerEventDispatcher({
                        layerId: clickLayerId,
                        feature,
                        mapEvent: e,
                    } as EventDispatcherData);
            }
        } else {
            // 点击了非图层区域
            handlerRef.current.clickNoInLayer &&
                handlerRef.current.clickNoInLayer(e);
        }
    }

    function bindMapEvent(map: minemap.Map) {
        map.on("click", onMapClick);
        map.on("mousemove", onMapMouseMove);
        map.on("zoomend", onMapZoomEnd);
    }

    function unBindMapEvent(map: minemap.Map) {
        map.off("click", onMapClick);
        map.off("mousemove", onMapMouseMove);
        map.off("zoomend", onMapZoomEnd);
    }

    /**
     * 当地图的初始化是通过组件的事件返回时，可以通过绑定此函数执行初始化操作。
     * 注意：当 useMap 默认设置了 map 实例后，为了防止重复绑定，此方法的执行将被忽略
     * @param map
     */
    function mapInitialize(map: minemap.Map) {
        if (!mapRef.current) {
            mapRef.current = map;
            handlerRef.current.onMapLoaded &&
                handlerRef.current.onMapLoaded(map);
            map.on("click", onMapClick);
            map.on("mousemove", onMapMouseMove);
            map.on("zoomend", onMapZoomEnd);
        }
    }

    function onMapLoaded(fn: BindFn["onMapLoaded"]) {
        handlerRef.current.onMapLoaded = fn;
    }

    /**
     * 被点击图层事件分发器
     */
    function onClickLayerEventDispatcher(
        fn: BindFn["clickLayerEventDispatcher"]
    ) {
        handlerRef.current.clickLayerEventDispatcher = fn;
    }

    // 点击了非绑定图层区域
    function onClickNoInLayers(fn: BindFn["clickNoInLayer"]) {
        handlerRef.current.clickNoInLayer = fn;
    }

    /**
     * 鼠标移动图层事件分发器
     */
    function onMouseMoveLayerEventDispatcher(
        fn: BindFn["mouseMoveLayerEventDispatcher"]
    ) {
        handlerRef.current.mouseMoveLayerEventDispatcher = fn;
    }

    /**
     * 移动到了非绑定图层区域
     */
    function onMoveNoInLayers(fn: BindFn["moveNoInLayer"]) {
        handlerRef.current.moveNoInLayer = fn;
    }

    /**
     * 缩放图层事件分发器
     */
    function onZoomLayerEventDispatcher(
        fn: BindFn["zoomLayerEventDispatcher"]
    ) {
        handlerRef.current.zoomLayerEventDispatcher = fn;
    }

    /**
     * 缩放移动到了非绑定图层区域
     */
    function onZoomNoInLayers(fn: BindFn["zoomNoInLayer"]) {
        handlerRef.current.zoomNoInLayer = fn;
    }

    useEffect(() => {
        const map = optionRef.current.map;
        if (map) {
            mapRef.current = map;
            bindMapEvent(map);
        }

        return () => {
            const currentMap = mapRef.current;
            if (currentMap) {
                // 始终解绑事件,与 vue 版行为对齐(只解绑不销毁)
                unBindMapEvent(currentMap);
                if (destroyOnUnmount) {
                    destroyMap(currentMap);
                }
                mapRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        mapInstance: mapRef,
        mapInitialize,
        onMapLoaded,
        onClickLayerEventDispatcher,
        onClickNoInLayers,
        onMouseMoveLayerEventDispatcher,
        onMoveNoInLayers,
        onZoomLayerEventDispatcher,
        onZoomNoInLayers,
        unBindMapEvent: () => {
            const map = mapRef.current;
            if (map) {
                unBindMapEvent(map);
            }
        },
    };
}
