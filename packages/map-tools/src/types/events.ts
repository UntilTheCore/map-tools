import type { Coordinate } from "./geometry";
import type { MapLike, RenderedFeature } from "./map";

export interface LngLat {
  lng: number;
  lat: number;
}
export interface PointLike {
  x: number;
  y: number;
}

export interface MapEvent {
  type?: string;
  target?: MapLike;
  [property: string]: unknown;
}

export interface MapMouseEvent extends MapEvent {
  type: "click" | "mousemove";
  lngLat: LngLat;
  point: PointLike;
}
export interface MapZoomEvent extends MapEvent { type: "zoomend" }
export interface MapLoadEvent extends MapEvent { type: "load" }
export interface MapErrorEvent extends MapEvent { type: "error"; error?: unknown }

export interface MapEventMap {
  load: MapLoadEvent;
  error: MapErrorEvent;
  click: MapMouseEvent;
  mousemove: MapMouseEvent;
  zoomend: MapZoomEvent;
}

export interface MapLayerBindings {
  click?: readonly string[];
  mousemove?: readonly string[];
  zoomend?: readonly string[];
}

export interface MapLoadedPayload {
  map: MapLike;
  event: MapLoadEvent;
  features: readonly RenderedFeature[];
  layerIds: readonly string[];
  mapCenterCoordinate?: Coordinate;
}
export interface LayerEventPayload<E extends MapEvent = MapEvent> {
  map: MapLike;
  event: E;
  features: readonly RenderedFeature[];
  layerIds: readonly string[];
  mouseCoordinate?: Coordinate;
  mapCenterCoordinate?: Coordinate;
}
export interface EmptyEventPayload<E extends MapEvent = MapEvent> {
  map: MapLike;
  event: E;
  features: readonly RenderedFeature[];
  layerIds: readonly string[];
  mouseCoordinate?: Coordinate;
  mapCenterCoordinate?: Coordinate;
}

export interface UseMapEventMap {
  loaded: MapLoadedPayload;
  "click:layer": LayerEventPayload<MapMouseEvent>;
  "click:empty": EmptyEventPayload<MapMouseEvent>;
  "mousemove:layer": LayerEventPayload<MapMouseEvent>;
  "mousemove:empty": EmptyEventPayload<MapMouseEvent>;
  "zoomend:layer": LayerEventPayload<MapZoomEvent>;
  "zoomend:empty": EmptyEventPayload<MapZoomEvent>;
}

export type UseMapEventName = keyof UseMapEventMap;

export interface UseMapOptions {
  map?: MapLike;
  layers?: MapLayerBindings;
  zoomQueryBy?: "center" | "mouse";
  mapLifecycle?: "external" | "owned";
}

export type FrameworkMapRef =
  | { value: MapLike | null }
  | { current: MapLike | null };

export interface UseMapReturn<R extends FrameworkMapRef = FrameworkMapRef> {
  mapRef: R;
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
