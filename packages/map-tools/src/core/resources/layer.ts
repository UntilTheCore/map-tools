import type { MapLayer } from "../../types/layer";
import type { MapLike } from "../../types/map";
import type { MapSource } from "../../types/source";
import { invalidArgument, sdkError } from "../errors";

export function ensureLayer(
  map: Pick<MapLike, "getLayer" | "addLayer">,
  layer: MapLayer,
): boolean {
  if (!map) invalidArgument("map is required");
  if (!layer || !layer.id) invalidArgument("layer.id is required");
  if (!layer.type) invalidArgument(`layer.type is required: ${layer.id}`);
  try {
    if (map.getLayer(layer.id)) return false;
  } catch (error) {
    throw sdkError(`Failed to inspect layer: ${layer.id}`, error);
  }

  try {
    map.addLayer(layer);
  } catch (error) {
    throw sdkError(`Failed to add layer: ${layer.id}`, error);
  }
  return true;
}

export function ensureLayers(
  map: Pick<MapLike, "getLayer" | "addLayer">,
  layers: readonly MapLayer[],
): number {
  if (!map) invalidArgument("map is required");
  if (!Array.isArray(layers)) invalidArgument("layers must be an array");
  for (const layer of layers) {
    if (!layer || !layer.id || !layer.type) {
      invalidArgument("each layer must contain id and type");
    }
  }

  let added = 0;
  for (const layer of layers) {
    if (ensureLayer(map, layer)) added += 1;
  }
  return added;
}

function assertVectorTiles(tiles: readonly string[]): void {
  if (
    !Array.isArray(tiles) ||
    tiles.length === 0 ||
    tiles.some((tile) => typeof tile !== "string" || tile.trim().length === 0)
  ) {
    invalidArgument("vector source tiles must contain at least one URL");
  }
}

export function replaceVectorSource(
  map: MapLike,
  options: {
    id: string;
    tiles: readonly string[];
    layers: readonly MapLayer[];
  },
): void {
  if (!map) invalidArgument("map is required");
  if (!options || typeof options !== "object") invalidArgument("options is required");
  const { id, tiles, layers } = options;
  if (!id) invalidArgument("options.id is required");
  if (!Array.isArray(layers)) invalidArgument("layers must be an array");
  for (const layer of layers) {
    if (!layer || !layer.id || !layer.type) {
      invalidArgument("each layer must contain id and type");
    }
  }
  assertVectorTiles(tiles);

  let existingSource: ReturnType<MapLike["getSource"]>;
  let existingLayerIds: string[];
  try {
    existingSource = map.getSource(id);
    existingLayerIds = layers
      .map((layer) => layer.id)
      .filter((layerId) => Boolean(map.getLayer(layerId)));
  } catch (error) {
    throw sdkError(`Failed to inspect vector resources: ${id}`, error);
  }

  for (const layerId of existingLayerIds) {
    try {
      map.removeLayer(layerId);
    } catch (error) {
      throw sdkError(`Failed to remove layer: ${layerId}`, error);
    }
  }

  if (existingSource) {
    try {
      map.removeSource(id);
    } catch (error) {
      throw sdkError(`Failed to remove source: ${id}`, error);
    }
  }

  const source: MapSource = {
    type: "vector",
    tiles: [...tiles],
  };
  try {
    map.addSource(id, source);
  } catch (error) {
    throw sdkError(`Failed to add vector source: ${id}`, error);
  }

  ensureLayers(map, layers);
}
