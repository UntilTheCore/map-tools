import type { MapLayer } from "@ym/map-tools";

export {};

const layer: MapLayer = { id: "module-layer", type: "background" };
// The root module must not activate the ambient SDK declaration.
// The underscore prefix opts this assertion alias out of no-unused-vars.
// @ts-expect-error minemap is available only after importing the explicit entry.
type _MustNotExist = minemap.Map;
void layer;
