import type { Coordinate } from "../../types/geometry";
import type { CameraOptions, MapLike } from "../../types/map";
import { assertCoordinate } from "../geometry/coordinate";
import { invalidArgument, sdkError } from "../errors";

export function easeTo(
  map: Pick<MapLike, "easeTo">,
  options: CameraOptions,
): void {
  if (!map) invalidArgument("map is required");
  if (!options || typeof options !== "object") invalidArgument("options is required");
  if (options.center) assertCoordinate(options.center);
  try {
    map.easeTo(options);
  } catch (error) {
    throw sdkError("Failed to ease map", error);
  }
}

export function panTo(
  map: Pick<MapLike, "panTo">,
  coordinate: Coordinate,
): void {
  if (!map) invalidArgument("map is required");
  assertCoordinate(coordinate);
  try {
    map.panTo(coordinate);
  } catch (error) {
    throw sdkError("Failed to pan map", error);
  }
}

export function setZoom(
  map: Pick<MapLike, "setZoom">,
  zoom: number,
): void {
  if (!map) invalidArgument("map is required");
  if (!Number.isFinite(zoom)) invalidArgument("zoom must be a finite number");
  try {
    map.setZoom(zoom);
  } catch (error) {
    throw sdkError("Failed to set map zoom", error);
  }
}
