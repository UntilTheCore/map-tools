import { markRaw, onUnmounted, ref, shallowRef, watch } from "vue";
import type { Ref } from "vue";
import {
  createTrackPlayer,
  type TrackPlayerHandle,
  type TrackPlayerOptions,
  type TrackProgress,
  type TrackStatus,
} from "../core/track";
import type { MapLike } from "../types/public";

export type {
  TrackFleetHandle,
  TrackFleetOptions,
  TrackMode,
  TrackPlayerHandle,
  TrackPlayerOptions,
  TrackProgress,
  TrackStatus,
} from "../core/track";

/**
 * useTrackPlayer 返回值。player 为响应式引用:map 尚未就绪时为 null,
 * 就绪后自动创建;map 变化即销毁重建(契约细则见 core/track 类型注释)。
 */
export interface UseTrackPlayerReturn {
  player: Ref<TrackPlayerHandle | null>;
  /** player 当前状态;未创建时为 "stopped"。 */
  status: Ref<TrackStatus>;
  /** 最近一次 progress 快照(含初始落位);未创建时为 null。 */
  progress: Ref<TrackProgress | null>;
  play(from?: number): void;
  pause(): void;
  stop(): void;
  seekFraction(fraction: number): void;
  seekTime(ms: number): void;
  setSpeed(rate: number): void;
}

/**
 * 响应式轨迹回放 composable(Vue 2.7+ / Vue 3 共用实现,签名与 useMap 对齐)。
 *
 * - `map` 接受实例或 `Ref<MapLike | null>`(minemap 动态加载是常态);
 * - map 异步到达时非空才懒建 player,变 null 即销毁,换新 map 销毁重建
 *   (player 无状态复用,与 useMap 的 attach/detach 不同);
 * - `options` 在创建时刻捕获,后续变化不重解析(需要换数据请用新 map 引用或手动重建);
 * - `onUnmounted` 自动 destroy(player)(幂等,契约 12)。
 */
export function useTrackPlayer(
  map: MapLike | Ref<MapLike | null>,
  options: TrackPlayerOptions,
): UseTrackPlayerReturn {
  const mapRef: Ref<MapLike | null> = isMapLike(map)
    ? (ref(markRaw(map)) as Ref<MapLike | null>)
    : (map as Ref<MapLike | null>);

  const player = shallowRef<TrackPlayerHandle | null>(null);
  const status = ref<TrackStatus>("stopped") as Ref<TrackStatus>;
  const progress = shallowRef<TrackProgress | null>(null);
  let unsubscribeEvents: (() => void) | null = null;

  function destroyPlayer(): void {
    unsubscribeEvents?.();
    unsubscribeEvents = null;
    player.value?.destroy();
    player.value = null;
    status.value = "stopped";
    progress.value = null;
  }

  function createPlayer(instance: MapLike): void {
    const created = createTrackPlayer(instance, options);
    const offProgress = created.on("progress", (payload) => {
      progress.value = payload;
    });
    const offStatus = created.on("status", ({ status: next }) => {
      status.value = next;
      if (next === "stopped") progress.value = created.getProgress();
    });
    unsubscribeEvents = () => {
      offProgress();
      offStatus();
    };
    player.value = created;
    progress.value = created.getProgress();
    status.value = created.getStatus();
  }

  watch(
    mapRef,
    (instance, previous) => {
      if (instance === previous) return;
      destroyPlayer();
      if (instance) createPlayer(instance);
    },
    { immediate: true },
  );

  onUnmounted(destroyPlayer);

  function withPlayer(action: (handle: TrackPlayerHandle) => void): void {
    const handle = player.value;
    if (!handle) return; // map 尚未就绪:静默丢弃,就绪后可再次调用
    action(handle);
  }

  return {
    player,
    status,
    progress,
    play: (from) => withPlayer((handle) => handle.play(from)),
    pause: () => withPlayer((handle) => handle.pause()),
    stop: () => withPlayer((handle) => handle.stop()),
    seekFraction: (fraction) => withPlayer((handle) => handle.seekFraction(fraction)),
    seekTime: (ms) => withPlayer((handle) => handle.seekTime(ms)),
    setSpeed: (rate) => withPlayer((handle) => handle.setSpeed(rate)),
  };
}

function isMapLike(value: unknown): value is MapLike {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as MapLike).getSource === "function"
  );
}
