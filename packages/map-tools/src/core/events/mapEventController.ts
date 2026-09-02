import type { MapLayerBindings, MapLike } from "../../types/public";
import type {
  MapEventMap,
  MapMouseEvent,
  MapZoomEvent,
  UseMapEventMap,
} from "../../types/events";
import type { QueryPoint, RenderedFeature } from "../../types/map";
import { queryRenderedFeatures } from "../query/renderedFeatures";

type Listener<K extends keyof UseMapEventMap> = (payload: UseMapEventMap[K]) => void;

export interface MapEventControllerOptions {
  layers?: MapLayerBindings;
  zoomQueryBy?: "center" | "mouse";
}

export interface MapEventController {
  attach(map: MapLike): void;
  detach(): void;
  setMap(map: MapLike | null): void;
  on<K extends keyof UseMapEventMap>(event: K, listener: Listener<K>): () => void;
  off<K extends keyof UseMapEventMap>(event: K, listener: Listener<K>): void;
  unbindAll(): void;
}

export function createMapEventController(
  options: MapEventControllerOptions = {},
): MapEventController {
  const bindings = options.layers ?? {};
  const zoomQueryBy = options.zoomQueryBy ?? "mouse";
  const listeners = new Map<keyof UseMapEventMap, Set<unknown>>();
  let map: MapLike | null = null;
  let attached = false;
  let lastMouseCoordinate: readonly [number, number] | undefined;
  let lastPoint: QueryPoint | undefined;

  const emit = <K extends keyof UseMapEventMap>(event: K, payload: UseMapEventMap[K]) => {
    listeners.get(event)?.forEach((listener) => {
      (listener as Listener<K>)(payload);
    });
  };

  const getCenterCoordinate = () => {
    if (!map) return undefined;
    const center = map.getCenter();
    return [center.lng, center.lat] as const;
  };

  const getLayerFeatures = (point: QueryPoint | undefined, layerIds: readonly string[]) => {
    if (!map || layerIds.length === 0) return [];
    return queryRenderedFeatures(
      map,
      point === undefined ? { layers: layerIds } : { point, layers: layerIds },
    );
  };

  const onLoad = (event: MapEventMap["load"]) => {
    if (map) {
      emit("loaded", {
        map,
        event,
        features: [],
        layerIds: [],
        mapCenterCoordinate: getCenterCoordinate(),
      });
    }
  };

  const onClick = (event: MapMouseEvent) => {
    if (!map) return;
    const features = getLayerFeatures(event.point, bindings.click ?? []);
    const payload = {
      map,
      event,
      features,
      layerIds: uniqueLayerIds(features),
      mouseCoordinate: [event.lngLat.lng, event.lngLat.lat] as const,
      mapCenterCoordinate: getCenterCoordinate(),
    };
    if (features.length > 0) emit("click:layer", payload);
    else emit("click:empty", payload);
  };

  const onMouseMove = (event: MapMouseEvent) => {
    if (!map) return;
    lastMouseCoordinate = [event.lngLat.lng, event.lngLat.lat];
    lastPoint = event.point;
    const features = getLayerFeatures(event.point, bindings.mousemove ?? []);
    const payload = {
      map,
      event,
      features,
      layerIds: uniqueLayerIds(features),
      mouseCoordinate: lastMouseCoordinate,
      mapCenterCoordinate: getCenterCoordinate(),
    };
    if (features.length > 0) emit("mousemove:layer", payload);
    else emit("mousemove:empty", payload);
  };

  const onZoomEnd = (event: MapZoomEvent) => {
    if (!map) return;
    const point = zoomQueryBy === "mouse" ? lastPoint : getCenterCoordinate();
    const features = getLayerFeatures(point, bindings.zoomend ?? []);
    const payload = {
      map,
      event,
      features,
      layerIds: uniqueLayerIds(features),
      mouseCoordinate: lastMouseCoordinate,
      mapCenterCoordinate: getCenterCoordinate(),
    };
    if (features.length > 0) emit("zoomend:layer", payload);
    else emit("zoomend:empty", payload);
  };

  const attach = (nextMap: MapLike) => {
    if (map === nextMap && attached) return;
    detach();
    map = nextMap;
    map.on("load", onLoad);
    map.on("click", onClick);
    map.on("mousemove", onMouseMove);
    map.on("zoomend", onZoomEnd);
    attached = true;
  };

  const detach = () => {
    if (!map || !attached) return;
    map.off("load", onLoad);
    map.off("click", onClick);
    map.off("mousemove", onMouseMove);
    map.off("zoomend", onZoomEnd);
    attached = false;
  };

  return {
    attach,
    detach,
    setMap(nextMap) {
      if (nextMap) attach(nextMap);
      else {
        detach();
        map = null;
      }
    },
    on(event, listener) {
      let eventListeners = listeners.get(event);
      if (!eventListeners) {
        eventListeners = new Set();
        listeners.set(event, eventListeners);
      }
      eventListeners.add(listener);
      if (map && !attached) attach(map);
      return () => {
        eventListeners?.delete(listener);
      };
    },
    off(event, listener) {
      listeners.get(event)?.delete(listener);
    },
    unbindAll() {
      detach();
      listeners.clear();
    },
  };
}

function uniqueLayerIds(features: readonly RenderedFeature[]): string[] {
  return [...new Set(features.map((feature) => feature.layer.id))];
}
