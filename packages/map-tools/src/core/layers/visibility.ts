import type { MapLike } from "../../types/map";
import { invalidArgument, sdkError } from "../errors";

export type LayerVisibility = "visible" | "none" | undefined;

export function getLayerVisibility(
  map: Pick<MapLike, "getLayer" | "getLayoutProperty">,
  layerId: string,
): LayerVisibility {
  if (!map) invalidArgument("map is required");
  if (!layerId) invalidArgument("layerId is required");
  try {
    if (!map.getLayer(layerId)) return undefined;
    const visibility = map.getLayoutProperty(layerId, "visibility");
    return visibility === "none" ? "none" : "visible";
  } catch (error) {
    throw sdkError(`Failed to inspect layer visibility: ${layerId}`, error);
  }
}

export function setLayerVisibility(
  map: Pick<MapLike, "getLayer" | "setLayoutProperty">,
  layerId: string,
  visible: boolean,
): boolean {
  if (!map) invalidArgument("map is required");
  if (!layerId) invalidArgument("layerId is required");
  if (typeof visible !== "boolean") invalidArgument("visible must be boolean");
  try {
    if (!map.getLayer(layerId)) return false;
    map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  } catch (error) {
    throw sdkError(`Failed to set layer visibility: ${layerId}`, error);
  }
  return true;
}

export function toggleLayerVisibility(
  map: Pick<MapLike, "getLayer" | "getLayoutProperty" | "setLayoutProperty">,
  layerId: string,
): LayerVisibility {
  const current = getLayerVisibility(map, layerId);
  if (current === undefined) return undefined;
  setLayerVisibility(map, layerId, current === "none");
  return current === "none" ? "visible" : "none";
}

export function setLayersVisibility(
  map: Pick<MapLike, "getLayer" | "setLayoutProperty">,
  layerIds: readonly string[],
  visible: boolean,
): number {
  if (!map) invalidArgument("map is required");
  if (!Array.isArray(layerIds)) invalidArgument("layerIds must be an array");
  return layerIds.reduce(
    (count, layerId) => count + (setLayerVisibility(map, layerId, visible) ? 1 : 0),
    0,
  );
}
