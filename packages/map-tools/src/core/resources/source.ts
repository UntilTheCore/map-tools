import type { GeoJSON as GeoJson } from "geojson";
import type { MapLike } from "../../types/map";
import type { GeoJSONSourceOptions, MapSource } from "../../types/source";
import { isGeoJSONSource } from "../../types/source";
import { invalidArgument, sdkError } from "../errors";

export function upsertGeoJSONSource(
  map: Pick<MapLike, "getSource" | "addSource">,
  options: {
    id: string;
    data: GeoJson;
    options?: GeoJSONSourceOptions;
  },
): "created" | "updated" {
  if (!map) invalidArgument("map is required");
  if (!options || typeof options !== "object") invalidArgument("options is required");
  const { id, data, options: sourceOptions = {} } = options;
  if (!id) invalidArgument("options.id is required");
  if (!data) invalidArgument("GeoJSON source data is required");

  let source: ReturnType<Pick<MapLike, "getSource">["getSource"]>;
  try {
    source = map.getSource(id);
  } catch (error) {
    throw sdkError(`Failed to inspect source: ${id}`, error);
  }

  if (source) {
    if (!isGeoJSONSource(source)) {
      invalidArgument(`Source is not a GeoJSON source: ${id}`);
    }
    try {
      source.setData(data);
    } catch (error) {
      throw sdkError(`Failed to update GeoJSON source: ${id}`, error);
    }
    return "updated";
  }

  const safeOptions = { ...sourceOptions } as GeoJSONSourceOptions;
  delete (safeOptions as Record<string, unknown>).type;
  delete (safeOptions as Record<string, unknown>).data;
  const created: MapSource = {
    ...safeOptions,
    type: "geojson",
    data,
  };
  try {
    map.addSource(id, created);
  } catch (error) {
    throw sdkError(`Failed to add GeoJSON source: ${id}`, error);
  }
  return "created";
}

export function updateSourceData(
  map: Pick<MapLike, "getSource">,
  sourceId: string,
  data: GeoJson,
): boolean {
  if (!map) invalidArgument("map is required");
  if (!sourceId) invalidArgument("sourceId is required");
  if (!data) invalidArgument("GeoJSON source data is required");

  let source: ReturnType<Pick<MapLike, "getSource">["getSource"]>;
  try {
    source = map.getSource(sourceId);
  } catch (error) {
    throw sdkError(`Failed to inspect source: ${sourceId}`, error);
  }
  if (!source || !isGeoJSONSource(source)) return false;

  try {
    source.setData(data);
  } catch (error) {
    throw sdkError(`Failed to update GeoJSON source: ${sourceId}`, error);
  }
  return true;
}
