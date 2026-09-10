import type {} from "@ym/map-tools/minemap";
import { setSourceFilter } from "@ym/map-tools";

export {};

const container = document.createElement("div");
const sdkMap = new minemap.Map({
  container,
  center: [116.4, 39.9],
  zoom: 10,
});

const layer: minemap.MapLayer = {
  id: "demo-layer",
  type: "background",
};
const source: minemap.MapSource = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  } as GeoJSON.FeatureCollection,
};

sdkMap.addSource("demo-source", source).addLayer(layer);
sdkMap.setLayoutProperty("demo-layer", "visibility", "visible");
sdkMap.fitBounds([116, 39, 117, 40], { padding: { top: 1, right: 1, bottom: 1, left: 1 } });
const sdk = window.minemap;
void sdk;

// minemap.Map 实例可直接喂给 map-tools 的结构类型签名，零断言
const realFiltered: number = setSourceFilter(sdkMap, "demo-source", ["in", "deptId", 1]);
setSourceFilter(sdkMap, "demo-source", null);
void realFiltered;
