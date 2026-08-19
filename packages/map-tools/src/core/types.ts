import type { Feature, FeatureCollection } from "@turf/turf";

/**
 * 要素几何类型枚举（运行时值）。
 * 定义在 types.ts 而非 mapTool.ts，避免 mapTool ↔ lineTool 互相导入形成循环依赖。
 */
export enum FeatureTypeEnum {
    Point = "Point",
    LineString = "LineString",
    MultiLineString = "MultiLineString",
    Polygon = "Polygon",
    MultiPolygon = "MultiPolygon",
}

/**
 * 地图渲染要素(queryRenderedFeatures 返回的 feature 附带 layer 信息)
 */
export type RenderedFeature = Feature & { layer: { id: string } };

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

export type BindFn = {
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
    // onMapZoom 以哪个坐标为基准进行图层查询
    zoomQueryBy?: "map" | "mouse";
    // 组件卸载时是否销毁地图实例（默认 false，仅解绑事件）。
    // 仅 React 版使用：传入外部创建的地图实例时保持 false，避免 React StrictMode
    // 双挂载导致外部地图被意外销毁；vue 版始终只解绑不销毁。
    destroyOnUnmount?: boolean;
};
