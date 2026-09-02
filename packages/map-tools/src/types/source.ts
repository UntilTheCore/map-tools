import type { GeoJSON as GeoJson } from "geojson";

export interface GeoJSONSource {
  type: "geojson";
  data?: GeoJson;
  url?: string;
  tiles?: never;
  [extension: string]: unknown;
}

export interface VectorSource {
  type: "vector";
  data?: never;
  url?: string;
  tiles?: readonly string[];
  [extension: string]: unknown;
}

export type MapSource = GeoJSONSource | VectorSource;
export type GeoJSONSourceOptions = Omit<GeoJSONSource, "type" | "data">;
export type VectorSourceOptions = Omit<VectorSource, "type" | "tiles">;

export interface SourceInstance {
  type?: string;
  [property: string]: unknown;
}

export interface GeoJSONSourceInstance extends SourceInstance {
  setData(data: GeoJson): void;
}

export interface VectorSourceInstance extends SourceInstance {
  setData?: never;
}

export type MapSourceInstance = GeoJSONSourceInstance | VectorSourceInstance;

export function isGeoJSONSource(
  source: MapSourceInstance | undefined,
): source is GeoJSONSourceInstance {
  return Boolean(
    source &&
    "setData" in source &&
    typeof (source as { setData?: unknown }).setData === "function",
  );
}
