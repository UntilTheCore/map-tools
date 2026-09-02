import type { Feature, GeoJsonProperties, Geometry } from "geojson";

export type FeatureGeometryType = Geometry["type"];

export function filterFeaturesByGeometryType<
  T extends FeatureGeometryType,
  P extends GeoJsonProperties = GeoJsonProperties,
>(
  features: readonly Feature<Geometry, P>[],
  type: T,
): Feature<Extract<Geometry, { type: T }>, P>[] {
  return features.filter(
    (feature): feature is Feature<Extract<Geometry, { type: T }>, P> =>
      feature.geometry.type === type,
  );
}
