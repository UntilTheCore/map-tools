/**
 * Smoke test for the `/service` subpath (Tianjing Web Service API types).
 *
 * Mirrors `consumer.ts`: it exercises the exported surface so that a broken
 * declaration fails `pnpm --filter @ym/minemap-types typecheck`. Nothing here
 * runs — every value is a type-level construction or a `declare`d binding.
 */
import type {
  AddFeatureRecordsRequest,
  ApplyFeatureEditsRequest,
  AroundRequest,
  AroundResponse,
  AreasAndLengthsRequest,
  AreasAndLengthsResponse,
  BufferRequest,
  BufferResponse,
  CoordinateString,
  CutRequest,
  DeleteFeatureRecordsRequest,
  DensifyRequest,
  DifferenceRequest,
  DistanceResponse,
  DistrictRequest,
  DistrictResponse,
  DrivingRequest,
  DrivingResponse,
  EsriGeometry,
  EsriPolygonGeometry,
  EsriPolylineGeometry,
  FeatureEditResponse,
  FeatureQueryRequest,
  FeatureQueryResult,
  FeatureServiceInfo,
  FunctionServiceBasePath,
  GeocodingRequest,
  GeocodingResponse,
  GeometryOperation,
  GeneralizeRequest,
  IntersectRequest,
  KeywordsRequest,
  KeywordsResponse,
  LbsOperation,
  LbsPayload,
  LengthsResponse,
  LineSearchRequest,
  LineSearchResponse,
  MapDataOperation,
  MapServiceInfo,
  MapStyleSpec,
  PolygonSearchRequest,
  PolygonSearchResponse,
  ProjectRequest,
  ProjectResponse,
  PoiSearchResult,
  RelationRequest,
  RelationResponse,
  ReshapeRequest,
  ReverseDistrictRequest,
  ReverseDistrictResponse,
  ReverseGeocodingRequest,
  ReverseGeocodingResponse,
  Route,
  RouteStep,
  SimplifyRequest,
  SuggestionRequest,
  SuggestionResponse,
  TransitRequest,
  TransitResponse,
  TrimExtendRequest,
  UnionRequest,
  UnionResponse,
  UpdateFeatureRecordsRequest,
  VectorTileMetadata,
  WalkingRequest,
  WalkingResponse,
} from "../service.js";

/* ------------------------------------------------------------------ *
 * Shared primitives
 * ------------------------------------------------------------------ */

const point: CoordinateString = "108.94,34.22";
const key = "app-key";

/* ------------------------------------------------------------------ *
 * 位置服务 — requests
 * ------------------------------------------------------------------ */

const districtReq: DistrictRequest = {
  key,
  keywords: "山东省",
  subdistrict: 1,
  page: 0,
  pageSize: 20,
  extensions: "base",
  filterAdcode: "37",
};

const reverseDistrictReq: ReverseDistrictRequest = {
  key,
  location: point,
  coordtype: "84",
  extensions: "all",
  district: "district",
};

const geocodingReq: GeocodingRequest = { key, address: "北京市朝阳区阜通东大街6号", city: "北京" };

const reverseGeocodingReq: ReverseGeocodingRequest = {
  key,
  locations: "108.94,34.22;108.95,34.23",
  extensions: "poi,road",
  radius: 1000,
  roadlevel: 1,
  orderby: "distance",
};

const suggestionReq: SuggestionRequest = {
  key,
  keywords: "万达",
  types: "060100",
  region: "西安市",
  limitRegion: true,
};

const keywordsReq: KeywordsRequest = {
  key,
  keywords: "医院",
  location: point,
  pageSize: 20,
  pageNum: 0,
};

const aroundReq: AroundRequest = { key, keywords: "药店", location: point, radius: 3000 };

const polygonReq: PolygonSearchRequest = {
  key,
  keywords: "学校",
  polygon: "BBOX[108.9,34.2,109.0,34.3]",
};

const lineReq: LineSearchRequest = {
  key,
  keywords: "加油站",
  line: "108.94,34.22;108.95,34.23",
  distance: 1000,
};

const drivingReq: DrivingRequest = {
  key,
  origin: "108.94,34.22",
  destination: "108.95,34.23",
  heading: 90,
  avoidpolygons: "108.9,34.2;108.91,34.21|108.92,34.22;108.93,34.23",
  avoidpoints: "108.94,34.22;500",
  waypoints: "108.945,34.225",
  strategy: 5,
  ferry: 1,
  alternatives: 1,
  cartype: 0,
  plate_number: "陕A12345",
  linkinfo: 1,
};

