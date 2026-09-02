import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import type { BBox, Coordinate, Padding } from "./geometry";
import type { LayerInstance, MapLayer } from "./layer";
import type { MapEventMap, PointLike } from "./events";
import type { MapSource, MapSourceInstance } from "./source";

export interface LngLatLike {
  lng: number;
  lat: number;
}

export type QueryPoint = Coordinate | PointLike;

export interface QueryRenderedFeaturesOptions {
  layers?: readonly string[];
  filter?: readonly unknown[];
  validate?: boolean;
}

export interface FitBoundsOptions {
  padding?: Padding;
  maxZoom?: number;
  duration?: number;
  animate?: boolean;
  [option: string]: unknown;
}

export interface CameraOptions {
  center?: Coordinate;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  duration?: number;
  animate?: boolean;
  [option: string]: unknown;
}

export type RenderedFeature<
  G extends Geometry = Geometry,
  P extends GeoJsonProperties = GeoJsonProperties,
> = Feature<G, P> & {
  layer: { id: string; type?: string; [property: string]: unknown };
};

export interface EventedMap {
  on<K extends keyof MapEventMap>(event: K, listener: (event: MapEventMap[K]) => void): void;
  off<K extends keyof MapEventMap>(event: K, listener: (event: MapEventMap[K]) => void): void;
}

export interface RemovableMap {
  remove(): void;
}

export interface SourceMap {
  addSource(id: string, source: MapSource): void;
  getSource(id: string): MapSourceInstance | undefined;
  removeSource(id: string): void;
}

export interface LayerMap {
  addLayer(layer: MapLayer): void;
  getLayer(id: string): LayerInstance | undefined;
  removeLayer(id: string): void;
  setLayoutProperty(layerId: string, name: string, value: unknown): void;
  getLayoutProperty(layerId: string, name: string): unknown;
}

export interface SourceLoadMap {
  isSourceLoaded(sourceId: string): boolean;
}

export interface RenderedFeatureQueryMap {
  queryRenderedFeatures(options?: QueryRenderedFeaturesOptions): RenderedFeature[];
  queryRenderedFeatures(
    point?: QueryPoint,
    options?: QueryRenderedFeaturesOptions,
  ): RenderedFeature[];
}

export interface CameraMap {
  fitBounds(bounds: BBox, options?: FitBoundsOptions): void;
  easeTo(options: CameraOptions): void;
  panTo(coordinate: Coordinate): void;
  setZoom(zoom: number): void;
  getZoom(): number;
  getCenter(): LngLatLike;
}

export interface MapLike extends
  EventedMap,
  RemovableMap,
  SourceMap,
  LayerMap,
  SourceLoadMap,
  RenderedFeatureQueryMap,
  CameraMap {}

export type MapEventListener<K extends keyof MapEventMap> = (
  event: MapEventMap[K],
) => void;
