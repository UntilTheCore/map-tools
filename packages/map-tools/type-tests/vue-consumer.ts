import { useMap } from "@ym/map-tools/vue3";
import { useTrackPlayer } from "@ym/map-tools/vue3";
import type { VueUseMapReturn } from "@ym/map-tools/vue3";
import type { Ref } from "vue";
import type { MapLike } from "@ym/map-tools";

export {};

declare const map: MapLike;
declare const mapRef: Ref<MapLike | null>;
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

// useTrackPlayer:实例入参
const tp1 = useTrackPlayer(map, {
  points: [
    { lng: 106.55, lat: 29.56 },
    { lng: 106.56, lat: 29.57 },
  ],
  icon: "/bus.png",
});
tp1.play();
tp1.seekFraction(0.3);
void tp1.status.value;
void tp1.progress.value?.distanceMeters;

// useTrackPlayer:Ref 入参(map 异步到达场景)
const tp2 = useTrackPlayer(mapRef, {
  points: [
    { lng: 0, lat: 0, time: 0 },
    { lng: 1, lat: 1, time: 60_000 },
  ],
  createMarker: () => ({ setLngLat() {}, remove() {} }),
});
tp2.setSpeed(4);
void tp2.player.value?.totalMeters;
