import {
  createLayerId,
  createSourceId,
  ensureLayer,
  ensureLayers,
  fitToGeometry,
  queryRenderedFeatures,
  setLayerVisibility,
  updateSourceData,
  upsertGeoJSONSource,
} from "@ym/map-tools";
import { replaceVectorSource } from "@ym/map-tools/resources";
import { getLayerVisibility, getSourceLayerIds, setSourceFilter } from "@ym/map-tools/layers";
import { waitForSourceLoaded } from "@ym/map-tools/query";
import { fitToFeatures, panTo } from "@ym/map-tools/viewport";
import { getBearing } from "@ym/map-tools/geometry";
import { removeOverlays } from "@ym/map-tools/overlays";
import { createPopupDom } from "@ym/map-tools/popup";
import { createMapEventController } from "@ym/map-tools/events";
import type {
  CameraMap,
  Coordinate,
  MapLayer,
  MapLike,
  RenderedFeatureQueryMap,
  SourceMap,
} from "@ym/map-tools";

export {};

declare const map: MapLike;
declare const layer: MapLayer;
declare const cameraMap: CameraMap;
declare const sourceMap: SourceMap;
declare const renderedFeatureQueryMap: RenderedFeatureQueryMap;
const emptyFeatureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

createSourceId("demo", "points");
createLayerId("demo", "points");
ensureLayer(map, layer);
const upsertResult: "created" | "updated" = upsertGeoJSONSource(map, {
  id: "demo-source",
  data: emptyFeatureCollection,
});
const updated: boolean = updateSourceData(map, "demo-source", emptyFeatureCollection);
const addedLayers: number = ensureLayers(map, [layer]);
void upsertResult;
void updated;
void addedLayers;
replaceVectorSource(map, {
  id: "demo-vector-source",
  tiles: ["https://example.test/{z}/{x}/{y}.pbf"],
  layers: [layer],
});
const controller = createMapEventController();
controller.on("loaded", (payload) => {
  void payload.map;
});
setLayerVisibility(map, layer.id, true);
getLayerVisibility(map, layer.id);
const filteredCount: number = setSourceFilter(map, "demo-source", ["in", "deptId", 1, 2]);
setSourceFilter(map, "demo-source", null);
const sourceLayerIds: string[] = getSourceLayerIds(map, "demo-source");
void filteredCount;
void sourceLayerIds;
queryRenderedFeatures(map, { layers: [layer.id] });
void waitForSourceLoaded(map, "demo-source");
fitToFeatures(map, []);
fitToGeometry(map, {
  type: "Point",
  coordinates: [116.4, 39.9],
});
panTo(map, [116.4, 39.9]);
panTo(cameraMap, [116.4, 39.9]);
sourceMap.getSource("demo-source");
renderedFeatureQueryMap.queryRenderedFeatures({ layers: [layer.id] });
getBearing([116.4, 39.9], [116.5, 39.9]);
removeOverlays({ remove() {} });
createPopupDom({ kind: "text", value: "hello" });

const coordinate: Coordinate = [116.4, 39.9];
void coordinate;
