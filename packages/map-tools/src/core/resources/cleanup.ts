import type { MapLike } from "../../types/map";
import { invalidArgument, sdkError } from "../errors";

export function destroyMap(map: Pick<MapLike, "remove">): void {
  if (!map) invalidArgument("map is required");
  try {
    map.remove();
  } catch (error) {
    throw sdkError("Failed to remove map", error);
  }
}

export function removeResources(
  map: Pick<MapLike, "getLayer" | "removeLayer" | "getSource" | "removeSource">,
  options: {
    layerIds?: readonly string[];
    sourceIds?: readonly string[];
  } = {},
): void {
  if (!map) invalidArgument("map is required");
  if (!options || typeof options !== "object") {
    invalidArgument("options must be an object");
  }
  if (options.layerIds !== undefined && !Array.isArray(options.layerIds)) {
    invalidArgument("layerIds must be an array");
  }
  if (options.sourceIds !== undefined && !Array.isArray(options.sourceIds)) {
    invalidArgument("sourceIds must be an array");
  }
  try {
    for (const layerId of options.layerIds ?? []) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    }
    for (const sourceId of options.sourceIds ?? []) {
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
  } catch (error) {
    throw sdkError("Failed to remove map resources", error);
  }
}
