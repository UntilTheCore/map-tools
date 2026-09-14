import {
  createPlaybackClock,
  createTrackFleet,
  createTrackPlayer,
  type PlaybackClock,
  type TrackEventMap,
  type TrackFleetHandle,
  type TrackPlayerHandle,
  type TrackProgress,
} from "@ym/map-tools/track";
import type { MapLike } from "@ym/map-tools";

export {};

declare const map: MapLike;

// --- 最小用法:一行起播 ---
const player: TrackPlayerHandle = createTrackPlayer(map, {
  points: [
    { lng: 106.55, lat: 29.56, time: 1_720_000_000_000 },
    { lng: 106.56, lat: 29.57, time: 1_720_000_060_000 },
  ],
  icon: "/bus.png",
});
player.play();
player.pause();
player.stop();

// play(from) 的 from 为 fraction(0–1)
player.play(0.5);
player.seekFraction(0.25);
// 越界钳制:类型层面接受任意 number
player.seekFraction(1.5);
player.seekTime(30_000);
player.setSpeed(2);

const status: "stopped" | "playing" | "paused" = player.getStatus();
const progress: TrackProgress = player.getProgress();
void progress.fraction;
void progress.distanceMeters;
void progress.timeMs; // number | undefined(uniform = elapsed,realtime = epoch ms)
void progress.coordinate[0];

const { mode } = player;
const duration: number = player.durationMs;
const total: number = player.totalMeters;
const range = player.dataTimeRange;
void status;
void mode;
void duration;
void total;
void range;

// --- 事件 payload(契约 16,四事件各一例) ---
const offProgress = player.on("progress", (payload: TrackProgress) => {
  void payload.fraction;
  void payload.coordinate;
});
player.on("arrive", (payload) => {
  // arrive 复用 TrackProgress 终态快照
  const one: number = payload.fraction;
  void one;
});
player.on("status", ({ status: next }) => {
  void next;
});
player.on("error", ({ code, message }) => {
  // code 联合含 MapToolsErrorCode 与 "NON_MONOTONIC_TIME" 字面量
  if (code === "NON_MONOTONIC_TIME") void message;
  if (code === "INVALID_ARGUMENT") void message;
});
offProgress();

// 自定义 marker 工厂(SDK 解耦,不依赖 minemap 全局)
const decoupled = createTrackPlayer(map, {
  points: [
    { lng: 0, lat: 0 },
    { lng: 1, lat: 1 },
  ],
  createMarker: (_initial, rotation) => ({
    setLngLat() {},
    setRotation(r) {
      void r;
      void rotation;
    },
    remove() {},
  }),
});
void decoupled;

// --- clock ---
const clock: PlaybackClock = createPlaybackClock(1);
const unsubscribe = clock.subscribe((elapsedMs: number) => void elapsedMs);
clock.play();
clock.pause();
clock.seekMs(1000);
clock.setRate(2);
clock.stop();
unsubscribe();

// --- fleet:createTrackFleet() 立即暴露 clock,成员用 fleet.clock 创建后 add ---
const fleet: TrackFleetHandle = createTrackFleet();
const members = [
  createTrackPlayer(map, {
    points: [
      { lng: 0, lat: 0 },
      { lng: 1, lat: 1 },
    ],
    clock: fleet.clock,
  }),
  createTrackPlayer(map, {
    points: [
      { lng: 2, lat: 2 },
      { lng: 3, lat: 3 },
    ],
    clock: fleet.clock,
  }),
];
for (const member of members) fleet.add(member);
members.forEach((m) => m.play());
fleet.play();
fleet.seekFraction(0.5);
fleet.seekTime(10_000);
fleet.setSpeed(3);
fleet.pause();
fleet.stop();

fleet.on("progress", ({ fraction }: { fraction: number }) => void fraction);
fleet.on("arrive", ({ fraction }: { fraction: number }) => void fraction);

// 成员销毁顺序:先 remove 再 destroy(契约 15-补 4)
fleet.remove(members[0]);
members[0].destroy();
fleet.destroy();

// --- 注入外部时钟的 fleet + 显式锁定轴 ---
const externalClock = createPlaybackClock();
const lockedFleet = createTrackFleet({ clock: externalClock, timeRange: [0, 60_000] });
void lockedFleet;

// 类型断言:player.clock 暴露 PlaybackClock,供 fleet.add 校验
const playerClock: PlaybackClock = player.clock;
void playerClock;

// 错误事件类型映射存在性
type ErrorPayload = TrackEventMap["error"];
const err: ErrorPayload = { code: "NON_MONOTONIC_TIME", message: "x" };
void err;

// @ts-expect-error play 的 from 不接受字符串
player.play("half");
// @ts-expect-error fleet 事件面只有 progress/arrive
fleet.on("status", () => {});
