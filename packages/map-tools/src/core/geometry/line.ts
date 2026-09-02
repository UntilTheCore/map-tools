import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import type { Coordinate } from "../../types/geometry";

export function getLineEndpoints(
  features: FeatureCollection<LineString | MultiLineString>,
): Coordinate[] {
  const endpoints: Coordinate[] = [];
  for (const feature of features.features) {
    const geometry = feature.geometry;
    if (geometry.type === "LineString") {
      if (geometry.coordinates.length > 0) {
        const first = geometry.coordinates[0];
        const last = geometry.coordinates[geometry.coordinates.length - 1];
        endpoints.push([first[0], first[1]], [last[0], last[1]]);
      }
      continue;
    }
    for (const line of geometry.coordinates) {
      if (line.length > 0) {
        const first = line[0];
        const last = line[line.length - 1];
        endpoints.push([first[0], first[1]], [last[0], last[1]]);
      }
    }
  }
  return endpoints;
}
