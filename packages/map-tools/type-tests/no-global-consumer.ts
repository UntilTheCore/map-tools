import type { MapLayer } from "@ym/map-tools";

export {};

const layer: MapLayer = { id: "module-layer", type: "background" };
// The root module must not activate the ambient SDK declaration.
// @ts-expect-error minemap is available only after importing the explicit entry.
type MustNotExist = minemap.Map;
void layer;
