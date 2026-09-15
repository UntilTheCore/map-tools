/**
 * Type declarations for the Tianjing (天镜) platform Web Service API — the
 * server-side HTTP interfaces exposed under `/tianjing-server/mapdata-api`,
 * `/tianjing-server/lbs-api` and
 * `/tianjing-server/function-api/services/geometryUtilities/GeometryServer`.
 *
 * Unlike `@ym/minemap-types` (which declares the globally-injected `minemap`
 * SDK), this module has no global side effects: it is a plain ES module, so
 * consumers import exactly the shapes they need:
 *
 *   import type { DrivingRequest, DrivingResponse } from "@ym/minemap-types/service";
 *
 * Scope: the "数据服务 / 位置服务 / 功能服务" categories only (40 endpoints).
 * The platform's 出行服务 / 行业服务 categories are not covered.
 *
 * The upstream documentation is inconsistent about several field names (see
 * the `minemap-service` skill's per-page "注意事项与已知文档问题"). Where the
 * docs and the shipped response examples disagree, the examples win; every
 * such case is called out in a comment below.
 *
 * This package is self-contained and never depends on `@ym/map-tools`.
 */

/* ==================================================================== *
 * Shared primitives
 * ==================================================================== */

/** Developer application key. Required by every endpoint. */
export type ServiceKey = string;

/** `"longitude,latitude"`. Longitude first, comma-separated. */
export type CoordinateString = string;

/**
 * Multiple points / regions, per the LBS parameter conventions:
 * `,` separates the numbers inside one point, `;` separates points,
 * `|` separates regions or point groups.
 */
export type CoordinateListString = string;

/** Return format selector. Not every endpoint supports every value. */
export type ServiceFormat = "json" | "geojson" | "pbf" | "html";

/** Query parameters common to every endpoint. */
export interface ServiceBaseRequest {
  /** Developer application key. Required. */
  key: ServiceKey;
  /** Output format; each endpoint documents its own default. */
  f?: ServiceFormat;
  [param: string]: unknown;
}

/**
 * Status envelope shared by the 位置服务 endpoints. The business payload is
 * carried under an endpoint-specific key (`result`, `districts`, `data`,
 * `regeocodes`, ...), so concrete responses are built with
 * {@link LbsPayload} rather than with this interface directly.
 */
export interface LbsEnvelope {
  /** Integer status code: `0` means success, anything else is a failure. */
  code: number;
  /** Status message; carries the failure reason when `code` is non-zero. */
  msg: string;
}

/**
 * A 位置服务 response: the status envelope plus the payload under key `K`.
 *
 * ```ts
 * type DistrictResponse = LbsPayload<readonly District[], "districts">;
 * ```
 */
export type LbsPayload<T, K extends string> = LbsEnvelope & Record<K, T>;

/**
 * A 位置服务 response whose payload key is also present as a flat field.
 * Used by the POI search endpoints, which return `hits` / `features` inline.
 */
export type LbsResponse<T> = LbsEnvelope & T;

/**
 * Envelope used by the 功能服务 (geometry) endpoints.
 *
 * Note the version field is `TiantuMapServerVersion` here, whereas the
 * 数据服务 endpoints use `TianjingServerVersion`.
 */
export interface GeometryServiceResponse {
  TiantuMapServerVersion: string;
}

/** Envelope used by the 数据服务 endpoints. */
export interface DataServiceResponse {
  TianjingServerVersion: string;
}

/* ==================================================================== *
 * Geometry (Esri JSON, NOT GeoJSON)
 * ==================================================================== */

/**
 * Spatial reference, as used by 数据服务 and 功能服务.
 * `wkid` is the well-known ID (4326 = WGS84, 3857 = Web Mercator).
 */
export interface SpatialReference {
  wkid?: number;
  latestWkid?: number;
  [key: string]: unknown;
}

/** Axis-aligned extent in the service's coordinate system. */
export interface Extent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference?: SpatialReference;
}

/** Point geometry in Esri JSON form. */
export interface EsriPointGeometry {
  x: number;
  y: number;
  spatialReference?: SpatialReference;
}

/** Polygon geometry in Esri JSON form. `rings[ring][vertex] = [x, y]`. */
export interface EsriPolygonGeometry {
  rings: number[][][];
  spatialReference?: SpatialReference;
}

/** Polyline geometry in Esri JSON form. `paths[path][vertex] = [x, y]`. */
export interface EsriPolylineGeometry {
  paths: number[][][];
  spatialReference?: SpatialReference;
}

/** Any Esri JSON geometry accepted by the 功能服务 endpoints. */
export type EsriGeometry = EsriPointGeometry | EsriPolygonGeometry | EsriPolylineGeometry;

