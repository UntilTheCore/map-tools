import type {} from "@ym/map-tools/umd";

export {};

declare const umdMap: minemap.Map;

FE_utils.setLayerVisibility(umdMap, "demo-layer", true);
FE_utils.queryRenderedFeatures(umdMap, { layers: ["demo-layer"] });
window.FE_utils?.setZoom(umdMap, 8);
