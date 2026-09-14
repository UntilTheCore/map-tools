import { invalidArgument } from "../errors";
import type { TrackStatus } from "./types";

export type ClockTickListener = (elapsedMs: number) => void;

/**
 * 回放时钟:单 RAF 产出单调累计 elapsed,是「动画与帧率解耦」的唯一时间源。
 *
 * **tick 分发原子性(契约 15-补 3)**:每 tick 先更新 elapsed,再对本轮订阅者**快照**
 * 逐一完整回调;回调内调用 pause()/stop() 仅置状态、**不中断本轮剩余回调**
 * (下一 tick 起才停止分发)。保证 fleet 条件 A 停钟的同一 tick 内,全体成员
 * 已按最终 elapsed 完成投影并各自 arrive,不存在「停在终点前一帧」的失配。
 *
 * setRate 只缩放后续 tick 的增量,不回溯已累计的 elapsed(seek 语义见 seekMs)。
 */
export interface PlaybackClock {
  /** 订阅 tick,返回取消函数。tick 携带当前累计 elapsed(ms)。 */
  subscribe(listener: ClockTickListener): () => void;
  /** 起播(playing)。幂等:重复 play 无副作用。 */
  play(): void;
  /** 暂停:保留 elapsed,停止 RAF。 */
  pause(): void;
  /** 停止:elapsed 归零并暂停。 */
  stop(): void;
  /** 直接跳转原始 elapsed 轴(ms,倍率投影前,契约 7)。 */
  seekMs(ms: number): void;
  /** 设置倍率(>0);只影响后续 tick 增量(契约 1)。 */
  setRate(rate: number): void;
  getRate(): number;
  getElapsedMs(): number;
  getStatus(): TrackStatus;
  /** 停止 RAF 并清空订阅;幂等(契约 12)。 */
  destroy(): void;
}

/** 单帧最大计入增量(ms):页面隐藏/标签切换后恢复时,RAF 时间戳会产生数百秒级大跳,
 * 不钳制会让回放瞬间跳到终点。钳到 200ms ≈ 5fps 等效速率,肉眼无感且防跳帧。 */
const MAX_FRAME_DELTA_MS = 200;

export function createPlaybackClock(initialRate = 1): PlaybackClock {
  if (!Number.isFinite(initialRate) || initialRate <= 0) {
    invalidArgument("initialRate must be a finite number > 0");
  }

  let listeners = new Set<ClockTickListener>();
  let status: TrackStatus = "stopped";
  let elapsedMs = 0;
  let rate = initialRate;
  let rafId: number | null = null;
  let lastTs: number | null = null;
  let disposed = false;

  /** 本轮是否要求停止分发:tick 回调内 pause/stop 置位后,下一帧前清 RAF。 */
  let stopDispatch = false;

  function tick(ts: number): void {
    rafId = null;
    if (disposed || status !== "playing") return;

    const delta = lastTs === null ? 0 : Math.min(MAX_FRAME_DELTA_MS, Math.max(0, ts - lastTs));
    lastTs = ts;
    elapsedMs += delta * rate;

    stopDispatch = false;
    // 快照遍历:分发期间新增/移除的订阅不影响本轮(原子性契约)。
    const snapshot = [...listeners];
    for (const listener of snapshot) {
      listener(elapsedMs);
      if (disposed) break;
    }

    if (disposed) return;
    if (stopDispatch || status !== "playing") {
      stopDispatch = false;
      return;
    }
    scheduleNext();
  }

  function scheduleNext(): void {
    if (rafId === null && !disposed && status === "playing") {
      rafId = requestAnimationFrame(tick);
    }
  }

  function play(): void {
    if (disposed || status === "playing") return;
    status = "playing";
    lastTs = null;
    scheduleNext();
  }

  /** 状态转非 playing 时立即撤销待执行帧:停钟后不留悬挂 RAF。 */
  function cancelPending(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function pause(): void {
    if (disposed) return;
    if (status === "playing") stopDispatch = true;
    status = "paused";
    cancelPending();
  }

  function stop(): void {
    if (disposed) return;
    if (status === "playing") stopDispatch = true;
    status = "stopped";
    elapsedMs = 0;
    lastTs = null;
    cancelPending();
  }

  function seekMs(ms: number): void {
    if (disposed) return;
    if (!Number.isFinite(ms) || ms < 0) invalidArgument("ms must be a finite number >= 0");
    elapsedMs = ms;
  }

  function setSpeed(rateValue: number): void {
    if (disposed) return;
    if (!Number.isFinite(rateValue) || rateValue <= 0) {
      invalidArgument("rate must be a finite number > 0");
    }
    rate = rateValue;
  }

  return {
    subscribe(listener) {
      if (disposed) invalidArgument("cannot subscribe to a destroyed clock");
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    play,
    pause,
    stop,
    seekMs,
    setRate: setSpeed,
    getRate: () => rate,
    getElapsedMs: () => elapsedMs,
    getStatus: () => status,
    destroy() {
      if (disposed) return;
      disposed = true;
      status = "stopped";
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      listeners = new Set();
    },
  };
}