/** Geometry type discriminator returned alongside some results. */
export type EsriGeometryType =
  | "esriGeometryPoint"
  | "esriGeometryMultipoint"
  | "esriGeometryPolyline"
  | "esriGeometryPolygon"
  | "esriGeometryEnvelope"
  | (string & {});

/** Well-known IDs seen across the docs. */
export type WellKnownId = 4326 | 3857 | (number & {});

/**
 * Geometry parameter of the 功能服务 endpoints: either a bare geometry, a
 * list of geometries, or an envelope depending on the operation.
 */
export type GeometryInput = EsriGeometry | readonly EsriGeometry[];

/* ==================================================================== *
 * 数据服务 — Data services
 * ==================================================================== */

/** Common path/format parameters for the 数据服务 endpoints. */
export interface DataServiceRequest extends ServiceBaseRequest {
  /** Service directory name. Optional. */
  folderName?: string;
  /** Service name. Required. */
  serviceName?: string;
}

/** Vector tile service metadata (`.../VectorTileServer`). */
export interface VectorTileMetadata extends DataServiceResponse {
  name: string;
  capabilities: string;
  tileMap: string;
  defaultStyles: string;
  exportTilesAllowed: boolean;
  maxExportTilesCount: number;
  tiles: string[];
  spatialReference?: SpatialReference;
  initialExtent?: Extent;
  fullExtent?: Extent;
}

/**
 * Mapbox Style Specification document returned by the vector tile
 * `resources/styles` endpoint and by the map style service.
 */
export interface MapStyleSpec {
  version: number;
  name?: string;
  id?: string;
  sprite?: string;
  glyphs?: string;
  sources?: Record<string, unknown>;
  layers?: readonly unknown[];
  [key: string]: unknown;
}

/** Font metadata entry returned by the vector tile `resources/fonts` endpoint. */
export interface VectorTileFont {
  fontstack: string;
  range: string;
  [key: string]: unknown;
}

/** Sprite index returned by the vector tile `resources/sprites` endpoint. */
export type VectorTileSprite = Record<
  string,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    pixelRatio?: number;
  }
>;

/** Field definition inside a layer's field list. */
export interface LayerField {
  name: string;
  type: string;
  alias?: string;
  length?: number;
  editable?: boolean;
  nullable?: boolean;
  [key: string]: unknown;
}

/** Layer metadata shared by the map and feature service layer listings. */
export interface ServiceLayerInfo {
  id: number;
  title?: string;
  name: string;
  type?: string;
  geometryType?: EsriGeometryType | null;
  capabilities?: string;
  supportedQueryFormats?: string;
  allowGeometryUpdates?: boolean;
  defaultVisibility?: boolean;
  currentVersion?: number;
  maxRecordCount?: number;
  minScale?: number;
  maxScale?: number;
  fields?: readonly LayerField[];
  extent?: Extent;
  [key: string]: unknown;
}

/** Map service metadata (`.../MapServer`). */
export interface MapServiceInfo extends DataServiceResponse {
  name: string;
  maxInstances?: number;
  maxResults?: number;
  layers: readonly ServiceLayerInfo[];
  spatialReference?: SpatialReference;
  initialExtent?: Extent;
  fullExtent?: Extent;
  units?: string;
  [key: string]: unknown;
}

/** Feature service metadata (`.../FeatureServer`). */
export interface FeatureServiceInfo extends DataServiceResponse {
  name?: string;
  layers: readonly ServiceLayerInfo[];
  spatialReference?: SpatialReference;
  initialExtent?: Extent;
  fullExtent?: Extent;
  [key: string]: unknown;
}

/** One feature record returned by a query or record-detail endpoint. */
export interface FeatureRecord {
  geometry?: EsriGeometry | null;
  attributes: Record<string, unknown>;
  [key: string]: unknown;
}

/** Feature collection returned by the layer query endpoints. */
export interface FeatureQueryResult extends DataServiceResponse {
  spatialReference?: SpatialReference;
  geometryType?: EsriGeometryType;
  features: readonly FeatureRecord[];
  [key: string]: unknown;
}

/** Filter parameters accepted by the layer query endpoints. */
export interface FeatureQueryRequest extends DataServiceRequest {
  /** Query condition in ECQL syntax (GeoTools' SQL-like filter language). */
  where?: string;
  /** Comma-separated field list to return; `*` for all. */
  outFields?: string;
  /** Sort expression, e.g. `"OBJECTID DESC"`. */
  orderByFields?: string;
  /** Comma-separated record ids to restrict the query to. */
  objectIds?: string;
  /** Geometry filter, as an Esri JSON geometry (usually a string). */
  geometry?: string;
  geometryType?: EsriGeometryType;
  /** Spatial reference of the input geometry. */
  inSR?: WellKnownId;
  /** Spatial relation used when filtering by geometry. */
  spatialRel?: string;
  returnGeometry?: boolean;
  returnIdsOnly?: boolean;
  returnCountOnly?: boolean;
  returnDistinctValues?: boolean;
  [param: string]: unknown;
}

