import { FeatureCollection, LineString, MultiLineString } from '@turf/turf';
/**
 * 获取线的端点,支持 lineString 和 multiLineString
 */
export declare function getLineEndpoint(): void;
/**
 * 获取单个线端点
 */
export declare function getLineStringEndpoint(lineFeatureCollection: FeatureCollection<LineString | MultiLineString>): any[];
