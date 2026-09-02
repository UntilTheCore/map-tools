/// <reference path="./minemap.d.ts" />

import type * as MapTools from "../index";

declare global {
  const FE_utils: typeof MapTools;

  interface Window {
    FE_utils?: typeof MapTools;
  }
}

export {};

