import { markRaw, onUnmounted, shallowRef } from "vue-demi";
import type { Ref } from "vue-demi";
import {
  createMapEventController,
  type MapEventController,
} from "../core/events/mapEventController";
import type { MapLike, UseMapEventMap, UseMapOptions, UseMapReturn } from "../types/public";

export type { MapLike } from "../types/public";

export type {
  EmptyEventPayload,
  LayerEventPayload,
  MapErrorEvent,
  MapEvent,
  MapEventMap,
  MapLayerBindings,
  MapLoadEvent,
  MapLoadedPayload,
  MapMouseEvent,
  MapZoomEvent,
  PointLike,
  UseMapEventMap,
  UseMapEventName,
  UseMapOptions,
  UseMapReturn,
} from "../types/public";

export interface VueUseMapReturn extends UseMapReturn<Ref<MapLike | null>> {
  mapRef: Ref<MapLike | null>;
  setMap(map: MapLike | null): void;
  on<K extends keyof UseMapEventMap>(
    event: K,
    listener: (payload: UseMapEventMap[K]) => void,
  ): () => void;
  off<K extends keyof UseMapEventMap>(
    event: K,
    listener: (payload: UseMapEventMap[K]) => void,
  ): void;
  unbindAll(): void;
}

export function useMap(options: UseMapOptions = {}): VueUseMapReturn {
  const mapRef = shallowRef<MapLike | null>(options.map ? markRaw(options.map) : null);
  const controller: MapEventController = createMapEventController({
    layers: options.layers,
    zoomQueryBy: options.zoomQueryBy,
  });

  if (mapRef.value) controller.attach(mapRef.value);

  function setMap(map: MapLike | null): void {
    if (mapRef.value === map) return;
    if (map) {
      mapRef.value = markRaw(map);
      controller.setMap(map);
    } else {
      controller.setMap(null);
      mapRef.value = null;
    }
  }

  onUnmounted(() => {
    const currentMap = mapRef.value;
    controller.unbindAll();
    if (currentMap && options.mapLifecycle === "owned") currentMap.remove();
    mapRef.value = null;
  });

  return {
    mapRef,
    setMap,
    on: controller.on,
    off: controller.off,
    unbindAll: controller.unbindAll,
  };
}
