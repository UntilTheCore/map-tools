import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { Coordinate } from "../../types/geometry";

export function getPolygonVertices(
  features: FeatureCollection<Polygon | MultiPolygon>,
): Coordinate[] {
  const vertices: Coordinate[] = [];
  for (const feature of features.features) {
    const geometry = feature.geometry;
    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) {
        for (const coordinate of ring) {
          vertices.push([coordinate[0], coordinate[1]]);
        }
      }
      continue;
    }
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coordinate of ring) {
          vertices.push([coordinate[0], coordinate[1]]);
        }
      }
    }
  }
  return vertices;
}
