import {
  bearing,
  centerOfMass,
  lineIntersect,
  lineString,
  point,
  polygon,
} from "@turf/turf";
import type { Feature, Point } from "geojson";
import type { Coordinate } from "../../types/geometry";
import { assertCoordinate } from "./coordinate";
import { getLineEndpoints } from "./line";
import { getPolygonVertices } from "./polygon";
import { filterFeaturesByGeometryType } from "./featureFilter";
import { invalidArgument } from "../errors";

export {
  assertCoordinate,
  filterFeaturesByGeometryType,
  getLineEndpoints,
  getPolygonVertices,
};
export { isCoordinate } from "./coordinate";
export type { FeatureGeometryType } from "./featureFilter";

export function getBearing(from: Coordinate, to: Coordinate): number {
  assertCoordinate(from);
  assertCoordinate(to);
  return bearing(point(Array.from(from)), point(Array.from(to)));
}

export function getRotation(value: number, compensation = 180): number {
  if (!Number.isFinite(value) || !Number.isFinite(compensation)) {
    invalidArgument("bearing and compensation must be finite numbers");
  }
  return value - compensation;
}

export function getRotationByCoordinate(
  from: Coordinate,
  to: Coordinate,
  compensation = 180,
): number {
  return getRotation(getBearing(from, to), compensation);
}

export function getCoordinatesFromPoints(
  features: readonly Feature<Point>[],
): Coordinate[] {
  return features.map((feature) => {
    const coordinates = feature.geometry.coordinates;
    return [coordinates[0], coordinates[1]] as Coordinate;
  });
}

export function getPolygonRightIntersection(
  coordinates: readonly Coordinate[],
): Coordinate | undefined {
  if (coordinates.length < 3) return undefined;
  coordinates.forEach(assertCoordinate);
  const ring = coordinates.map((coordinate) => Array.from(coordinate));
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);

  const maxLongitude = Math.max(...ring.map(([longitude]) => longitude));
  const east = ring.find(([longitude]) => longitude === maxLongitude);
  if (!east) return undefined;

  const polygonFeature = polygon([ring]);
  const center = centerOfMass(polygonFeature).geometry.coordinates;
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLatitude = Math.min(...latitudes);
  const margin = Math.max(maxLongitude - minLongitude, maxLatitude - minLatitude, 1);

  const vertical = lineString([
    [east[0], minLatitude - margin],
    [east[0], maxLatitude + margin],
  ]);
  const horizontal = lineString([
    [minLongitude - margin, center[1]],
    [maxLongitude + margin, center[1]],
  ]);
  const intersection = lineIntersect(vertical, horizontal).features[0]?.geometry.coordinates;
  return intersection ? [intersection[0], intersection[1]] : undefined;
}