const walkingReq: WalkingRequest = { key, origin: "108.94,34.22", destination: "108.95,34.23" };
const transitReq: TransitRequest = { key, origin: "108.94,34.22", destination: "108.95,34.23" };

void [
  districtReq,
  reverseDistrictReq,
  geocodingReq,
  reverseGeocodingReq,
  suggestionReq,
  keywordsReq,
  aroundReq,
  polygonReq,
  lineReq,
  drivingReq,
  walkingReq,
  transitReq,
];

/* ------------------------------------------------------------------ *
 * 位置服务 — responses
 * ------------------------------------------------------------------ */

declare const districtRes: DistrictResponse;
const districtLevel: string | undefined = districtRes.districts[0]?.level;
const districtChildren = districtRes.districts[0]?.children;
const districtStatus: number = districtRes.code;
void [districtLevel, districtChildren, districtStatus];

declare const reverseDistrictRes: ReverseDistrictResponse;
const rdPolygon: string | undefined = reverseDistrictRes.district.polygon;
void rdPolygon;

declare const geocodingRes: GeocodingResponse;
const geoLocation: string | undefined = geocodingRes.data.location;
const geoConfidence: number | undefined = geocodingRes.data.confidence;
void [geoLocation, geoConfidence];

declare const reverseGeocodingRes: ReverseGeocodingResponse;
const rgFirst = reverseGeocodingRes.regeocodes[0];
const rgPois = rgFirst?.pois;
const rgPoiName: string | undefined = rgPois?.[0]?.name;
const rgRoads = rgFirst?.roads;
void [rgPoiName, rgRoads];

declare const suggestionRes: SuggestionResponse;
const suggestionUuid: string | undefined = suggestionRes.data[0]?.uuid;
void suggestionUuid;

declare const keywordsRes: KeywordsResponse;
const keywordHits: number = keywordsRes.hits;
const keywordFeatures = keywordsRes.features;
void [keywordHits, keywordFeatures];

declare const aroundRes: AroundResponse;
const aroundHits: number = aroundRes.hits;
void aroundHits;

declare const polygonRes: PolygonSearchResponse;
const polygonHits: number = polygonRes.hits;
void polygonHits;

declare const lineRes: LineSearchResponse;
const lineHits: number = lineRes.hits;
void lineHits;

declare const drivingRes: DrivingResponse;
const route: Route | undefined = drivingRes.result.routes[0];
const routeDistance: number | undefined = route?.distance;
const routeWkt: string | undefined = route?.routeLine;
const step: RouteStep | undefined = route?.steps[0];
const stepInstruction: string | undefined = step?.instruction;
const stepLinks = step?.linkinfo;
void [routeDistance, routeWkt, stepInstruction, stepLinks];

declare const walkingRes: WalkingResponse;
const walkingCount: number = walkingRes.result.count;
void walkingCount;

declare const transitRes: TransitResponse;
const transitCount: number = transitRes.result.count;
void transitCount;

/* ------------------------------------------------------------------ *
 * 数据服务
 * ------------------------------------------------------------------ */

declare const vectorTile: VectorTileMetadata;
const tileUrl: string = vectorTile.tiles[0]!;
const tileWkid: number | undefined = vectorTile.spatialReference?.wkid;
void [tileUrl, tileWkid];

declare const mapService: MapServiceInfo;
const layerCount: number = mapService.layers.length;
const firstLayerName: string = mapService.layers[0]!.name;
const firstLayerType: string | undefined = mapService.layers[0]!.geometryType ?? undefined;
void [layerCount, firstLayerName, firstLayerType];

declare const featureService: FeatureServiceInfo;
const fsLayerCount: number = featureService.layers.length;
void fsLayerCount;

const style: MapStyleSpec = { version: 8, name: "demo", layers: [], sources: {} };
void style.version;

const queryReq: FeatureQueryRequest = {
  key,
  folderName: "services",
  serviceName: "jiangbei",
  where: "OBJECTID > 0",
  outFields: "*",
  geometry: '{"x":114.2,"y":30.5}',
  geometryType: "esriGeometryPoint",
  inSR: 4326,
  returnGeometry: true,
  returnCountOnly: false,
};

const addReq: AddFeatureRecordsRequest = { key, features: [{ attributes: { name: "a" } }] };
const updateReq: UpdateFeatureRecordsRequest = {
  key,
  features: [{ attributes: { OBJECTID: 1, name: "b" } }],
};
const deleteReq: DeleteFeatureRecordsRequest = { key, objectIds: "1,2,3" };
const applyReq: ApplyFeatureEditsRequest = { key, adds: [], updates: [], deletes: "" };
void [queryReq, addReq, updateReq, deleteReq, applyReq];

