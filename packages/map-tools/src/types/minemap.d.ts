/**
 * Thin entry: the ambient `minemap` SDK declarations now live in the
 * standalone `@ym/minemap-types` package (private registry). Importing this
 * subpath pulls the global namespace in, keeping the historical
 * `import type {} from "@ym/map-tools/minemap"` and
 * `/// <reference types="@ym/map-tools/minemap" />` contracts working
 * (both verified through the dist trampoline -> package exports chain).
 */
import type {} from "@ym/minemap-types";
