/// <reference path="minemap.d.ts" />
import { Feature, FeatureCollection, LineString, MultiLineString, MultiPolygon, Point, Polygon, Properties } from "@turf/turf";
export declare function destroyMap(map: minemap.Map): void;
export declare function clearAllSourceAndLayer(map: minemap.Map, constant: any): void;
/**
 * 设置图层和数据源，支持在数据源和图层设置完成后再执行一个回调函数
 * @param map
 * @param sourceId
 * @param layer
 * @param featureCollection
 * @param {object} option
 * @param {function} [option.afterSetData] - 在设置数据后调用此方法
 * @param {function} [option.afterSetLayer] - 在设置图层后调用此方法
 * @param {object} [option.sourceOption] - 设置数据源时的额外配置属性
 */
export declare function setSourceData(map: minemap.Map, sourceId: string, layer: MapLayer, featureCollection: FeatureCollection, option?: any): void;
/**
 * 若需要给多个图层设置同一个数据源时，可用此函数，不同多次调用 setSourceData
 * 其余功能保持和 setSourceData 一致，并支持对每个 layer 都调用一次 afterSetLayer 方法
 * @param map
 * @param sourceId
 * @param layers - 图层对象数组
 * @param featureCollection
 * @param {object} option
 * @param {function} [option.afterSetData] - 在设置数据后调用此方法
 * @param {function} [option.afterSetLayer] - 在设置图层后调用此方法
 * @param {function} [option.sourceOption] - 设置数据源时的额外配置属性
 */
export declare function setMultipleLayerSourceData(map: minemap.Map, sourceId: string, layers: MapLayer[], featureCollection: FeatureCollection, option?: {
    afterSetData?: (map: minemap.Map, layerId: string) => void;
    afterSetLayer?: (map: minemap.Map, layerId: string) => void;
    sourceOption?: Omit<MapSource, "type" | "data">;
}): void;
/**
 * 设置pbf数据源，重复设置数据源时，会自动删除之前(sourceId)数据源
 * @param map
 * @param sourceId
 * @param layer
 * @param tiles
 */
export declare function setPbfSourceData(map: minemap.Map, sourceId: string, layer: MapLayer, tiles: string[]): void;
export declare function moveAndZoom(map: minemap.Map, coordinate: number[], zoom?: number): void;
export declare function moveMap(map: minemap.Map, coordinate: number[]): void;
export declare function setZoom(map: minemap.Map, zoom: number): void;
export declare function removeMarkers(markers: minemap.Marker): void;
export declare function removeMarkersOrPopups(list: (minemap.Popup | minemap.Marker)[]): void;
export declare function getBearing(currentPoint: number[], nextPoint: number[]): number;
export declare function getRotation(bearing: number, compensation?: number): number;
export declare function getRotationByCoordinate(currentPoint: number[], nextPoint: number[], compensation?: number): number;
/**
 * 获取多边形中点与靠右侧经度最大点之间线的交叉点
 * @param coordinates - 多边形坐标数据
 */
export declare function getCenterBetweenRightPointIntersection(coordinates: number[][]): number[] | undefined;
/**
 * 检测坐标值是否符合 [xxx,xxx]格式
 */
export declare function checkCoordinate(coordinate: any): void;
export declare function setViewPortByPolygon(map: minemap.Map, polygon: Feature<MultiPolygon | Polygon, Properties>, boundary: ViewPortOption["boundary"]): void;
export declare enum FeatureTypeEnum {
    Point = "Point",
    LineString = "LineString",
    MultiLineString = "MultiLineString",
    Polygon = "Polygon",
    MultiPolygon = "MultiPolygon"
}
export declare function getFeatureTypeList<T>(featureList: Feature<Point | LineString | MultiLineString | Polygon | MultiPolygon>[], featureType: FeatureTypeEnum): Feature<T>[];
export type ViewPortOption = {
    boundary?: number[];
};
/**
 * 根据覆盖物计算并移动和缩放至最优层级
 * @param map
 * @param overlays - 覆盖物数据只支持点（point）、线（lineString,multiLineString)、多边形（polygon，multiPolygon)
 * @param option
 * @param [option.boundary] - 计算出的边界与整个浏览器视口的距离。数据逻辑为[上,右,下,左]
 */
export declare function setViewPort(map: minemap.Map, overlays?: Feature<Point | LineString | MultiLineString | Polygon | MultiPolygon>[], option?: ViewPortOption): void;
/**
 * 设置PBF图层的视口。
 *
 * 此函数用于根据提供的数据配置地图的视口，特别是针对PBF格式的图层。它可以根据条件自动调整地图的缩放级别，
 * 并确保所需的图层和源已加载。如果指定了自定义的缩放函数，则会使用该函数来设置地图的缩放级别；
 * 否则，将使用默认的缩放级别。
 *
 * 调整缩放的原因是更好地抓取到pbf数据，因为地图是通过当前视口来返回数据，因此超过当前视口的瓦片数据不会被返回。
 * 可以根据自身功能需求来调整缩放级别。
 *
 * @param {Object} data 函数的配置对象，包含以下属性：
 * @param {minemap.Map} data.map 地图对象，用于设置视口。
 * @param {string} data.layerId 需要设置视口的图层ID。
 * @param {string} data.sourceId 图层对应的源ID。
 * @param {number} [data.limit=30] 内部调用了 checkSourceLoaded 方法，参照其limit说明。
 * @param {boolean} [data.autoZoom=true] 是否自动调整地图缩放级别，直接控制 zoom 和 zoomFn 是否生效。
 * @param {Function} [data.zoomFn] 自定义的缩放级别设置函数，替代默认的缩放行为，优先级高于 zoom。
 * @param {number} [data.zoom=10] 如果自动调整缩放级别，使用的默认缩放级别。
 */
export declare function setPbfLayerViewport(data: {
    map: minemap.Map;
    layerId: string;
    sourceId: string;
    limit?: number;
    autoZoom?: boolean;
    zoom?: number;
    zoomFn?: () => void;
}): void;
