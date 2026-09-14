<!--
  轨迹回放（Vue 3 SFC + useTrackPlayer）：真实项目推荐的组件写法。
  关键点：
  1. useTrackPlayer(mapRef, options) 接受 Ref<MapLike|null>——minemap SDK 异步加载
     是常态,map 非空时懒建 player,变 null 销毁,换新 map 销毁重建;
  2. 进度/状态是响应式 ref,直接绑到模板;控制走 play/pause/stop/seekFraction/setSpeed;
  3. options 在 map 就绪创建 player 时捕获;数据带 time 即 realtime 模式,
     speed 为倍率(realtime 下 1=真实时间,示例用 60× 便于观察);
  4. map 必须等 load 事件(createMinemapMap resolve)后再交给 mapRef:提前交会导致
     trail 的 addSource/addLayer 在样式加载前抛 "Style is not done loading",
     player 创建失败、后续 play() 被静默丢弃;
  5. 组件卸载先 mapRef=null(useTrackPlayer 自动 destroy player 回收资源)再 map.remove()。
-->
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef } from "vue";
import { useTrackPlayer } from "@ym/map-tools/vue3";
import type { MapLike } from "@ym/map-tools/vue3";
import { createMinemapMap } from "../shared/loadMinemap";
import { TRACK_A, BUS_ICON, START_ICON, END_ICON } from "../shared/trackData";

const hostRef = shallowRef<HTMLDivElement | null>(null);
const mapRef = shallowRef<MapLike | null>(null);

const { status, progress, play, pause, stop, seekFraction, setSpeed } = useTrackPlayer(mapRef, {
  points: TRACK_A.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
  icon: BUS_ICON,
  bearingCompensation: 0, // 示例图标朝上
  speed: 60, // realtime 60×,便于快速观察(单车 solo 模式下 speed 即时钟倍率)
  trail: { color: "#1F6BFE", width: 4 },
  startEndMarkers: true,
  startIcon: START_ICON,
  endIcon: END_ICON,
});

// 与 vue2/react 变体一致的内联按钮样式(不依赖 demo.css 的 .demo-btn 绿色主题)
const btnStyle =
  "padding:4px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(8,14,12,.86);color:#e6fff2;cursor:pointer;margin-right:8px;";

let disposed = false;
let mapInstance: minemap.Map | null = null;

onMounted(async () => {
  try {
    const map = await createMinemapMap(hostRef.value!); // 等 load 事件后才 resolve
    if (disposed) {
      map.remove();
      return;
    }
    mapInstance = map;
    mapRef.value = map as unknown as MapLike; // 触发 useTrackPlayer 懒建 player
    await nextTick(); // watcher(flush: pre)在下一轮 flush 建 player,等它就绪再起播
    play(); // 默认自动起播一次
  } catch (error) {
    console.error(error);
  }
});

onBeforeUnmount(() => {
  disposed = true;
  mapRef.value = null; // useTrackPlayer 自动 destroy(player),回收 marker/trail 资源
  mapInstance?.remove();
  mapInstance = null;
});

function fmtKm(meters: number | undefined): string {
  return ((meters ?? 0) / 1000).toFixed(2);
}
</script>

<template>
  <div style="position: absolute; inset: 0">
    <div ref="hostRef" style="position: absolute; inset: 0"></div>
    <div
      style="
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 30;
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      "
    >
      <button :style="btnStyle" @click="play()">播放</button>
      <button :style="btnStyle" @click="pause()">暂停</button>
      <button :style="btnStyle" @click="stop()">停止</button>
      <button :style="btnStyle" @click="setSpeed(20)">慢</button>
      <button :style="btnStyle" @click="setSpeed(60)">正常</button>
      <button :style="btnStyle" @click="setSpeed(150)">快</button>
      <input
        type="range"
        min="0"
        max="1000"
        :value="Math.round((progress?.fraction ?? 0) * 1000)"
        style="width: 180px"
        @input="seekFraction(Number(($event.target as HTMLInputElement).value) / 1000)"
      />
    </div>
    <div
      style="
        position: absolute;
        left: 12px;
        bottom: 12px;
        z-index: 30;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        background: rgba(8, 14, 12, 0.86);
        color: #b9f6d5;
        font-family: ui-monospace, Consolas, monospace;
      "
    >
      {{ status }} ｜ 里程 {{ fmtKm(progress?.distanceMeters) }} km ｜
      {{ ((progress?.fraction ?? 0) * 100).toFixed(1) }}%
    </div>
  </div>
</template>