declare const queryRes: FeatureQueryResult;
const featureCount: number = queryRes.features.length;
void featureCount;

declare const editRes: FeatureEditResponse;
const editOk: boolean | undefined = editRes.addResults?.[0]?.success;
void editOk;

/* ------------------------------------------------------------------ *
 * 功能服务
 * ------------------------------------------------------------------ */

const ring: EsriPolygonGeometry = {
  rings: [
    [
      [1.19e7, 3.37e6],
      [1.19e7, 3.38e6],
      [1.18e7, 3.37e6],
      [1.19e7, 3.37e6],
    ],
  ],
};
const path: EsriPolylineGeometry = {
  paths: [
    [
      [1.19e7, 3.37e6],
      [1.19e7, 3.38e6],
    ],
  ],
};
const geom: EsriGeometry = ring;
void geom;

const projectReq: ProjectRequest = {
  key,
  geometries: [ring],
  inSR: 3857,
  outSR: 4326,
  f: "json",
};
const areasReq: AreasAndLengthsRequest = { key, polygons: [ring] };
void areasReq;
const bufferReq: BufferRequest = {
  key,
  geometries: [ring],
  distances: 100,
  unit: "Meters",
  unionResults: true,
};
const cutReq: CutRequest = { key, target: [ring], cutter: path };
const densifyReq: DensifyRequest = { key, geometries: [ring], maxSegmentLength: 300 };
const differenceReq: DifferenceRequest = { key, geometries: [ring], geometry: path };
const generalizeReq: GeneralizeRequest = { key, geometries: [ring], maxDeviation: 1 };
const intersectReq: IntersectRequest = { key, geometries: [ring], geometry: path };
const reshapeReq: ReshapeRequest = { key, target: [ring], reshaper: path };
const simplifyReq: SimplifyRequest = { key, geometries: [ring], tolerance: 10 };
const trimReq: TrimExtendRequest = { key, polylines: [path], trimExtendTo: path };
const unionReq: UnionRequest = { key, geometries: [ring, ring] };
const relationReq: RelationRequest = {
  key,
  geometries1: [ring],
  geometries2: [ring],
  relation: "Cross",
  relationParam: "",
};
void [
  projectReq,
  bufferReq,
  cutReq,
  densifyReq,
  differenceReq,
  generalizeReq,
  intersectReq,
  reshapeReq,
  simplifyReq,
  trimReq,
  unionReq,
  relationReq,
];

declare const projectRes: ProjectResponse;
const projected: EsriGeometry | undefined = projectRes.geometries[0];
const projectVersion: string = projectRes.TiantuMapServerVersion;
void [projected, projectVersion];

declare const bufferRes: BufferResponse;
const bufferRings: number[][][] | undefined = bufferRes.geometries[0]?.rings;
void bufferRings;

declare const lengthsRes: LengthsResponse;
const lengthValue: number = lengthsRes.lengths[0]!;
void lengthValue;

declare const areasRes: AreasAndLengthsResponse;
const areaValue: number = areasRes.areas[0]!;
const perimeterValue: number = areasRes.lengths[0]!;
void [areaValue, perimeterValue];

declare const distanceRes: DistanceResponse;
const distanceValue: number = distanceRes.distance;
void distanceValue;

declare const relationRes: RelationResponse;
const relIndex: number | undefined = relationRes.relations[0]?.geometry1Index;
void relIndex;

declare const unionRes: UnionResponse;
const unionGeom: EsriGeometry = unionRes.geometry;
void unionGeom;

/* ------------------------------------------------------------------ *
 * Path / operation unions
 * ------------------------------------------------------------------ */

const fnBase: FunctionServiceBasePath =
  "/tianjing-server/function-api/services/geometryUtilities/GeometryServer";
const op: GeometryOperation = "buffer";
const lbsOp: LbsOperation = "place/v2/district";
const dataOp: MapDataOperation = "VectorTileServer";
void [fnBase, op, lbsOp, dataOp];

/* ------------------------------------------------------------------ *
 * LbsPayload is usable directly
 * ------------------------------------------------------------------ */

type CustomResponse = LbsPayload<PoiSearchResult, "result">;
declare const customRes: CustomResponse;
const customHits: number = customRes.result.hits;
void customHits;

export {};
