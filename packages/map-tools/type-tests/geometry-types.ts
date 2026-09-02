import {
  assertCoordinate,
  getLineEndpoints,
  getPolygonVertices,
  isCoordinate,
} from "@ym/map-tools/geometry";
import type { Coordinate, Padding } from "@ym/map-tools";

export {};

const coordinate: Coordinate = [116.4, 39.9];
const padding: Padding = { top: 8, right: 8, bottom: 8, left: 8 };
assertCoordinate(coordinate);
if (isCoordinate(coordinate)) {
  coordinate[0];
}

getLineEndpoints({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: null,
      geometry: { type: "LineString", coordinates: [[116, 39], [117, 40]] },
    },
  ],
});
getPolygonVertices({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: null,
      geometry: {
        type: "Polygon",
        coordinates: [[[116, 39], [117, 39], [117, 40], [116, 39]]],
      },
    },
  ],
});
void padding;
