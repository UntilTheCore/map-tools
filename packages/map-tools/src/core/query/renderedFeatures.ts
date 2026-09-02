import type {
  MapLike,
  QueryPoint,
  QueryRenderedFeaturesOptions,
  RenderedFeature,
} from "../../types/map";
import { invalidArgument, sdkError } from "../errors";

export function queryRenderedFeatures(
  map: Pick<MapLike, "queryRenderedFeatures">,
  options: QueryRenderedFeaturesOptions & { point?: QueryPoint } = {},
): RenderedFeature[] {
  if (!map) invalidArgument("map is required");
  if (!options || typeof options !== "object") {
    invalidArgument("options must be an object");
  }
  const { point, layers, filter, validate } = options;
  const queryOptions: QueryRenderedFeaturesOptions = {
    ...(layers === undefined ? {} : { layers }),
    ...(filter === undefined ? {} : { filter }),
    ...(validate === undefined ? {} : { validate }),
  };
  try {
    return point === undefined
      ? map.queryRenderedFeatures(queryOptions)
      : map.queryRenderedFeatures(point, queryOptions);
  } catch (error) {
    throw sdkError("Failed to query rendered features", error);
  }
}
