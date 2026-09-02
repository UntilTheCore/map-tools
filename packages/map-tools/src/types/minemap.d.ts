/**
 * Supplementary declarations for the externally loaded minemap v3.0.0 SDK.
 *
 * The vendor does not publish an npm type package. This declaration is
 * maintained from observed SDK usage and is not an official vendor package.
 */
/// <reference types="@types/geojson" />

import type {
  CameraOptions,
  FitBoundsOptions,
  LngLatLike,
  QueryRenderedFeaturesOptions,
  RenderedFeature,
} from "./public";
import type { LayerInstance } from "./layer";
import type { GeoJSONSourceInstance, MapSourceInstance } from "./source";

declare global {
  namespace minemap {
    type Coordinate = import("./geometry").Coordinate;
    type BBox = import("./geometry").BBox;
    type Padding = import("./geometry").Padding;
    type MapLayer = import("./layer").MapLayer;
    type MapSource = import("./source").MapSource;
    type PointLike = import("./events").PointLike;
    type RenderedFeature = import("./map").RenderedFeature;
    type Source = MapSourceInstance;
    type GeoJSONSource = GeoJSONSourceInstance;
    type Layer = LayerInstance;
    type MapEventMap = import("./events").MapEventMap;

    interface MapOptions {
      container: string | HTMLElement;
      preserveDrawingBuffer?: boolean;
      style?: string;
      center?: Coordinate;
      zoom?: number;
      pitch?: number;
      maxZoom?: number;
      minZoom?: number;
      projection?: string;
      logoControl?: boolean;
      doubleClickZoom?: boolean;
      [option: string]: unknown;
    }

    class Map {
      constructor(options: MapOptions);
      on<K extends keyof MapEventMap>(
        eventName: K,
        callback: (event: MapEventMap[K]) => void,
      ): this;
      off<K extends keyof MapEventMap>(
        eventName: K,
        callback: (event: MapEventMap[K]) => void,
      ): this;
      remove(): void;
      addSource(id: string, source: minemap.MapSource): this;
      getSource(id: string): Source | undefined;
      removeSource(id: string): this;
      addLayer(layer: minemap.MapLayer): this;
      getLayer(id: string): Layer | undefined;
      removeLayer(id: string): this;
      moveLayer(downLayerId: string, upLayerId?: string): this;
      getZoom(): number;
      setZoom(zoom: number): this;
      getCenter(): LngLatLike;
      panTo(coordinate: minemap.Coordinate): this;
      easeTo(options: CameraOptions): this;
      fitBounds(bounds: minemap.BBox, options?: FitBoundsOptions): this;
      setLayoutProperty(
        layerId: string,
        name: string,
        value: unknown,
        options?: Record<string, unknown>,
      ): this;
      getLayoutProperty(layerId: string, name: string): unknown;
      setFilter(layerId: string, condition: readonly unknown[] | null): this;
      isSourceLoaded(sourceId: string): boolean;
      queryRenderedFeatures(options?: QueryRenderedFeaturesOptions): RenderedFeature[];
      queryRenderedFeatures(
        point?: Coordinate | PointLike,
        options?: QueryRenderedFeaturesOptions,
      ): RenderedFeature[];
      querySourceFeatures(
        sourceId: string,
        options?: QueryRenderedFeaturesOptions,
      ): RenderedFeature[];
      loadImage(url: string, callback: (error: unknown, image: unknown) => void): void;
      getCanvas(): HTMLCanvasElement;
      hasImage(name: string): boolean;
      addImage(name: string, image: unknown, options?: unknown): void;
      triggerRepaint(): this;
    }

    interface PopupOptions {
      closeOnClick?: boolean;
      closeButton?: boolean;
      offset?: readonly number[];
      minWidth?: string;
      maxWidth?: string;
      [option: string]: unknown;
    }

    class Popup {
      constructor(options?: PopupOptions);
      setLngLat(coordinate: minemap.Coordinate): Popup;
      setDOMContent(element: HTMLElement): Popup;
      addTo(map: Map): Popup;
      remove(): void;
      addClassName(className: string): void;
    }

    interface MarkerOptions {
      offset?: readonly number[];
      color?: string;
      [option: string]: unknown;
    }

    class Marker {
      constructor(element?: HTMLElement, options?: MarkerOptions);
      setLngLat(coordinate: minemap.Coordinate): Marker;
      addTo(map: Map): Marker;
      isDraggable(): boolean;
      setPopup(popup?: Popup): Marker;
      togglePopup(): void;
      remove(): void;
    }

    class Template {
      static create(options: { type: string; map: Map; [key: string]: unknown }): unknown;
    }

    let domainUrl: string;
    let dataDomainUrl: string;
    let serverDomainUrl: string;
    let spriteUrl: string;
    let serviceUrl: string;
    let key: string;
    let solution: number;
  }

  interface Window {
    minemap?: typeof minemap;
  }
}

export {};