/** Result of `returnIdsOnly` / `returnCountOnly` queries. */
export interface FeatureQueryCountResult extends DataServiceResponse {
  objectIds?: readonly number[];
  count?: number;
  [key: string]: unknown;
}

/** Feature editing operation sent to `addFeatures` / `updateFeatures`. */
export interface FeatureEdit {
  geometry?: EsriGeometry;
  attributes: Record<string, unknown>;
}

/** `addFeatures` request body. */
export interface AddFeatureRecordsRequest extends DataServiceRequest {
  /** Feature records to insert, serialised as a JSON string. */
  features: readonly FeatureEdit[] | string;
  [param: string]: unknown;
}

/** `updateFeatures` request body. */
export interface UpdateFeatureRecordsRequest extends DataServiceRequest {
  /** Feature records to update, serialised as a JSON string. */
  features: readonly FeatureEdit[] | string;
  [param: string]: unknown;
}

/** `deleteFeatures` request body. */
export interface DeleteFeatureRecordsRequest extends DataServiceRequest {
  /** Record ids to delete. */
  objectIds: string;
  [param: string]: unknown;
}

/** `applyEdits` request body — batch of inserts, updates and deletes. */
export interface ApplyFeatureEditsRequest extends DataServiceRequest {
  adds?: readonly FeatureEdit[] | string;
  updates?: readonly FeatureEdit[] | string;
  deletes?: string;
  [param: string]: unknown;
}

/** Outcome of a single feature edit operation. */
export interface FeatureEditResult {
  objectId?: number;
  globalId?: string;
  success: boolean;
  error?: { code?: number; description?: string };
  [key: string]: unknown;
}

/** Result envelope of the feature editing endpoints. */
export interface FeatureEditResponse extends DataServiceResponse {
  addResults?: readonly FeatureEditResult[];
  updateResults?: readonly FeatureEditResult[];
  deleteResults?: readonly FeatureEditResult[];
  [key: string]: unknown;
}

/* ==================================================================== *
 * 位置服务 — Location services
 * ==================================================================== */

/** Pagination parameters shared by the POI search endpoints. */
export interface PagedRequest {
  /** Page size. Default 20, maximum 20. */
  pageSize?: number;
  /** Zero-based page number. Default 0. */
  pageNum?: number;
  [param: string]: unknown;
}

/* --- 行政区划查询 --- */

/** Request of the administrative district query (`place/v2/district`). */
export interface DistrictRequest extends ServiceBaseRequest {
  /** Fuzzy-matched district name. Optional. */
  keywords?: string;
  /** Number of sub-levels to return (0-3); currently only down to district level. */
  subdistrict?: number;
  /** Zero-based page number. Default 0. */
  page?: number;
  /** Page size. Default 20, maximum 20. */
  pageSize?: number;
  /**
   * `base` omits boundary coordinates; `all` returns the boundary of the
   * queried district only (not of its children). Default `base`.
   */
  extensions?: "base" | "all";
  /**
   * Restrict the search to one administrative division, given as an adcode.
   * Strongly recommended by the vendor to keep results correct.
   */
  filterAdcode?: string;
}

/** One administrative division record. */
export interface District {
  province_code?: string;
  city_code?: string;
  district_code?: string;
  /** 12-digit full administrative code. */
  area_code?: string;
  dialing_code?: string;
  zip_code?: string;
  name: string;
  short_name?: string;
  /** Alternative names, separated by semicolons. */
  alias?: string;
  /** Boundary as a WKT polygon string; only with `extensions=all`. */
  polygon?: string;
  /** Center point, `"longitude,latitude"`. */
  center?: string;
  level?: "province" | "city" | "district" | "street" | "village";
  children?: readonly District[];
  [key: string]: unknown;
}

/** Response of the administrative district query. */
export type DistrictResponse = LbsPayload<readonly District[], "districts">;

/* --- 逆行政区划查询 --- */

/** Request of the reverse district query (`place/v2/reverse/district`). */
export interface ReverseDistrictRequest extends ServiceBaseRequest {
  /** Point to look up, `"longitude,latitude"`. Required. */
  location: CoordinateString;
  /** `02` = GCJ02, `84` = WGS84 (GPS). Default `84`. */
  coordtype?: "02" | "84";
  /** `all` returns the boundary of the located division. Default `base`. */
  extensions?: "base" | "all";
  /** Which administrative level's boundary to return. */
  district?: "province" | "city" | "district";
}

