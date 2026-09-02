import type {
  Feature,
  GeoJsonProperties,
  Geometry,
  LineString,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
} from "geojson";

export type Coordinate = readonly [longitude: number, latitude: number];
export type BBox = readonly [west: number, south: number, east: number, north: number];

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SupportedGeometry =
  | Point
  | LineString
  | MultiLineString
  | Polygon
  | MultiPolygon;

export type SupportedFeature = Feature<SupportedGeometry, GeoJsonProperties>;
export type GeometryFeature<G extends Geometry = Geometry> = Feature<G, GeoJsonProperties>;

