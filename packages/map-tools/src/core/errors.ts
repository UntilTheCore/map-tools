export type MapToolsErrorCode = "INVALID_ARGUMENT" | "SDK_ERROR" | "DOM_UNAVAILABLE";

export class MapToolsError extends Error {
  readonly code: MapToolsErrorCode;
  readonly cause: unknown;

  constructor(code: MapToolsErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "MapToolsError";
    this.code = code;
    this.cause = cause;
  }
}

export function invalidArgument(message: string): never {
  throw new MapToolsError("INVALID_ARGUMENT", message);
}

export function sdkError(message: string, cause?: unknown): MapToolsError {
  return new MapToolsError("SDK_ERROR", message, cause);
}
