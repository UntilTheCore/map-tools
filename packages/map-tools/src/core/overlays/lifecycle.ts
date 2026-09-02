import { invalidArgument, sdkError } from "../errors";

export type RemovableOverlay = { remove(): void };

export function removeOverlays(
  overlays: RemovableOverlay | readonly RemovableOverlay[],
): number {
  if (overlays == null) invalidArgument("overlays is required");
  const list = Array.isArray(overlays) ? overlays : [overlays];
  let removed = 0;
  for (const overlay of list) {
    if (!overlay || typeof overlay.remove !== "function") continue;
    try {
      overlay.remove();
    } catch (error) {
      throw sdkError("Failed to remove overlay", error);
    }
    removed += 1;
  }
  return removed;
}
