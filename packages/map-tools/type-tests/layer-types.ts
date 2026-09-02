import type { MapLayer } from "@ym/map-tools";

export {};

const backgroundLayer: MapLayer = {
  id: "background",
  type: "background",
};

const extendedLayer: MapLayer = {
  id: "vendor-layer",
  type: "vendor-specific",
  layout: { visibility: "visible" },
  paint: { color: "#fff" },
  vendorOption: { enabled: true },
};

// @ts-expect-error layer id is required
const missingId: MapLayer = { type: "line" };
// @ts-expect-error layer type is required
const missingType: MapLayer = { id: "line" };

void backgroundLayer;
void extendedLayer;
void missingId;
void missingType;
