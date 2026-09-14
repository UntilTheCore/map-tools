// vue2 子路径入口：复用共用的 useMap / useTrackPlayer（src/vue/，Vue 2.7 组合式 API 签名一致），
// 弹窗挂载走 Vue 2.7 适配版（本目录 popup.ts，无原生 createApp）。
export * from "../vue/useMap";
export * from "../vue/track";
export * from "./popup";
export type { MapLike } from "../types/public";
