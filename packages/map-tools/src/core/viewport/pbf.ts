import type { MapLike } from "../../types/map";
import { invalidArgument } from "../errors";
import { queryRenderedFeatures } from "../query/renderedFeatures";
import { waitForSourceLoaded, type WaitForSourceLoadedOptions } from "../query/waitForSourceLoaded";
import { fitToFeatures, type FitOptions } from "./fit";

export async function fitToRenderedLayer(
  map: MapLike,
  options: {
    layerId: string;
    sourceId?: string;
    wait?: WaitForSourceLoadedOptions;
    beforeQuery?: () => void | Promise<void>;
    padding?: FitOptions["padding"];
    maxZoom?: number;
  },
): Promise<boolean> {
  if (!map) invalidArgument("map is required");
  if (!options || typeof options !== "object") invalidArgument("options is required");
  if (!options.layerId) invalidArgument("layerId is required");
  if (options.beforeQuery) await options.beforeQuery();
  if (options.sourceId) {
    const loaded = await waitForSourceLoaded(map, options.sourceId, options.wait);
    if (!loaded) return false;
  }
  const features = queryRenderedFeatures(map, { layers: [options.layerId] });
  return fitToFeatures(map, features, {
    padding: options.padding,
    maxZoom: options.maxZoom,
  });
}
