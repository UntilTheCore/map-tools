import type {
  GeoJSONSource,
  GeoJSONSourceInstance,
  MapSource,
  VectorSourceInstance,
} from "@ym/map-tools";

export {};

declare const source: MapSource;
if (source.type === "geojson") {
  void source.data;
}
if (source.type === "vector") {
  void source.tiles;
  void source.data;
}

declare const geojsonInstance: GeoJSONSourceInstance;
geojsonInstance.setData({
  type: "FeatureCollection",
  features: [],
} as GeoJSON.FeatureCollection);

declare const vectorInstance: VectorSourceInstance;
// @ts-expect-error vector source instances do not expose setData
vectorInstance.setData({
  type: "FeatureCollection",
  features: [],
} as GeoJSON.FeatureCollection);

// @ts-expect-error vector source configuration cannot contain GeoJSON data
const invalidVectorSource: MapSource = {
  type: "vector",
  data: { type: "FeatureCollection", features: [] } as GeoJSON.FeatureCollection,
};
void invalidVectorSource;

const geojson: GeoJSONSource = { type: "geojson" };
const inlineGeoJsonSource: MapSource = {
  type: "geojson",
  data: { type: "FeatureCollection", features: [] },
};
void geojson;
void inlineGeoJsonSource;
