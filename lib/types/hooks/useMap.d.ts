/// <reference path="../minemap.d.ts" />
import { Ref } from "vue";
import type { Feature, FeatureCollection } from "@turf/turf";
export type EventDispatcherData = {
    layerId: string;
    feature: Feature | FeatureCollection;
    mapEvent: any;
};
export type ZoomLayerEventData = {
    zoom: number;
    mouseCoordinate: number[];
    mapCenterCoordinate: number[];
} & EventDispatcherData;
type BindFn = {
    onMapLoaded?: (map: minemap.Map) => void;
    clickLayerEventDispatcher?: (data: EventDispatcherData) => void;
    clickNoInLayer?: (e: any) => void;
    mouseMoveLayerEventDispatcher?: (data: EventDispatcherData) => void;
    moveNoInLayer?: (e: any) => void;
    zoomLayerEventDispatcher?: (data: ZoomLayerEventData) => void;
    zoomNoInLayer?: (e: any) => void;
};
export type MapHookOption = {
    map?: minemap.Map;
    bindClickLayers?: string[];
    bindMouseMoveLayers?: string[];
    bindZoomLayers?: string[];
    zoomQueryBy?: "map" | "mouse";
};
/**
 * map hooks. 对各种类型的地图事件进行监听需要在对应的数组内进行绑定，同理，需要监听不在图层内的监听，则需要使用如 "noInLayer"的方法
 * @param option
 * @param [option.map] - 如果未在调用时提供了map实例，则需要通过此方法(mapInitialize)绑定地图实例，否则功能将无法正常执行
 * @param [option.bindClickLayers] - 绑定地图内监听点击事件监听的图层。绑定后，会在 clickLayerEventDispatcher 的回调参数中获取到点击的图层相关数据
 * @param [option.bindMouseMoveLayers] - 绑定地图内监听鼠标移动事件监听的图层。绑定后，会在 onMouseMoveLayerEventDispatcher 的回调参数中获取到点击的图层相关数据
 * @param [option.bindZoomLayers] - 绑定地图内监听缩放事件监听的图层。绑定后，会在 onZoomLayerEventDispatcher 的回调参数中获取到点击的图层相关数据
 * @param [option.zoomQueryBy] - onMapZoom 以哪个坐标为基准进行图层查询
 * @returns
 */
export declare function useMap(option: MapHookOption): {
    mapInstance: Ref<minemap.Map | null | undefined>;
    mapInitialize: (map: minemap.Map) => void;
    onMapLoaded: (fn: BindFn["onMapLoaded"]) => void;
    onClickLayerEventDispatcher: (fn: BindFn["clickLayerEventDispatcher"]) => void;
    onClickNoInLayers: (fn: BindFn["clickNoInLayer"]) => void;
    onMouseMoveLayerEventDispatcher: (fn: BindFn["mouseMoveLayerEventDispatcher"]) => void;
    onMoveNoInLayers: (fn: BindFn["moveNoInLayer"]) => void;
    onZoomLayerEventDispatcher: (fn: BindFn["zoomLayerEventDispatcher"]) => void;
    onZoomNoInLayers: (fn: BindFn["zoomNoInLayer"]) => void;
    unBindMapEvent: () => void;
};
export {};
