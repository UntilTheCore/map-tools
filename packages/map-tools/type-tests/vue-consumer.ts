import { useMap } from "@ym/map-tools/vue3";
import type { VueUseMapReturn } from "@ym/map-tools/vue3";
import type { MapLike } from "@ym/map-tools";

export {};

declare const map: MapLike;
const result: VueUseMapReturn = useMap({
  map,
  layers: { click: ["demo-layer"] },
});

const unsubscribe = result.on("click:layer", (payload) => {
  void payload.features;
  void payload.layerIds;
  void payload.event.point;
});
result.off("click:layer", () => {});
unsubscribe();
result.setMap(null);
