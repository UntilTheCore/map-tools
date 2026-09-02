import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import {
  createMapEventController,
  type MapEventController,
} from "../core/events/mapEventController";
import type {
  MapLike,
  UseMapEventMap,
  UseMapOptions,
  UseMapReturn,
} from "../types/public";

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

export interface ReactUseMapReturn
  extends UseMapReturn<MutableRefObject<MapLike | null>> {
  mapRef: MutableRefObject<MapLike | null>;
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

export function useMap(options: UseMapOptions = {}): ReactUseMapReturn {
  const mapRef = useRef<MapLike | null>(options.map ?? null);
  const controllerRef = useRef<MapEventController | null>(null);
  const teardownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createMapEventController({
      layers: options.layers,
      zoomQueryBy: options.zoomQueryBy,
    });
  }
  const controller = controllerRef.current;

  useEffect(() => {
    if (teardownTimerRef.current) {
      clearTimeout(teardownTimerRef.current);
      teardownTimerRef.current = null;
    }
    if (mapRef.current) controller.attach(mapRef.current);
    return () => {
      const currentMap = mapRef.current;
      teardownTimerRef.current = setTimeout(() => {
        controller.unbindAll();
        if (currentMap && options.mapLifecycle === "owned") currentMap.remove();
        if (mapRef.current === currentMap) mapRef.current = null;
        teardownTimerRef.current = null;
      }, 0);
    };
  }, [controller, options.mapLifecycle]);

  const setMap = useCallback((map: MapLike | null) => {
    if (mapRef.current === map) return;
    mapRef.current = map;
    controller.setMap(map);
  }, [controller]);

  return {
    mapRef,
    setMap,
    on: controller.on,
    off: controller.off,
    unbindAll: controller.unbindAll,
  };
}
