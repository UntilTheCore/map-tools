import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
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

export interface UseTrackPlayerReturn {
  player: TrackPlayerHandle | null;
  status: TrackStatus;
  progress: TrackProgress | null;
  play(from?: number): void;
  pause(): void;
  stop(): void;
  seekFraction(fraction: number): void;
  seekTime(ms: number): void;
  setSpeed(rate: number): void;
}

/**
 * 轨迹回放 React Hook(React 18+)。
 *
 * - `map` 实例或 `MutableRefObject<MapLike | null>`(动态加载 SDK 的常态);
 * - map 非空时懒建 player,变 null 销毁,换新 map 销毁重建(与 useMap 的 attach/detach 不同);
 * - StrictMode 双挂载经 setTimeout(0) 防抖(仿 useMap 清理链);
 * - options 在创建时刻捕获,后续变化不重解析;
 * - 卸载时自动 destroy(player)(幂等)。
 */
export function useTrackPlayer(
  map: MapLike | MutableRefObject<MapLike | null> | null | undefined,
  options: TrackPlayerOptions,
): UseTrackPlayerReturn {
  const [player, setPlayer] = useState<TrackPlayerHandle | null>(null);
  const [status, setStatus] = useState<TrackStatus>("stopped");
  const [progress, setProgress] = useState<TrackProgress | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 稳定的 map 读取:实例直传或 Ref 包装。
  const resolvedMap = readMap(map);

  useEffect(() => {
    if (!resolvedMap) {
      setPlayer(null);
      setStatus("stopped");
      setProgress(null);
      return;
    }
    let disposed = false;
    const handle = createTrackPlayer(resolvedMap, optionsRef.current);
    const offProgress = handle.on("progress", (payload) => {
      if (!disposed) setProgress(payload);
    });
    const offStatus = handle.on("status", ({ status: next }) => {
      if (disposed) return;
      setStatus(next);
      if (next === "stopped") setProgress(handle.getProgress());
    });
    setPlayer(handle);
    setStatus(handle.getStatus());
    setProgress(handle.getProgress());
    return () => {
      disposed = true;
      offProgress();
      offStatus();
      // StrictMode 双挂载:cleanup 会销毁上一轮创建的 handle;destroy 幂等(契约 12)。
      handle.destroy();
    };
  }, [resolvedMap]);

  const play = useCallback((from?: number) => player?.play(from), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const stop = useCallback(() => player?.stop(), [player]);
  const seekFraction = useCallback((fraction: number) => player?.seekFraction(fraction), [player]);
  const seekTime = useCallback((ms: number) => player?.seekTime(ms), [player]);
  const setSpeed = useCallback((rate: number) => player?.setSpeed(rate), [player]);

  return { player, status, progress, play, pause, stop, seekFraction, seekTime, setSpeed };
}

function readMap(
  map: MapLike | MutableRefObject<MapLike | null> | null | undefined,
): MapLike | null {
  if (!map) return null;
  if (isMapLike(map)) return map;
  return (map as MutableRefObject<MapLike | null>).current ?? null;
}

function isMapLike(value: unknown): value is MapLike {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as MapLike).getSource === "function" &&
    typeof (value as MapLike).addSource === "function"
  );
}