/** Administrative division resolved from a coordinate. */
export interface ReverseDistrict {
  province?: string;
  province_code?: string;
  city?: string;
  city_code?: string;
  district?: string;
  district_code?: string;
  /** Boundary as a WKT polygon string. */
  polygon?: string;
  [key: string]: unknown;
}

/** Response of the reverse district query. */
export type ReverseDistrictResponse = LbsPayload<ReverseDistrict, "district">;

/* --- 地理编码 / 逆地理编码 --- */

/** Request of the geocoding endpoint (`geocoding/geo`). */
export interface GeocodingRequest extends ServiceBaseRequest {
  /** Structured address. Required. */
  address: string;
  /**
   * Restrict the search to a city: Chinese name, full pinyin, citycode or
   * adcode. County-level cities are not supported.
   */
  city?: string;
}

/** Result of a geocoding lookup. */
export interface GeocodingResult {
  /** Structured address. The docs spell this `Formatted_addres`; responses use `formatted_address`. */
  formatted_address?: string;
  country?: string;
  province?: string;
  city?: string;
  citycode?: string;
  district?: string;
  adcode?: string;
  street?: string;
  town?: string;
  village?: string;
  road?: string;
  number?: string;
  building?: string;
  /** `"longitude,latitude"`. */
  location?: CoordinateString;
  level?: string;
  confidence?: number;
  similarity?: number;
  [key: string]: unknown;
}

/** Response of the geocoding endpoint. */
export type GeocodingResponse = LbsPayload<GeocodingResult, "data">;

/** Request of the reverse geocoding endpoint (`geocoding/regeo`). */
export interface ReverseGeocodingRequest extends ServiceBaseRequest {
  /**
   * One or more points, `"longitude,latitude"`, `;`-separated, up to 10.
   * The docs render the separator with spaces (`' , '`); the actual
   * separator is a bare comma.
   */
  locations: CoordinateListString;
  /** Restrict the returned nearby POI types. */
  poitypes?: string;
  /**
   * `base` returns the structured address only; combine any of
   * `aoi,poi,road,roadinter` (comma-separated) or `all` for more.
   */
  extensions?: string;
  /** Nearby search radius in metres, 0-3000. Default 1000. */
  radius?: number;
  /** `1` filters out non-arterial roads. Default 1. */
  roadlevel?: 0 | 1;
  /** POI ordering: `weight` or `distance`. */
  orderby?: "weight" | "distance";
}

/** Address components returned by reverse geocoding. */
export interface AddressComponent {
  /** `"longitude,latitude"`. */
  location?: CoordinateString;
  country?: string;
  province?: string;
  city?: string;
  citycode?: string;
  district?: string;
  adcode?: string;
  street?: string;
  town?: string;
  village?: string;
  road?: string;
  number?: string;
  building?: string;
  [key: string]: unknown;
}

/** A POI entry returned by reverse geocoding and the search endpoints. */
export interface Poi {
  /** Unique POI id. */
  id?: string;
  uuid?: string;
  name?: string;
  type?: string;
  tel?: string;
  address?: string;
  /** Bearing relative to the queried point. */
  direction?: string;
  /** Distance from the queried point, in metres. */
  distance?: number;
  province?: string;
  city?: string;
  adminname?: string;
  admincode?: string;
  town?: string;
  village?: string;
  /** Feature kind, e.g. `"poi"`. */
  feature_type?: string;
  /** Human-readable feature level, e.g. `"兴趣点"`. */
  level?: string;
  /** Match similarity, 0-1. */
  similarity?: number;
  /** WKT geometry string. */
  geometry?: string;
  location?: { lng: number; lat: number };
  [key: string]: unknown;
}

/** An AOI (area of interest) entry. */
export interface Aoi {
  id?: string;
  name?: string;
  type?: string;
  direction?: string;
  distance?: number;
  location?: CoordinateString;
  [key: string]: unknown;
}

/** A road entry returned by reverse geocoding. */
export interface Road {
  id?: string;
  name?: string;
  direction?: string;
  distance?: number;
  location?: CoordinateString;
  [key: string]: unknown;
}

/** A road intersection entry returned by reverse geocoding. */
export interface RoadInter {
  id?: string;
  first_name?: string;
  second_name?: string;
  direction?: string;
  distance?: number;
  location?: CoordinateString;
  [key: string]: unknown;
}

/** One reverse-geocoding result. */
export interface ReverseGeocodingResult {
  /** Structured address. Responses use `formatted_address` (docs say `Formatted_addres`). */
  formatted_address?: string;
  /** Address components; responses use `addressComponent` (docs say `address_component`). */
  addressComponent?: AddressComponent;
  address_component?: AddressComponent;
  pois?: readonly Poi[];
  aois?: readonly Aoi[];
  roads?: readonly Road[];
  roadinters?: readonly RoadInter[];
  [key: string]: unknown;
}

