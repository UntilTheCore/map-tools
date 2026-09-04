/**
 * Standalone ambient TypeScript declarations for the externally loaded minemap
 * SDK (2D API; docs reference v2.1.x, this project pins v3.0.0 from CDN) plus
 * its plugin libraries `minemaputil` and `minemap.edit`.
 *
 * The vendor does not publish an npm type package. This declaration is
 * maintained against the official "minemap-jsapi-skill" reference set plus
 * observed SDK usage. It is NOT an official vendor package.
 *
 * Usage in TypeScript / Vite projects that load the SDK via <script>:
 *   - add `"@ym/minemap-types"` to tsconfig `compilerOptions.types`, OR
 *   - `import type {} from "@ym/minemap-types";` in any source file.
 *
 * This package is self-contained: every referenced shape is defined below.
 * It never depends on `@ym/map-tools` (the higher-level wrapper), keeping the
 * dependency direction one-way: map-tools -> minemap-types.
 */
/// <reference types="@types/geojson" />

import type {
  Feature,
  FeatureCollection,
  GeoJSON,
  Geometry,
  GeoJsonProperties,
  MultiPolygon,
  Point,
} from "geojson";

declare global {
  namespace minemap {
    /* ------------------------------------------------------------------ *
     * Geometry primitives
     * ------------------------------------------------------------------ */
    /** `[longitude, latitude]` — the order used across the SDK & GeoJSON. */
    type Coordinate = readonly [longitude: number, latitude: number];
    /** `[west, south, east, north]`. */
    type BBox = readonly [west: number, south: number, east: number, north: number];
    interface Padding {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }
    interface LngLatLike {
      lng: number;
      lat: number;
    }
    /** Pixel coordinate `{ x, y }`. */
    interface PointLike {
      x: number;
      y: number;
    }
    /** Any point expression: `[x, y]` or `{ x, y }`. */
    type PointLikeInput = Coordinate | PointLike;
    /** Alias kept for symmetry with the geometry docs. */
    type Point = PointLike;

    /* ------------------------------------------------------------------ *
     * Camera / query option shapes
     * ------------------------------------------------------------------ */
    interface CameraOptions {
      center?: Coordinate;
      zoom?: number;
      bearing?: number;
      pitch?: number;
      duration?: number;
      animate?: boolean;
      [option: string]: unknown;
    }
    interface FitBoundsOptions {
      /** Uniform padding or per-edge padding (both supported per docs). */
      padding?: number | PaddingOptions;
      maxZoom?: number;
      duration?: number;
      animate?: boolean;
      [option: string]: unknown;
    }
    interface QueryRenderedFeaturesOptions {
      layers?: readonly string[];
      filter?: readonly unknown[];
      validate?: boolean;
    }
    /** A rendered feature: GeoJSON Feature plus the layer that drew it. */
    type RenderedFeature<
      G extends Geometry = Geometry,
      P extends GeoJsonProperties = GeoJsonProperties,
    > = Feature<G, P> & {
      layer: { id: string; type?: string; [property: string]: unknown };
    };

    /* ------------------------------------------------------------------ *
     * Source & layer declarations / instances
     * ------------------------------------------------------------------ */
    interface GeoJSONSourceSpec {
      type: "geojson";
      data?: GeoJSON;
      url?: string;
      tiles?: never;
      cluster?: boolean;
      clusterMaxZoom?: number;
      clusterRadius?: number;
      [extension: string]: unknown;
    }
    interface VectorSourceSpec {
      type: "vector";
      data?: never;
      url?: string;
      tiles?: readonly string[];
      [extension: string]: unknown;
    }
    interface RasterSourceSpec {
      type: "raster" | "raster-dem";
      url?: string;
      tiles?: readonly string[];
      tileSize?: number;
      [extension: string]: unknown;
    }
    interface ImageSourceSpec {
      type: "image";
      url: string;
      coordinates: readonly [Coordinate, Coordinate, Coordinate, Coordinate];
      [extension: string]: unknown;
    }
    interface VideoSourceSpec {
      type: "video";
      urls: readonly string[];
      coordinates: readonly [Coordinate, Coordinate, Coordinate, Coordinate];
      [extension: string]: unknown;
    }
    interface CanvasSourceSpec {
      type: "canvas";
      canvas: HTMLCanvasElement | string;
      coordinates: readonly [Coordinate, Coordinate, Coordinate, Coordinate];
      animate?: boolean;
      [extension: string]: unknown;
    }
    /** Declarative source passed to `addSource`. */
    type MapSource =
      | GeoJSONSourceSpec
      | VectorSourceSpec
      | RasterSourceSpec
      | ImageSourceSpec
      | VideoSourceSpec
      | CanvasSourceSpec;

    interface SourceInstance {
      type?: string;
      [property: string]: unknown;
    }
    interface GeoJSONSourceInstance extends SourceInstance {
      setData(data: GeoJSON): void;
    }
    interface VectorSourceInstance extends SourceInstance {
      setData?: never;
    }
    type MapSourceInstance = GeoJSONSourceInstance | VectorSourceInstance;

    /** Known layer types from the SDK docs; `(string & {})` keeps it open. */
    type KnownLayerType =
      | "fill"
      | "line"
      | "symbol"
      | "circle"
      | "heatmap"
      | "extrusion"
      | "raster"
      | "airline"
      | "dynamicLine"
      | "sprite"
      | "histogram"
      | "tracking"
      | "symtracking"
      | "background";
    type LayerType = KnownLayerType | (string & {});
    type LayerLayout = Record<string, unknown>;
    type LayerPaint = Record<string, unknown>;

    interface InlineSource {
      type: string;
      url: string;
      [extension: string]: unknown;
    }
    /** Declarative layer passed to `addLayer`. */
    interface MapLayer {
      id: string;
      type: LayerType;
      source?: string | InlineSource;
      layout?: LayerLayout;
      paint?: LayerPaint;
      "source-layer"?: string;
      minzoom?: number;
      maxzoom?: number;
      filter?: readonly unknown[];
      [extension: string]: unknown;
    }
    /** A layer object returned by `getLayer` / `getAllLayers`. */
    interface LayerInstance {
      id: string;
      type?: string;
      source?: string | InlineSource;
      [property: string]: unknown;
    }

    /* ------------------------------------------------------------------ *
     * Geometry: LngLat / LngLatBounds
     * ------------------------------------------------------------------ */
    class LngLat {
      constructor(lng: number, lat: number);
      constructor(obj: { lng: number; lat: number });
      lng: number;
      lat: number;
      static convert(input: LngLatLikeInput): LngLat;
      wrap(): LngLat;
      toArray(): Coordinate;
      toString(): string;
      distanceTo(lngLat: LngLatLikeInput): number;
      toBounds(radius: number): LngLatBounds;
    }

    /** `LngLat | [lng, lat] | { lng|lon, lat }` */
    type LngLatLikeInput = LngLat | LngLatLike | Coordinate | { lon: number; lat: number };

    class LngLatBounds {
      constructor(sw?: LngLatLikeInput, ne?: LngLatLikeInput);
      static convert(input: LngLatBoundsLikeInput): LngLatBounds;
      setNorthEast(ne: LngLatLikeInput): this;
      setSouthWest(sw: LngLatLikeInput): this;
      extend(obj: LngLatLikeInput | LngLatBoundsLikeInput): this;
      getCenter(): LngLat;
      getSouthWest(): LngLat;
      getNorthEast(): LngLat;
      getNorthWest(): LngLat;
      getSouthEast(): LngLat;
      getWest(): number;
      getSouth(): number;
      getEast(): number;
      getNorth(): number;
      toArray(): [Coordinate, Coordinate];
      toString(): string;
      isEmpty(): boolean;
      contains(lngLat: LngLatLikeInput): boolean;
    }

    /** `LngLatBounds | [sw, ne] | [w, s, e, n]` */
    type LngLatBoundsLikeInput = LngLatBounds | readonly [LngLatLikeInput, LngLatLikeInput] | BBox;

    /* ------------------------------------------------------------------ *
     * Source / layer aliases (instance side, returned by getSource etc.)
     * ------------------------------------------------------------------ */
    type Source = MapSourceInstance;
    type GeoJSONSource = GeoJSONSourceInstance;
    type Layer = LayerInstance;

    /* ------------------------------------------------------------------ *
     * Event system
     * ------------------------------------------------------------------ */
    interface MapEvent {
      type: string;
      target?: Evented;
      [property: string]: unknown;
    }
    interface MapMouseEvent extends MapEvent {
      point: PointLike;
      lngLat: { lng: number; lat: number };
      originalEvent?: MouseEvent;
      features?: RenderedFeature[];
      preventDefault(): void;
    }
    interface MapTouchEvent extends MapEvent {
      point: PointLike;
      points: PointLike[];
      lngLat: { lng: number; lat: number };
      lngLats: { lng: number; lat: number }[];
      originalEvent?: TouchEvent;
      preventDefault(): void;
    }
    interface MapWheelEvent extends MapEvent {
      originalEvent?: WheelEvent;
      preventDefault(): void;
    }
    interface MapDataEvent extends MapEvent {
      dataType: "source" | "style" | "tile";
      sourceId?: string;
      isSourceLoaded?: boolean;
      source?: SourceInstance;
      tile?: unknown;
      coord?: unknown;
    }
    interface MapMoveEvent extends MapEvent {
      originalEvent?: Event;
    }
    /** Zoom events share the move-event payload shape (per the docs). */
    type MapZoomEvent = MapMoveEvent;
    interface MapErrorEvent extends MapEvent {
      error?: Error;
    }

    /**
     * Full event name space for `minemap.Map` (and `Evented` subclasses).
     * A catch-all string index keeps the surface open for event names the
     * vendor may add; known names get a precise payload.
     */
    interface MapEventMap {
      load: MapEvent;
      render: MapEvent;
      idle: MapEvent;
      error: MapErrorEvent;
      mousedown: MapMouseEvent;
      mouseup: MapMouseEvent;
      click: MapMouseEvent;
      dblclick: MapMouseEvent;
      mouseover: MapMouseEvent;
      mouseout: MapMouseEvent;
      mouseenter: MapMouseEvent;
      mouseleave: MapMouseEvent;
      mousemove: MapMouseEvent;
      contextmenu: MapMouseEvent;
      wheel: MapWheelEvent;
      touchstart: MapTouchEvent;
      touchend: MapTouchEvent;
      touchmove: MapTouchEvent;
      touchcancel: MapTouchEvent;
      movestart: MapMoveEvent;
      move: MapMoveEvent;
      moveend: MapMoveEvent;
      dragstart: MapMoveEvent;
      drag: MapMoveEvent;
      dragend: MapMoveEvent;
      zoomstart: MapZoomEvent;
      zoom: MapZoomEvent;
      zoomend: MapZoomEvent;
      rotatestart: MapMoveEvent;
      rotate: MapMoveEvent;
      rotateend: MapMoveEvent;
      pitchstart: MapMoveEvent;
      pitch: MapMoveEvent;
      pitchend: MapMoveEvent;
      boxzoomstart: MapEvent;
      boxzoomend: MapEvent;
      boxzoomcancel: MapEvent;
      webglcontextlost: MapEvent;
      webglcontextrestored: MapEvent;
      data: MapDataEvent;
      styledata: MapDataEvent;
      sourcedata: MapDataEvent;
      dataloading: MapDataEvent;
      styledataloading: MapDataEvent;
      sourcedataloading: MapDataEvent;
      styleimagemissing: MapEvent;
      "style.load": MapEvent;
      [event: string]: MapEvent;
    }

    type MapListener<K extends keyof MapEventMap> = (event: MapEventMap[K]) => void;

    /** Base class for all event-emitting objects (Map, Marker, Popup, sources). */
    class Evented {
      on<K extends keyof MapEventMap>(type: K, listener: MapListener<K>): this;
      /** Layer-filtered pointer events deliver a `MapMouseEvent` (with `features`). */
      on(type: string, layerId: string, listener: (event: MapMouseEvent) => void): this;
      on(type: string, listener: (event: MapEvent) => void): this;
      once<K extends keyof MapEventMap>(type: K, listener: MapListener<K>): this;
      once(type: string, layerId: string, listener: (event: MapMouseEvent) => void): this;
      once(type: string, listener: (event: MapEvent) => void): this;
      off<K extends keyof MapEventMap>(type: K, listener?: MapListener<K>): this;
      off(type: string, layerId?: string, listener?: (event: MapEvent) => void): this;
      fire(type: string, properties?: Record<string, unknown>): this;
    }

    /* ------------------------------------------------------------------ *
     * Interaction handlers
     * ------------------------------------------------------------------ */
    interface Handler {
      isEnabled(): boolean;
      isActive(): boolean;
      enable(): void;
      disable(): void;
    }
    interface TouchZoomRotateHandler extends Handler {
      disableRotation(): void;
      enableRotation(): void;
      isRotationEnabled(): boolean;
    }

    /* ------------------------------------------------------------------ *
     * Options
     * ------------------------------------------------------------------ */
    type ControlPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
    type Anchor =
      | "center"
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right";

    interface PaddingOptions {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    }

    interface AnimationOptions {
      duration?: number;
      easing?: (t: number) => number;
      offset?: PointLikeInput;
      animate?: boolean;
      essential?: boolean;
      [option: string]: unknown;
    }
    interface EaseToOptions extends CameraOptions, AnimationOptions {
      padding?: PaddingOptions;
    }
    interface FlyToOptions extends CameraOptions, AnimationOptions {
      speed?: number;
      curve?: number;
      screenSpeed?: number;
      maxDuration?: number;
    }
    interface JumpToOptions extends CameraOptions {
      animate?: false;
      [option: string]: unknown;
    }

    /** `transformRequest(url, resourceType)` intercept hook. */
    type TransformRequestFunction = (url: string, resourceType: string) => RequestParameters;
    interface RequestParameters {
      url: string;
      headers?: Record<string, string>;
      credentials?: "omit" | "same-origin" | "include";
      collectResourceTiming?: boolean;
      [property: string]: unknown;
    }

    interface MapOptions {
      container: string | HTMLElement;
      center?: LngLatLikeInput;
      zoom?: number;
      bearing?: number;
      pitch?: number;
      bounds?: LngLatBoundsLikeInput;
      fitBoundsOptions?: FitBoundsOptions;
      style?: object | string;
      minZoom?: number;
      maxZoom?: number;
      minPitch?: number;
      maxPitch?: number;
      maxBounds?: LngLatBoundsLikeInput;
      hash?: boolean | string;
      interactive?: boolean;
      bearingSnap?: number;
      pitchWithRotate?: boolean;
      clickTolerance?: number;
      attributionControl?: boolean;
      customAttribution?: string | string[];
      logoPosition?: ControlPosition;
      logoControl?: object | boolean;
      failIfMajorPerformanceCaveat?: boolean;
      preserveDrawingBuffer?: boolean;
      antialias?: boolean;
      refreshExpiredTiles?: boolean;
      scrollZoom?: boolean | object;
      boxZoom?: boolean;
      dragRotate?: boolean;
      dragPan?: boolean | object;
      keyboard?: boolean;
      doubleClickZoom?: boolean;
      touchZoomRotate?: boolean | object;
      touchPitch?: boolean | object;
      trackResize?: boolean;
      renderWorldCopies?: boolean;
      maxTileCacheSize?: number | null;
      localIdeographFontFamily?: string;
      transformRequest?: TransformRequestFunction;
      collectResourceTiming?: boolean;
      fadeDuration?: number;
      crossSourceCollisions?: boolean;
      defaultCursor?: string | null;
      projection?: string;
      [option: string]: unknown;
    }

    /* ------------------------------------------------------------------ *
     * Map
     * ------------------------------------------------------------------ */
    class Map extends Evented {
      constructor(options: MapOptions);

      /* interaction handler instances */
      scrollZoom: Handler;
      boxZoom: Handler;
      dragPan: Handler;
      dragRotate: Handler;
      keyboard: Handler;
      doubleClickZoom: Handler;
      touchZoomRotate: TouchZoomRotateHandler;
      touchPitch: Handler;

      /* debug display flags */
      showTileBoundaries: boolean;
      showPadding: boolean;
      showCollisionBoxes: boolean;
      showOverdraw: boolean;

      /* drag / cursor */
      disableDrag(): void;
      enableDrag(): void;
      getMapCursor(): string;
      setMapCursor(cursor: string): void;
      getDefaultCursor(): string;
      setDefaultCursor(cursor: string): void;
      getCursor(): string;
      setCursor(cursor: string): void;

      /* controls & containers */
      addControl(control: IControl, position?: ControlPosition): this;
      removeControl(control: IControl): this;
      getContainer(): HTMLElement;
      getCanvasContainer(): HTMLElement;
      getCanvas(): HTMLCanvasElement;
      addOverviewMap(): this;
      removeOverviewMap(): this;

      /* camera & viewport */
      getBounds(): LngLatBounds;
      setBounds(bounds: LngLatBoundsLikeInput, options?: EaseToOptions): this;
      project(lngLat: LngLatLikeInput): Point;
      unproject(point: PointLikeInput): LngLat;
      getCenter(): LngLat;
      setCenter(center: LngLatLikeInput, options?: EaseToOptions): this;
      getZoom(): number;
      setZoom(zoom: number, options?: EaseToOptions): this;
      getBearing(): number;
      setBearing(bearing: number, options?: EaseToOptions): this;
      getPitch(): number;
      setPitch(pitch: number, options?: EaseToOptions): this;
      getPadding(): PaddingOptions;
      setPadding(padding: PaddingOptions | number, options?: EaseToOptions): this;
      isMoving(): boolean;
      isZooming(): boolean;
      isRotating(): boolean;
      panBy(offset: PointLikeInput, options?: EaseToOptions): this;
      panTo(center: LngLatLikeInput, options?: EaseToOptions): this;
      zoomTo(zoom: number, options?: EaseToOptions): this;
      zoomIn(options?: EaseToOptions): this;
      zoomOut(options?: EaseToOptions): this;
      rotateTo(bearing: number, options?: EaseToOptions): this;
      resetNorth(options?: EaseToOptions): this;
      resetNorthPitch(options?: EaseToOptions): this;
      snapToNorth(options?: EaseToOptions): this;
      cameraForBounds(bounds: LngLatBoundsLikeInput, options?: FitBoundsOptions): CameraOptions;
      fitBounds(bounds: LngLatBoundsLikeInput, options?: FitBoundsOptions): this;
      fitScreenCoordinates(
        p0: PointLikeInput,
        p1: PointLikeInput,
        bearing: number,
        options?: FitBoundsOptions,
      ): this;
      jumpTo(options: JumpToOptions): this;
      easeTo(options: EaseToOptions): this;
      flyTo(options: FlyToOptions): this;
      setMaxBounds(bounds: LngLatBoundsLikeInput | null): this;
      setMinZoom(zoom: number): this;
      setMaxZoom(zoom: number): this;
      setMinPitch(pitch: number): this;
      setMaxPitch(pitch: number): this;
      setZoomAndCenter(zoom: number, center: LngLatLikeInput, options?: EaseToOptions): this;
      getRenderWorldCopies(): boolean;
      setRenderWorldCopies(v: boolean): this;
      stop(): this;
      resize(): this;

      /* style */
      setStyle(
        style: object | string,
        options?: { diff?: boolean; localIdeographFontFamily?: string },
      ): this;
      getStyle(): object;
      isStyleLoaded(): boolean;

      /* sources */
      addSource(id: string, source: MapSource | object): this;
      getSource(id: string): Source | undefined;
      removeSource(id: string): this;
      isSourceLoaded(id: string): boolean;
      areTilesLoaded(): boolean;
      getAllSources(): Record<string, SourceInstance>;

      /* layers */
      addLayer(layer: MapLayer | CustomLayerInterface, before?: string): this;
      getLayer(id: string): Layer | undefined;
      removeLayer(id: string): this;
      moveLayer(layerId: string, beforeId?: string): this;
      setLayerZoomRange(layerId: string, minzoom: number, maxzoom: number): this;
      getAllLayers(): Layer[];
      setFilter(
        layerId: string,
        filter: readonly unknown[] | null,
        options?: Record<string, unknown>,
      ): this;
      getFilter(layerId: string): readonly unknown[] | undefined;
      setPaintProperty(
        layerId: string,
        name: string,
        value: unknown,
        options?: Record<string, unknown>,
      ): this;
      getPaintProperty(layerId: string, name: string): unknown;
      setLayoutProperty(
        layerId: string,
        name: string,
        value: unknown,
        options?: Record<string, unknown>,
      ): this;
      getLayoutProperty(layerId: string, name: string): unknown;
      setLight(light: object, options?: Record<string, unknown>): this;
      getLight(): object;

      /* images */
      addImage(
        name: string,
        image: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | StyleImageInterface,
        options?: object,
      ): void;
      updateImage(
        name: string,
        image: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | StyleImageInterface,
      ): boolean;
      hasImage(name: string): boolean;
      removeImage(name: string): void;
      loadImage(
        url: string,
        callback: (error: Error | null, image: HTMLImageElement) => void,
      ): { cancel(): void };
      loadImages(
        urls: string[],
        callback: (errors: Error[], images: HTMLImageElement[]) => void,
      ): void;
      listImages(): string[];

      /* feature query & state */
      queryRenderedFeatures(options?: QueryRenderedFeaturesOptions): RenderedFeature[];
      queryRenderedFeatures(
        point?: Coordinate | PointLikeInput,
        options?: QueryRenderedFeaturesOptions,
      ): RenderedFeature[];
      querySourceFeatures(
        sourceId: string,
        options?: QueryRenderedFeaturesOptions,
      ): RenderedFeature[];
      setFeatureState(
        state: { source: string; id: string | number; sourceLayer?: string },
        stateProps: Record<string, unknown>,
      ): this;
      getFeatureState(state: {
        source: string;
        id: string | number;
        sourceLayer?: string;
      }): Record<string, unknown>;
      removeFeatureState(
        state: { source: string; id: string | number; sourceLayer?: string },
        key?: string,
      ): this;

      /* lifecycle & MineMap extensions */
      loaded(): boolean;
      remove(): void;
      triggerRepaint(): this;
      setTimerCount(num: number): void;
      pauseTimerCount(): void;
      resumeTimerCount(): void;
      stopTimerCount(): void;
      getMapPoisByPoint(point: PointLikeInput): unknown;
      getAllMarkers(): Marker[];
      getAllPopups(): Popup[];
    }

    /* ------------------------------------------------------------------ *
     * Controls & custom render interfaces
     * ------------------------------------------------------------------ */
    interface IControl {
      onAdd(map: Map): HTMLElement;
      onRemove(map: Map): void;
      getDefaultPosition?(): ControlPosition;
    }
    interface NavigationControlOptions {
      showCompass?: boolean;
      showZoom?: boolean;
      visualizePitch?: boolean;
    }
    class NavigationControl implements IControl {
      constructor(options?: NavigationControlOptions);
      onAdd(map: Map): HTMLElement;
      onRemove(map: Map): void;
    }
    type ScaleUnit = "imperial" | "metric" | "nautical";
    interface ScaleControlOptions {
      maxWidth?: number;
      unit?: ScaleUnit;
    }
    class ScaleControl implements IControl {
      constructor(options?: ScaleControlOptions);
      setUnit(unit: ScaleUnit): void;
      onAdd(map: Map): HTMLElement;
      onRemove(map: Map): void;
    }
    interface FullscreenControlOptions {
      container?: HTMLElement;
    }
    class FullscreenControl implements IControl {
      constructor(options?: FullscreenControlOptions);
      onAdd(map: Map): HTMLElement;
      onRemove(map: Map): void;
    }

    /** Custom WebGL layer passed to `map.addLayer`. */
    interface CustomLayerInterface {
      id: string;
      type: "custom";
      renderingMode?: "2d" | "3d";
      onAdd(map: Map, gl: WebGLRenderingContext): void;
      onRemove(map: Map, gl: WebGLRenderingContext): void;
      render(gl: WebGLRenderingContext, matrix: number[]): void;
      prerender?(gl: WebGLRenderingContext, matrix: number[]): void;
    }

    /** Dynamic style image passed to `map.addImage`. */
    interface StyleImageInterface {
      width: number;
      height: number;
      data: Uint8Array | Uint8ClampedArray;
      render(): boolean;
      onAdd(map: Map): void;
      onRemove(): void;
    }

    /* ------------------------------------------------------------------ *
     * Popup
     * ------------------------------------------------------------------ */
    interface PopupOptions {
      offset?: PointLikeInput;
      closeButton?: boolean;
      closeOnClick?: boolean;
      className?: string;
      maxWidth?: string;
      anchor?: Anchor;
      [option: string]: unknown;
    }
    class Popup extends Evented {
      constructor(options?: PopupOptions);
      addTo(map: Map): this;
      remove(): this;
      isOpen(): boolean;
      getLngLat(): LngLat;
      setLngLat(lngLat: LngLatLikeInput): this;
      trackPointer(): this;
      getElement(): HTMLElement;
      setText(text: string): this;
      setHTML(html: string): this;
      setDOMContent(htmlNode: Node): this;
      getMaxWidth(): string;
      setMaxWidth(maxWidth: string): this;
      addClassName(className: string): void;
      removeClassName(className: string): void;
      toggleClassName(className: string): void;
      getMap(): Map | null;
    }

    /* ------------------------------------------------------------------ *
     * Marker
     * ------------------------------------------------------------------ */
    type MarkerRotationAlignment = "map" | "viewport";
    interface MarkerOptions {
      element?: HTMLElement;
      offset?: PointLikeInput;
      anchor?: Anchor;
      color?: string;
      draggable?: boolean;
      rotation?: number;
      rotationAlignment?: MarkerRotationAlignment;
      pitchAlignment?: MarkerRotationAlignment;
      extData?: unknown;
      [option: string]: unknown;
    }
    class Marker extends Evented {
      constructor(element?: HTMLElement | MarkerOptions, options?: MarkerOptions);
      addTo(map: Map): this;
      remove(): this;
      getLngLat(): LngLat;
      setLngLat(lngLat: LngLatLikeInput): this;
      getElement(): HTMLElement;
      setPopup(popup: Popup): this;
      getPopup(): Popup | undefined;
      togglePopup(): this;
      getOffset(): PointLike | Coordinate;
      setOffset(offset: PointLikeInput): this;
      setDraggable(draggable: boolean): this;
      isDraggable(): boolean;
      getDraggable(): boolean;
      enableDragging(): this;
      disableDragging(): this;
      setRotation(rotation: number): this;
      getRotation(): number;
      setRotationAlignment(alignment: MarkerRotationAlignment): this;
      getRotationAlignment(): MarkerRotationAlignment;
      setPitchAlignment(alignment: MarkerRotationAlignment): this;
      getPitchAlignment(): MarkerRotationAlignment;
      setExtData(el: unknown): this;
      getExtData(): unknown;
      setZIndex(zIndex: number): this;
      getMap(): Map | null;
      /* MineMap extensions */
      setTitle(title: string): this;
      getTitle(): string;
      setTitleFontSize(fontSize: number): this;
      setTitleColor(color: string): this;
      setTitlePosition(offset: PointLikeInput): this;
      setAnimation(type: "drop" | "bounce"): this;
    }

    /* ------------------------------------------------------------------ *
     * Template (rendering plugin; API surface beyond `create` not covered
     * by the reference skill, kept minimal and documented as such)
     * ------------------------------------------------------------------ */
    class Template {
      static create(options: { type: string; map: Map; [key: string]: unknown }): unknown;
    }

    /* ------------------------------------------------------------------ *
     * Global configuration (writable SDK properties, set before `new Map`)
     * ------------------------------------------------------------------ */
    let key: string;
    let appKey: string;
    let solution: number;
    let domainUrl: string;
    let dataDomainUrl: string;
    let serverDomainUrl: string;
    let spriteUrl: string;
    let serviceUrl: string;
  }

  /* ================================================================== *
   * minemaputil — 2D tool library (separate global namespace)
   * ================================================================== */
  namespace minemaputil {
    interface RangingToolOptions {
      /** 0 = measure distance, 1 = measure area. Default 0. */
      type?: number;
      color?: string;
      startLabelText?: string;
      /** 'km' | 'm'. Default 'km'. */
      unit?: string;
      decimals?: number;
      clearText?: string;
      [option: string]: unknown;
    }
    class RangingTool {
      constructor(map: minemap.Map, options?: RangingToolOptions);
      turnOn(): void;
      turnOff(): void;
    }

    interface UtilFitBoundsOptions {
      padding?: number;
      offset?: number[];
      [option: string]: unknown;
    }
    /** Frame the current viewport around a GeoJSON object. */
    function fitBounds(map: minemap.Map, geojson: object, options?: UtilFitBoundsOptions): void;

    type SpaceUnit = "degrees" | "radians" | "miles" | "kilometers";
    interface NearestPointOnLineResult {
      geometry: { type: "Point"; coordinates: number[] };
      [property: string]: unknown;
    }
    class SpaceUtil {
      static distance(fromPoints: number[], toPoints: number[], units?: SpaceUnit): number;
      static distanceToLine(point: number[], line: number[][], units?: SpaceUnit): number;
      /** NOTE: argument order is `(line, point)`, reversed vs distanceToLine. */
      static nearestPointOnLine(
        line: number[][],
        point: number[],
        units?: SpaceUnit,
      ): NearestPointOnLineResult;
      static pointWithinPolygon(point: number[], polygon: number[][][]): boolean;
      static calMidpoint(
        first: minemap.LngLatLikeInput,
        second: minemap.LngLatLikeInput,
      ): Feature<Point>;
      static calCenter(features: unknown[]): Feature<Point>;
      static calCentroid(features: unknown[]): Feature<Point>;
    }
  }

  /* ================================================================== *
   * minemap.edit — plotting / editing plugin (mounted under minemap)
   * ================================================================== */
  namespace minemap {
    namespace edit {
      interface EditUserStyles {
        classificationType?: string;
        inactive?: Record<string, unknown>;
        active?: Record<string, unknown>;
        static?: Record<string, unknown>;
        [style: string]: unknown;
      }
      interface EditOptions {
        keybindings?: boolean;
        touchEnabled?: boolean;
        boxSelect?: boolean;
        displayControlsDefault?: boolean;
        drawEnabled?: boolean;
        adsorbEnabled?: boolean;
        adsorbBuffer?: number;
        minZoom?: number;
        maxZoom?: number;
        decimalPointNum?: number;
        secondEdit?: boolean;
        userStyles?: EditUserStyles;
        showButtons?: boolean;
        [option: string]: unknown;
      }
      interface EditModeOptions {
        style?: Record<string, unknown>;
        shape?: {
          startArrowType?: "none" | "normal" | "hollow";
          endArrowType?: "none" | "normal" | "hollow";
          lineType?: "solid" | "elbow" | "curve";
          [shape: string]: unknown;
        };
        [option: string]: unknown;
      }
      interface HistoryRecord {
        /** 0 none, 1 delete, 2 modify, 3 add, 4 replace. */
        type: number;
        /** 0 none, 1 move, 2 change shape, 3 change properties. */
        action: number;
        features: Feature[];
        prevFeatures: Feature[];
      }
      interface CustomStyleOptions {
        fillColor?: string;
        fillOpacity?: number;
        fillOutlineColor?: string;
        fillOutlineWidth?: number;
        fillOutlineOpacity?: number;
        fillOutlineDasharray?: string | number[];
        lineColor?: string;
        lineWidth?: number;
        lineOpacity?: number;
        lineDasharray?: string | number[];
        circleColor?: string;
        circleRadius?: number;
        circleBorderColor?: string;
        circleBorderRadius?: number;
        iconImage?: string;
        iconSize?: number;
        iconRotate?: number;
        /** Must be the string "true" to take effect. */
        custom_style?: string;
        [option: string]: unknown;
      }
      interface FeatureOptions {
        featureIds?: string[];
        cancelSelected?: boolean;
      }

      interface Draw {
        add(geojson: GeoJSON | object): string[];
        get(featureId: string): Feature | undefined;
        /** Pixel coordinates `{ x, y }` (not lng/lat). */
        getFeatureIdsAt(point: { x: number; y: number }): string[];
        getSelectedIds(): string[];
        getSelected(): FeatureCollection;
        getSelectedPoints(): FeatureCollection;
        getAll(): FeatureCollection;
        delete(ids: string | string[]): string[];
        deleteAll(): void;
        set(featureCollection: FeatureCollection): string[];
        trash(): void;
      }

      interface Edit {
        setOptions(options: EditOptions): Edit;
        dispose(): void;
        onBtnCtrlActive(mode: string, modeOptions?: EditModeOptions): Edit;
        setFeatures(featureCollection: object): string[];
        removeFeatures(featureIds: string[]): string[];
        setSelected(featureIds: string[]): string[];
        setFeatureProperties(featureId: string, properties: object): Feature;
        getAllHistoryRecords(): HistoryRecord[];
        clearHistoryRecords(): void;
        setFeaturePropertiesByIds(ids: string[], styleOptions: CustomStyleOptions): void;
        setCustomStyle(styleOptions: CustomStyleOptions, featureOptions?: FeatureOptions): void;
        cancelCustomStyle(featureOptions?: FeatureOptions): void;
        isDrawEnabled(): boolean;
        enableDraw(): void;
        disableDraw(): void;
        isAdsorbEnabled(): boolean;
        enableAdsorb(): void;
        disableAdsorb(): void;
        setLockByIds(ids: string[], isLock: boolean): void;
        draw: Draw;
      }

      /**
       * Factory for the editor. Usage: `new minemap.edit.init(map, options)`
       * or `const { init } = minemap.edit; init(map, options)`. Must be called
       * inside the map `load` callback.
       */
      function init(
        map: Map,
        options?: EditOptions,
        controlPosition?: minemap.ControlPosition,
      ): Edit;
    }

    namespace lbsUtil {
      /** Parse a district boundary string into a GeoJSON MultiPolygon geometry. */
      function districtFormat(polygon: string): MultiPolygon;
    }
  }

  interface Window {
    minemap?: typeof minemap;
    minemaputil?: typeof minemaputil;
  }
}

export {};
