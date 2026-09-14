<!--
  多车同步轨迹回放（Vue 3 SFC + createTrackFleet）。
  关键点：
  1. fleet 是纯编排器(无框架耦合),在 SFC 中直接用 core API,生命周期自己管;
  2. createTrackFleet({ speed: 60 }) 自建共享时钟(60×);成员用 { clock: fleet.clock }
     创建并 add,成员不传 speed——injected 成员的 speed 是成员自身倍率,
     会与共享时钟倍率相乘(契约 1),导致车辆先跑完而全局进度几乎不动;
  3. 起播顺序固定:成员各自 play() 进入 following,fleet.play() 仅驱动共享时钟;
  4. 「播放」按钮:手动冻结成员保持冻结(示范条件 B 恢复语义),其余成员 play()
     重新进入跟随态后 fleet.play()——覆盖停止后重启/终态 seek 回看两种场景;
  5. 清理链(契约 15-补 4):onUnmounted 先逐个 fleet.remove → player.destroy,
     再 fleet.destroy(自建时钟连删,契约 9),最后 map.remove()。
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from "vue";
import { createTrackFleet, createTrackPlayer, type TrackPlayerHandle } from "@ym/map-tools/track";
import type { MapLike } from "@ym/map-tools/vue3";
import { createMinemapMap } from "../shared/loadMinemap";
import {
  TRACK_A,
  TRACK_B,
  TRACK_C,
  BUS_ICON,
  BUS_ICON_BLUE,
  BUS_ICON_GREEN,
} from "../shared/trackData";

const hostRef = shallowRef<HTMLDivElement | null>(null);
const percent = ref("0.0");
const statusText = ref("等待地图就绪…");
let fleet: ReturnType<typeof createTrackFleet> | null = null;
let players: TrackPlayerHandle[] = [];
const manualFrozen = new Set<TrackPlayerHandle>();
let mapInstance: minemap.Map | null = null;

// 三车三图标三色:橙/蓝(真实素材)+ 绿(同风格 SVG),trail 颜色与车身一致
const BUS_ICONS = [BUS_ICON, BUS_ICON_BLUE, BUS_ICON_GREEN];
const COLORS = ["#E67E22", "#1F6BFE", "#0E9F6E"];

// 与 vue2/react 变体一致的内联按钮样式(不依赖 demo.css 的 .demo-btn 绿色主题)
const btnStyle =
  "padding:4px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(8,14,12,.86);color:#e6fff2;cursor:pointer;margin-right:8px;";

onMounted(async () => {
  fleet = createTrackFleet({ speed: 60 }); // 车队倍率 60×,成员不再各自传 speed
  mapInstance = await createMinemapMap(hostRef.value!); // 等 load 后再建 player
  const map = mapInstance as unknown as MapLike;
  players = [TRACK_A, TRACK_B, TRACK_C].map((track, index) => {
    const player = createTrackPlayer(map, {
      points: track.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
      icon: BUS_ICONS[index],
      bearingCompensation: 0,
      trail: { color: COLORS[index], width: 3 },
      clock: fleet!.clock,
      id: `bus-${index}`,
    });
    fleet!.add(player);
    return player;
  });
  fleet.on("progress", ({ fraction }) => {
    percent.value = (fraction * 100).toFixed(1);
  });
  fleet.on("arrive", () => {
    statusText.value = "全队完成（时钟自动停）";
    percent.value = "100.0";
  });
  statusText.value = "三车同步回放中";
  // 起播顺序:成员先各自进入 following,fleet.play() 仅驱动共享时钟。
  players.forEach((player) => player.play());
  fleet.play();
});

function play() {
  // 手动冻结的成员保持冻结(示范条件 B);其余成员重新进入跟随态后起时钟
  // ——覆盖「停止后重启」「终态 seek 回看」「arrive 成员恢复」三种场景。
  players.forEach((player) => {
    if (!manualFrozen.has(player)) player.play();
  });
  fleet?.play();
}
function pause() {
  fleet?.pause();
}
function stop() {
  manualFrozen.clear();
  fleet?.stop();
  percent.value = "0.0";
}
function freezeFirst() {
  if (players[0]) manualFrozen.add(players[0]);
  players[0]?.pause();
}
function resumeFirst() {
  if (players[0]) manualFrozen.delete(players[0]);
  players[0]?.play();
}
function seek(event: Event) {
  fleet?.seekFraction(Number((event.target as HTMLInputElement).value) / 1000);
}

onUnmounted(() => {
  // 契约 15-补 4:先退队再销毁成员;fleet.destroy 自建时钟连删(契约 9),不代销毁成员。
  players.forEach((player) => {
    fleet?.remove(player);
    player.destroy();
  });
  fleet?.destroy();
  fleet = null;
  players = [];
  manualFrozen.clear();
  mapInstance?.remove();
  mapInstance = null;
});
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
      <button :style="btnStyle" @click="play">播放</button>
      <button :style="btnStyle" @click="pause">暂停</button>
      <button :style="btnStyle" @click="stop">停止</button>
      <button :style="btnStyle" @click="freezeFirst">冻结橙车</button>
      <button :style="btnStyle" @click="resumeFirst">恢复橙车</button>
      <input
        type="range"
        min="0"
        max="1000"
        :value="Math.round(Number(percent) * 10)"
        style="width: 180px"
        @input="seek"
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
      {{ statusText }} ｜ 全局进度 {{ percent }}%
    </div>
  </div>
</template>
