import { FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
/**
 * 获取多边形顶点
 */
export declare function getPolygonVertex(polygonFeatureCollection: FeatureCollection<Polygon | MultiPolygon>): any[];