/** Response of the reverse geocoding endpoint. */
export type ReverseGeocodingResponse = LbsPayload<readonly ReverseGeocodingResult[], "regeocodes">;

/* --- 地点输入提示 / 地名综合查询 --- */

/** Request of the suggestion endpoint (`integrated/v2/suggestion`). */
export interface SuggestionRequest extends ServiceBaseRequest {
  /** Query keyword. Required. */
  keywords: string;
  /** POI category names or codes; prefer codes. `|`- or space-separated. */
  types?: string;
  /** Restrict results to this administrative division name. */
  region?: string;
  /** Whether to filter by administrative division. Default false. */
  limitRegion?: boolean;
}

/** Response of the suggestion endpoint. */
export type SuggestionResponse = LbsPayload<readonly Poi[], "data">;

/** Request of the keyword POI search (`integrated/v2/keywords`). */
export interface KeywordsRequest extends ServiceBaseRequest, PagedRequest {
  /** Query keyword; either this or `types` is required. */
  keywords?: string;
  /** POI category names or codes; prefer codes. `|`- or space-separated. */
  types?: string;
  /** Reference point, `"longitude,latitude"`. */
  location?: CoordinateString;
  /** Restrict results to this administrative division name. */
  region?: string;
  /** Whether to filter by administrative division. Default false. */
  limitRegion?: boolean;
}

/** Response of the keyword POI search. */
export interface PoiSearchResult {
  /** Total number of matches. */
  hits: number;
  features: readonly Poi[];
}

/** Response of the keyword POI search. */
export type KeywordsResponse = LbsResponse<PoiSearchResult>;

/* --- 周边 / 多边形 / 沿线综合搜索 --- */

/** Request of the nearby POI search (`integrated/v2/around`). */
export interface AroundRequest extends ServiceBaseRequest, PagedRequest {
  /** Query keyword; either this or `types` is required. */
  keywords?: string;
  /** POI category names or codes; prefer codes. */
  types?: string;
  /** Center point, `"longitude,latitude"`. Required. */
  location: CoordinateString;
  /** Search radius in metres. Default 1000. */
  radius?: number;
  /** Restrict results to this administrative division name. */
  region?: string;
  /** Whether to filter by administrative division. Default false. */
  limitRegion?: boolean;
}

/** Response of the nearby POI search. */
export type AroundResponse = KeywordsResponse;

/** Request of the polygon POI search (`integrated/v2/polygon`). */
export interface PolygonSearchRequest extends ServiceBaseRequest, PagedRequest {
  /** Query keyword; either this or `types` is required. */
  keywords?: string;
  types?: string;
  /**
   * Area to search. Accepts WKT (`POLYGON` / `MULTIPOLYGON`), a coordinate
   * string (`;`-separated points whose first and last point must match), or
   * `BBOX[xmin,ymin,xmax,ymax]`. Required.
   */
  polygon: string;
}

/** Response of the polygon POI search. */
export type PolygonSearchResponse = KeywordsResponse;

/** Request of the line POI search (`integrated/v2/line`). */
export interface LineSearchRequest extends ServiceBaseRequest, PagedRequest {
  /** Query keyword; either this or `types` is required. */
  keywords?: string;
  types?: string;
  /**
   * Line to search along. Accepts WKT (`POLYLINE` / `MULTIPOLYLINE`) or a
   * coordinate string whose first and last point must match. Required.
   */
  line: string;
  /** Search range along the line, in metres. Default 1000. */
  distance?: number;
}

/** Response of the line POI search. */
export type LineSearchResponse = KeywordsResponse;

/* --- 路径规划 --- */

/** Driving strategy. The parameter table documents only 0/2/4/5. */
export type DrivingStrategy = 0 | 1 | 2 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Vehicle type, which affects traffic restrictions. */
export type CarType = 0 | 1 | 2;

