import { invalidArgument } from "../errors";

function assertIdPart(value: string, name: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    invalidArgument(`${name} must be a non-empty string`);
  }
}

export function createSourceId(prefix: string, name?: string): string {
  assertIdPart(prefix, "prefix");
  if (name !== undefined) assertIdPart(name, "name");
  return [prefix, name, "source"].filter(Boolean).join("-");
}

export function createLayerId(prefix: string, name?: string): string {
  assertIdPart(prefix, "prefix");
  if (name !== undefined) assertIdPart(name, "name");
  return [prefix, name, "layer"].filter(Boolean).join("-");
}
