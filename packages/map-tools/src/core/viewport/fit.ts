import { bbox } from "@turf/turf";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { BBox, Padding } from "../../types/geometry";
import type { MapLike } from "../../types/map";
import { invalidArgument, sdkError } from "../errors";

export interface FitOptions {
  padding?: Padding;
  maxZoom?: number;
}

export const DEFAULT_FIT_PADDING: Padding = {
  top: 150,
  right: 250,
  bottom: 150,
  left: 250,
};

function toFitBoundsOptions(options: FitOptions) {
  return {
    padding: options.padding ?? DEFAULT_FIT_PADDING,
    ...(options.maxZoom === undefined ? {} : { maxZoom: options.maxZoom }),
  };
}

function fitBounds(
  map: Pick<MapLike, "fitBounds">,
  bounds: BBox,
  options: FitOptions,
): boolean {
  try {
    map.fitBounds(bounds, toFitBoundsOptions(options));
  } catch (error) {
    throw sdkError("Failed to fit map bounds", error);
  }
  return true;
}

function assertPadding(padding: Padding | undefined): void {
  if (!padding) return;
  for (const side of ["top", "right", "bottom", "left"] as const) {
    if (!Number.isFinite(padding[side]) || padding[side] < 0) {
      invalidArgument(`padding.${side} must be a non-negative number`);
    }
  }
}

function assertFitOptions(options: FitOptions): void {
  assertPadding(options.padding);
  if (options.maxZoom !== undefined && !Number.isFinite(options.maxZoom)) {
    invalidArgument("maxZoom must be a finite number");
  }
}

export function fitToFeatures(
  map: Pick<MapLike, "fitBounds">,
  features: readonly Feature[],
  options: FitOptions = {},
): boolean {
  if (!map) invalidArgument("map is required");
  if (!Array.isArray(features)) invalidArgument("features must be an array");
  if (features.length === 0) return false;
  return fitToGeometry(
    map,
    {
      type: "FeatureCollection",
      features: features as Feature[],
    } as FeatureCollection,
    options,
  );
}

export function fitToGeometry(
  map: Pick<MapLike, "fitBounds">,
  geometry: FeatureCollection | Feature<Geometry> | Geometry,
  options: FitOptions = {},
): boolean {
  if (!map) invalidArgument("map is required");
  if (!geometry) invalidArgument("geometry is required");
  if (!options || typeof options !== "object") {
    invalidArgument("options must be an object");
  }
  assertFitOptions(options);
  let bounds: readonly number[];
  try {
    bounds = bbox(geometry as never);
  } catch {
    invalidArgument("geometry must be valid GeoJSON");
  }
  if (
    bounds.length < 4 ||
    bounds.slice(0, 4).some((value) => !Number.isFinite(value))
  ) {
    invalidArgument("geometry must contain finite coordinates");
  }
  const [west, south, east, north] = bounds;
  return fitBounds(map, [west, south, east, north], options);
}
