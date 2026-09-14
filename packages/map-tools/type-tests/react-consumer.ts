import { useMap } from "@ym/map-tools/react";
import { useTrackPlayer } from "@ym/map-tools/react";
import type { ReactUseMapReturn } from "@ym/map-tools/react";
import type { MutableRefObject } from "react";
import type { MapLike } from "@ym/map-tools";

export {};

declare const map: MapLike;
declare const mapRef: MutableRefObject<MapLike | null>;
const result: ReactUseMapReturn = useMap({ map, zoomQueryBy: "center" });
result.on("zoomend:empty", (payload) => {
  void payload.mapCenterCoordinate;
  void payload.features;
});
// @ts-expect-error event names are constrained to the public event map
result.on("click", () => {});

// useTrackPlayer:实例入参
const tp1 = useTrackPlayer(map, {
  points: [
    { lng: 106.55, lat: 29.56 },
    { lng: 106.56, lat: 29.57 },
  ],
  icon: "/bus.png",
});
tp1.play();
void tp1.status;
void tp1.progress?.distanceMeters;

// useTrackPlayer:Ref 入参
const tp2 = useTrackPlayer(mapRef, {
  points: [
    { lng: 0, lat: 0, time: 0 },
    { lng: 1, lat: 1, time: 60_000 },
  ],
  createMarker: () => ({ setLngLat() {}, remove() {} }),
});
tp2.stop();
void tp2.player?.totalMeters;
