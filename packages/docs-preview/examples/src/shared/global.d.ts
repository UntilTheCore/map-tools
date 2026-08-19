/**
 * HTML(UMD) 变体的全局声明：
 * - FE_utils：plain.html 中 <script> 加载的 UMD 全局（类型取自包入口）
 * - window.minemap：CDN 加载后挂载的全局（声明在 loadMinemap.ts 中）
 */
import type {} from "@ym/map-tools";

declare global {
  const FE_utils: typeof import("@ym/map-tools");
}
