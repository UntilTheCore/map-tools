import type { Coordinate } from "../../types/geometry";
import { invalidArgument } from "../errors";

export function isCoordinate(value: unknown): value is Coordinate {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

export function assertCoordinate(value: unknown): asserts value is Coordinate {
  if (!isCoordinate(value)) {
    invalidArgument("coordinate must be [longitude, latitude] with finite numbers");
  }
}