/** Request of the driving route endpoint (`route/v2/driving`). */
export interface DrivingRequest extends ServiceBaseRequest {
  /** Origin, `"longitude,latitude"`. Required. */
  origin: CoordinateString;
  /** Destination, `"longitude,latitude"`. Required. */
  destination: CoordinateString;
  /** Heading at the origin, 0-359. */
  heading?: number;
  /**
   * Avoid areas: up to 32 areas with at most 16 vertices each. `,` separates
   * longitude/latitude, `;` separates points, `|` separates areas.
   */
  avoidpolygons?: string;
  /**
   * Avoid points: `lng,lat;radius` (radius in metres), `|`-separated, up to
   * 32 points with a radius of at most 5 km.
   */
  avoidpoints?: string;
  /** Waypoints, `;`-separated, up to 50 points. Visited in input order. */
  waypoints?: string;
  /** Routing strategy. */
  strategy?: DrivingStrategy;
  /** `0` allows ferries (default), `1` avoids them. */
  ferry?: 0 | 1;
  /** `0` returns one route (default), `1` returns up to three. */
  alternatives?: 0 | 1;
  /** Vehicle type, affecting restriction rules. */
  cartype?: CarType;
  /** Licence plate, used for traffic-restriction handling. */
  plate_number?: string;
  /** `1` includes per-link detail (link id, speed). Default 0. */
  linkinfo?: 0 | 1;
}

/** Request of the walking route endpoint (`route/v2/walking`). */
export interface WalkingRequest extends ServiceBaseRequest {
  origin: CoordinateString;
  destination: CoordinateString;
  alternatives?: 0 | 1;
}

/** Request of the bicycling route endpoint (`route/v2/bicycling`). */
export interface BicyclingRequest extends ServiceBaseRequest {
  origin: CoordinateString;
  destination: CoordinateString;
  alternatives?: 0 | 1;
}

/** Request of the transit route endpoint (`route/v2/transit`). */
export interface TransitRequest extends ServiceBaseRequest {
  origin: CoordinateString;
  destination: CoordinateString;
  alternatives?: 0 | 1;
}

/** Per-link detail of a route step, returned when `linkinfo=1`. */
export interface RouteLinkInfo {
  linkid: number;
  /** Current traffic speed on the link. */
  traffic_speeds?: number;
  /** Link geometry as a WKT string. */
  link_points?: string;
  [key: string]: unknown;
}

/** One segment of a planned route. */
export interface RouteStep {
  /** Index of the waypoint segment this step belongs to, starting at 0. */
  waypointsIdx: number;
  distance: number;
  /** Approximate duration of the segment, in milliseconds. */
  time_ms: number;
  roadname?: string;
  /** Direction of travel onto the road, e.g. 东 / 东南. */
  orientation?: string;
  /** Turn-by-turn instruction text. */
  instruction?: string;
  /** Primary manoeuvre code (0-16). */
  action?: number;
  /** Auxiliary manoeuvre code (0-31). */
  assistantAction?: number | string;
  /** Segment geometry as a coordinate string. */
  polyline?: string;
  /** Segment geometry as a WKT string. */
  polylineGeom?: string;
  linkinfo?: readonly RouteLinkInfo[];
  [key: string]: unknown;
}

/** One planned route. */
export interface Route {
  strategy: number;
  /** Total distance in metres. */
  distance: number;
  /** Total duration in seconds. */
  duration: number;
  /** Tolls in yuan. */
  tolls?: number;
  /** Toll-road distance in metres. */
  tollDistance?: number;
  /** Number of traffic lights. */
  trafficLights?: number;
  /**
   * Restriction status: `0` no restricted city on the route, `1` route
   * passes a restricted city, `2` plate avoided the restriction,
   * `3` restriction cannot be avoided.
   */
  restriction?: 0 | 1 | 2 | 3;
  /** Route geometry as a WKT `LINESTRING`. */
  routeLine: string;
  steps: readonly RouteStep[];
  [key: string]: unknown;
}

/** Payload shared by all route-planning responses. */
export interface RouteResult {
  count: number;
  routes: readonly Route[];
  [key: string]: unknown;
}

/** Response of the driving route endpoint. */
export type DrivingResponse = LbsPayload<RouteResult, "result">;

/** Response of the walking route endpoint. */
export type WalkingResponse = LbsPayload<RouteResult, "result">;

/** Response of the bicycling route endpoint. */
export type BicyclingResponse = LbsPayload<RouteResult, "result">;

/** Response of the transit route endpoint. */
export type TransitResponse = LbsPayload<RouteResult, "result">;

/* ==================================================================== *
 * 功能服务 — Geometry utility services
 * ==================================================================== */

/** Common parameters of the geometry utility endpoints. */
export interface GeometryRequest extends ServiceBaseRequest {
  /** Input coordinate system. */
  inSR?: WellKnownId | string;
  /** Output coordinate system. */
  outSR?: WellKnownId | string;
  /** Coordinate system of the supplied geometry. */
  sr?: WellKnownId | string;
}

/* --- 坐标转换 / 坐标投影 --- */

/** Request of the coordinate projection endpoint (`project`). */
export interface ProjectRequest extends GeometryRequest {
  geometries: readonly EsriGeometry[];
}

/** Response of the coordinate projection endpoint. */
export interface ProjectResponse extends GeometryServiceResponse {
  geometries: readonly EsriGeometry[];
}

