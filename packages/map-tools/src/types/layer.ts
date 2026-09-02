export type KnownLayerType =
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

export type LayerType = KnownLayerType | (string & {});
export type LayerLayout = Record<string, unknown>;
export type LayerPaint = Record<string, unknown>;

export interface InlineLayerSource {
  type: string;
  url: string;
  [extension: string]: unknown;
}

export interface MapLayer {
  id: string;
  type: LayerType;
  source?: string | InlineLayerSource;
  layout?: LayerLayout;
  paint?: LayerPaint;
  "source-layer"?: string;
  minzoom?: number;
  maxzoom?: number;
  [extension: string]: unknown;
}

export interface LayerInstance {
  id: string;
  type?: string;
  source?: string | InlineLayerSource;
  [property: string]: unknown;
}

