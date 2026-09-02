import type { Feature, FeatureCollection, GeoJsonProperties, Position } from "geojson";
import type { Coordinate } from "@ym/map-tools";

export function asCoordinate(position: Position): Coordinate {
  return [position[0], position[1]] as Coordinate;
}

export function asFeatureCollection(
  features: readonly Feature[],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [...features],
  };
}

export function featureName(feature: Feature): string {
  const properties = feature.properties as GeoJsonProperties;
  if (properties && typeof properties.name === "string") return properties.name;
  return "未命名要素";
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