/** Alias of {@link ProjectRequest}: the docs document this twice. */
export type CoordinateConversionRequest = ProjectRequest;
/** Alias of {@link ProjectResponse}: the docs document this twice. */
export type CoordinateConversionResponse = ProjectResponse;

/* --- 测量类 --- */

/** Request of the area/perimeter endpoint (`areasAndLengths`). */
export interface AreasAndLengthsRequest extends GeometryRequest {
  polygons: readonly EsriPolygonGeometry[];
}

/** Response of the area/perimeter endpoint. */
export interface AreasAndLengthsResponse extends GeometryServiceResponse {
  /** Areas, one per input polygon. */
  areas: readonly number[];
  /** Perimeters, one per input polygon. */
  lengths: readonly number[];
}

/** Request of the polyline length endpoint (`lengths`). */
export interface LengthsRequest extends GeometryRequest {
  polylines: readonly EsriPolylineGeometry[];
}

/** Response of the polyline length endpoint. */
export interface LengthsResponse extends GeometryServiceResponse {
  /** Lengths, one per input polyline. */
  lengths: readonly number[];
}

/** Request of the distance endpoint (`distance`). */
export interface DistanceRequest extends GeometryRequest {
  /** Start point. Required. */
  geometry1: EsriPointGeometry;
  /** End point. Required. */
  geometry2: EsriPointGeometry;
}

/** Response of the distance endpoint. */
export interface DistanceResponse extends GeometryServiceResponse {
  /** Distance in the units of the supplied coordinate system. */
  distance: number;
}

/** Request of the label point endpoint (`labelPoints`). */
export interface LabelPointsRequest extends GeometryRequest {
  polygons: readonly EsriPolygonGeometry[];
}

/** Response of the label point endpoint. */
export interface LabelPointsResponse extends GeometryServiceResponse {
  /** Candidate label points, one per input polygon. */
  labelPoints: readonly EsriPointGeometry[];
}

/* --- 空间关系 --- */

/** Request of the spatial relation endpoint (`relation`). */
export interface RelationRequest extends GeometryRequest {
  geometries1: readonly EsriGeometry[];
  geometries2: readonly EsriGeometry[];
  /** Assertion relation to test, e.g. `"Cross"`. Required. */
  relation: string;
  /** Extra parameter for the relation, when the relation requires one. */
  relationParam?: string;
}

/** One matched pair of geometries. */
export interface RelationResult {
  geometry1Index: number;
  geometry2Index: number;
  [key: string]: unknown;
}

/** Response of the spatial relation endpoint. */
export interface RelationResponse extends GeometryServiceResponse {
  relations: readonly RelationResult[];
}

/* --- 几何运算 --- */

/** Request of the buffer endpoint (`buffer`). */
export interface BufferRequest extends GeometryRequest {
  geometries: readonly EsriGeometry[];
  /** Buffer distance. Required. */
  distances: number;
  /** Distance unit; the docs do not enumerate the accepted values. */
  unit?: string;
  /** Whether to dissolve overlapping buffers. Required. Default false. */
  unionResults: boolean;
}

/** Response of the buffer endpoint. */
export interface BufferResponse extends GeometryServiceResponse {
  geometries: readonly EsriPolygonGeometry[];
}

/** Request of the convex hull endpoint (`convexHull`). */
export interface ConvexHullRequest extends ServiceBaseRequest {
  geometries: readonly EsriGeometry[];
}

/** Response of the convex hull endpoint. */
export interface ConvexHullResponse extends GeometryServiceResponse {
  geometry: EsriPolygonGeometry;
  geometryType?: EsriGeometryType;
}

/** Request of the cut endpoint (`cut`). */
export interface CutRequest extends ServiceBaseRequest {
  /** Polygon to be cut. Required. */
  target: readonly EsriPolygonGeometry[];
  /** Cutting line. Required. */
  cutter: EsriPolylineGeometry;
}

/** Response of the cut endpoint. */
export interface CutResponse extends GeometryServiceResponse {
  geometries: readonly EsriPolygonGeometry[];
}

/** Request of the densify endpoint (`densify`). */
export interface DensifyRequest extends ServiceBaseRequest {
  geometries: readonly EsriGeometry[];
  /** Maximum segment length; smaller values insert more vertices. Required. */
  maxSegmentLength: number;
}

/** Response of the densify endpoint. */
export interface DensifyResponse extends GeometryServiceResponse {
  geometries: readonly EsriGeometry[];
}

/** Request of the difference endpoint (`difference`). */
export interface DifferenceRequest extends ServiceBaseRequest {
  /** Target geometry. */
  geometries: readonly EsriGeometry[];
  /** Geometry to subtract. */
  geometry: EsriGeometry;
}

