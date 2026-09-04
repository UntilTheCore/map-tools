// vue2 子路径入口：复用共用的 useMap（src/vue/useMap.ts），
// 弹窗挂载走 Vue 2.7 适配版（本目录 popup.ts，无原生 createApp）。
export * from "../vue/useMap";
export * from "./popup";
export type { MapLike } from "../types/public";
