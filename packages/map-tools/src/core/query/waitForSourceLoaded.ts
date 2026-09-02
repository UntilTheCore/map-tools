import type { MapLike } from "../../types/map";
import { MapToolsError, sdkError } from "../errors";

export interface WaitForSourceLoadedOptions {
  timeoutMs?: number;
  intervalMs?: number;
  signal?: AbortSignal;
}

export function waitForSourceLoaded(
  map: Pick<MapLike, "isSourceLoaded">,
  sourceId: string,
  options: WaitForSourceLoadedOptions = {},
): Promise<boolean> {
  if (!map) throw new MapToolsError("INVALID_ARGUMENT", "map is required");
  if (!sourceId) throw new MapToolsError("INVALID_ARGUMENT", "sourceId is required");

  if (!options || typeof options !== "object") {
    throw new MapToolsError("INVALID_ARGUMENT", "options must be an object");
  }
  const timeoutMs = options.timeoutMs ?? 30_000;
  const intervalMs = options.intervalMs ?? 1000;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    throw new MapToolsError("INVALID_ARGUMENT", "timeoutMs must be a non-negative number");
  }
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new MapToolsError("INVALID_ARGUMENT", "intervalMs must be greater than zero");
  }

  return new Promise<boolean>((resolve, reject) => {
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;

    const finish = (result: boolean, error?: unknown) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
      if (error) reject(error);
      else resolve(result);
    };

    const onAbort = () => finish(false);
    options.signal?.addEventListener("abort", onAbort, { once: true });

    const check = () => {
      if (settled) return;
      if (options.signal?.aborted) {
        finish(false);
        return;
      }
      try {
        if (map.isSourceLoaded(sourceId)) {
          finish(true);
          return;
        }
      } catch (error) {
        finish(false, sdkError(`Failed to inspect source: ${sourceId}`, error));
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        finish(false);
        return;
      }
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(timeoutMs - elapsed, 0);
      timer = setTimeout(check, Math.min(intervalMs, remaining));
    };

    check();
  });
}
