/**
 * Layer 1 — direct consumption: installing only `@ym/minemap-types` (without
 * `@ym/map-tools`) activates the ambient `minemap` namespace.
 */
import type {} from "@ym/minemap-types";

export {};

const map = new minemap.Map({ container: "map", zoom: 3 });

map.on("click", (e) => {
  void e.lngLat.lng;
});

new minemap.Marker().setLngLat([1, 1]).addTo(map);
const center = map.getCenter();
void center.wrap().toArray();

const sdk = window.minemap;
void sdk;
