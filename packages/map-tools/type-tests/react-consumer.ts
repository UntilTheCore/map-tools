import { useMap } from "@ym/map-tools/react";
import type { ReactUseMapReturn } from "@ym/map-tools/react";
import type { MapLike } from "@ym/map-tools";

export {};

declare const map: MapLike;
const result: ReactUseMapReturn = useMap({ map, zoomQueryBy: "center" });
result.on("zoomend:empty", (payload) => {
  payload.mapCenterCoordinate;
  payload.features;
});
// @ts-expect-error event names are constrained to the public event map
result.on("click", () => {});