/** Response of the difference endpoint. */
export interface DifferenceResponse extends GeometryServiceResponse {
  geometries: readonly EsriGeometry[];
}

/** Request of the generalize endpoint (`generalize`). */
export interface GeneralizeRequest extends ServiceBaseRequest {
  geometries: readonly EsriGeometry[];
  /** Maximum allowed deviation. */
  maxDeviation: number;
}

/** Response of the generalize endpoint. */
export interface GeneralizeResponse extends GeometryServiceResponse {
  geometries: readonly EsriGeometry[];
}

/** Request of the intersect endpoint (`intersect`). */
export interface IntersectRequest extends ServiceBaseRequest {
  geometries: readonly EsriGeometry[];
  geometry: EsriGeometry;
}

/** Response of the intersect endpoint. */
export interface IntersectResponse extends GeometryServiceResponse {
  geometries: readonly EsriGeometry[];
}

/** Request of the reshape endpoint (`reshape`). */
export interface ReshapeRequest extends ServiceBaseRequest {
  target: readonly EsriPolygonGeometry[];
  /** Reshaping geometry. Required. */
  reshaper: EsriPolylineGeometry;
}

/** Response of the reshape endpoint. */
export interface ReshapeResponse extends GeometryServiceResponse {
  geometry: EsriPolygonGeometry;
  geometryType?: EsriGeometryType;
}

/** Request of the simplify endpoint (`simplify`). */
export interface SimplifyRequest extends GeometryRequest {
  geometries: readonly EsriGeometry[];
  /** Simplification tolerance; larger values simplify more. */
  tolerance?: number;
}

/** Response of the simplify endpoint. */
export interface SimplifyResponse extends GeometryServiceResponse {
  geometries: readonly EsriGeometry[];
}

/** Request of the trim/extend endpoint (`trimExtend`). */
export interface TrimExtendRequest extends ServiceBaseRequest {
  /** Lines to trim or extend. Required. */
  polylines: readonly EsriPolylineGeometry[];
  /** Line to trim or extend to. Required. */
  trimExtendTo: EsriPolylineGeometry;
}

/** Response of the trim/extend endpoint. */
export interface TrimExtendResponse extends GeometryServiceResponse {
  geometries: readonly EsriPolylineGeometry[];
}

/** Request of the union endpoint (`union`). */
export interface UnionRequest extends ServiceBaseRequest {
  geometries: readonly EsriGeometry[];
}

/** Response of the union endpoint. */
export interface UnionResponse extends GeometryServiceResponse {
  geometry: EsriGeometry;
  geometryType?: EsriGeometryType;
}

/* ==================================================================== *
 * Endpoint surface
 * ==================================================================== */

/**
 * Base paths of the three service categories, as literal types.
 *
 * The host is deployment-specific (e.g. `gmap.cqphx.cn:4443`); these cover
 * only the documented path portion, which is what varies per endpoint.
 */
export type DataServiceBasePath = "/tianjing-server/mapdata-api/services";
export type LocationServiceBasePath = "/tianjing-server/lbs-api";
export type FunctionServiceBasePath =
  "/tianjing-server/function-api/services/geometryUtilities/GeometryServer";

/** Union of the three base paths. */
export type ServiceBasePath =
  DataServiceBasePath | LocationServiceBasePath | FunctionServiceBasePath;

/** Endpoint name union for the 功能服务 geometry operations. */
export type GeometryOperation =
  | "project"
  | "areasAndLengths"
  | "lengths"
  | "distance"
  | "labelPoints"
  | "relation"
  | "buffer"
  | "convexHull"
  | "cut"
  | "densify"
  | "difference"
  | "generalize"
  | "intersect"
  | "reshape"
  | "simplify"
  | "trimExtend"
  | "union";

/** Endpoint name union for the 位置服务 LBS operations. */
export type LbsOperation =
  | "place/v2/district"
  | "place/v2/reverse/district"
  | "geocoding/geo"
  | "geocoding/regeo"
  | "integrated/v2/suggestion"
  | "integrated/v2/keywords"
  | "integrated/v2/around"
  | "integrated/v2/polygon"
  | "integrated/v2/line"
  | "route/v2/driving"
  | "route/v2/walking"
  | "route/v2/bicycling"
  | "route/v2/transit";

/** Endpoint name union for the 数据服务 map data operations. */
export type MapDataOperation =
  | "VectorTileServer"
  | "MapServer"
  | "FeatureServer"
  | "Cesium3DTileServer"
  | "CesiumTerrainTileServer"
  | "RasterDemTileServer"
  | "Physic3DModelServer"
  | "MapStyleServer";

export {};
