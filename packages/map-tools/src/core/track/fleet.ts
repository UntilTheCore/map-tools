import { invalidArgument } from "../errors";
import { createPlaybackClock, type PlaybackClock } from "./clock";
import { getTrackPlayerInternals } from "./player";
import type {
  FleetEventName,
  FleetEventMap,
  TrackFleetHandle,
  TrackFleetOptions,
  TrackMode,
  TrackPlayerHandle,
  TrackStatus,
} from "./types";

interface FleetMemberEntry {
  status: TrackStatus;
  unsubscribeStatus: () => void;
  unsubscribeProgress: () => void;
}

/**
 * 多车同步回放编排器(纯编排:不含 marker/地图调用)。
 *
 * 时钟唯一驱动者是 fleet 本身(契约 14):成员级控制只冻结/恢复自身投影,
 * fleet 级控制驱动共享时钟。终点与停钟逻辑严格遵循契约 15 全套:
 * - 成员状态表(add 订阅 status/remove/destroy 退订,冻结判定 = status !== "playing");
 * - 条件 A:elapsed ≥ 轴总长 → clock.pause() + emit arrive{fraction:1} + ended;
 * - 条件 B 边沿:!anyFollowing && prevAnyFollowing → clock.pause(),不 emit arrive,autoFrozen;
 * - play() 三态分派(ended → 全量重播 / autoFrozen / 其余 → 仅起时钟);
 * - seek 清终态(15-补 1);stop 全员归零复位。
 */
export function createTrackFleet(options: TrackFleetOptions = {}): TrackFleetHandle {
  if (!options || typeof options !== "object") invalidArgument("options must be an object");
  if (options.speed !== undefined && (!Number.isFinite(options.speed) || options.speed <= 0)) {
    invalidArgument("options.speed must be a finite number > 0");
  }
  if (options.timeRange !== undefined) {
    const range = options.timeRange;
    if (
      !Array.isArray(range) ||
      range.length !== 2 ||
      !Number.isFinite(range[0]) ||
      !Number.isFinite(range[1]) ||
      range[1] < range[0]
    ) {
      invalidArgument("options.timeRange must be [start, end] epoch-ms with end >= start");
    }
  }

  const injectedClock = options.clock ?? null;
  if (injectedClock && typeof injectedClock.subscribe !== "function") {
    invalidArgument("options.clock must be a PlaybackClock");
  }
  const ownClock = injectedClock ? null : createPlaybackClock(options.speed ?? 1);
  const clock: PlaybackClock = injectedClock ?? (ownClock as PlaybackClock);

  const members = new Map<TrackPlayerHandle, FleetMemberEntry>();
  let mode: TrackMode | null = null;
  /** realtime:当前生效轴 [起, 止](显式锁定 or 并集重算);uniform:轴长(ms)。 */
  const explicitRange: readonly [number, number] | null = options.timeRange
    ? ([...options.timeRange] as [number, number])
    : null;
  let uniformAxisLockedMs: number | null = null; // 首个 add 定格快照,此后不重算(契约 6)
  let axisLengthMs = 0;

  let ended = false;
  let autoFrozen = false;
  let prevAnyFollowing = false;
  let destroyed = false;
  let lastProgressEmitAt = -Infinity;

  const listeners = new Map<FleetEventName, Set<(payload: never) => void>>();

  function emit<K extends FleetEventName>(event: K, payload: FleetEventMap[K]): void {
    const set = listeners.get(event);
    if (!set) return;
    for (const listener of [...set]) {
      (listener as (value: FleetEventMap[K]) => void)(payload);
    }
  }

  /** 现存成员的数据时间轴并集(realtime 缺省轴,契约 6)。 */
  function computeUnionRange(): readonly [number, number] | null {
    let start = Number.POSITIVE_INFINITY;
    let end = Number.NEGATIVE_INFINITY;
    let found = false;
    for (const member of members.keys()) {
      const range = member.dataTimeRange;
      if (!range) continue;
      found = true;
      if (range[0] < start) start = range[0];
      if (range[1] > end) end = range[1];
    }
    return found ? [start, end] : null;
  }

  /** 依据成员集合刷新轴(realtime 重算或显式;uniform 快照)。 */
  function refreshAxis(): void {
    if (mode === "uniform") {
      if (explicitRange) {
        axisLengthMs = explicitRange[1] - explicitRange[0];
        return;
      }
      if (uniformAxisLockedMs === null) {
        // 首个成员 add 定格(契约 6:此后 add/remove 不重算,防 fraction 跳变)。
        let longest = 1;
        for (const member of members.keys()) longest = Math.max(longest, member.durationMs);
        uniformAxisLockedMs = longest;
      }
      axisLengthMs = uniformAxisLockedMs;
      return;
    }
    // realtime
    const range = explicitRange ?? computeUnionRange();
    axisLengthMs = range && range[1] > range[0] ? range[1] - range[0] : 0;
    if (range) {
      for (const member of members.keys()) {
        getTrackPlayerInternals(member)?.rebase(range[0]);
      }
    }
  }

  function add(player: TrackPlayerHandle): void {
    if (destroyed) invalidArgument("cannot add to a destroyed fleet");
    if (!player || typeof player.on !== "function")
      invalidArgument("player must be a TrackPlayerHandle");
    if (members.has(player)) return;
    if (player.clock !== clock) {
      invalidArgument(
        "player.clock must be fleet.clock; create players with { clock: fleet.clock }",
      );
    }
    if (player.hasExplicitTimeRange) {
      invalidArgument(
        "members with explicit options.timeRange cannot join a fleet (the fleet owns the axis); rebuild the player without timeRange",
      );
    }
    if (mode === null) {
      mode = player.mode;
    } else if (player.mode !== mode) {
      invalidArgument(`all fleet members must share the same mode ("${mode}")`);
    }
    if (mode === "realtime" && !player.dataTimeRange) {
      invalidArgument("realtime fleet members must carry time on every point");
    }

    let entryStatus: TrackStatus = player.getStatus();
    const entry: FleetMemberEntry = {
      status: entryStatus,
      unsubscribeStatus: player.on("status", ({ status }) => {
        entryStatus = status;
        entry.status = status;
      }),
      unsubscribeProgress: player.on("progress", () => {
        /* 成员 progress 不转发:全局 progress 由 fleet tick 按轴推导(契约 15)。订阅仅为通道占位。 */
      }),
    };
    members.set(player, entry);
    refreshAxis();
  }

  function remove(player: TrackPlayerHandle): void {
    const entry = members.get(player);
    if (!entry) return;
    entry.unsubscribeStatus();
    entry.unsubscribeProgress();
    members.delete(player);
    refreshAxis();
  }

  function onTick(elapsedMs: number): void {
    if (destroyed) return;
    if (axisLengthMs > 0 && elapsedMs >= axisLengthMs) {
      // 条件 A(契约 15):时钟已停,本轮 tick 内全员已按最终 elapsed 投影(分发原子性,15-补 3)。
      clock.pause();
      ended = true;
      autoFrozen = false;
      emit("progress", { fraction: 1 });
      emit("arrive", { fraction: 1 });
      return;
    }
    let anyFollowing = false;
    for (const entry of members.values()) {
      if (entry.status === "playing") {
        anyFollowing = true;
        break;
      }
    }
    if (!anyFollowing && prevAnyFollowing) {
      // 条件 B 边沿:全员冻结但轴未走完 → 停钟、不 emit arrive、进度停在实际 fraction。
      clock.pause();
      autoFrozen = true;
      prevAnyFollowing = false;
      return;
    }
    prevAnyFollowing = anyFollowing;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastProgressEmitAt >= 100) {
      lastProgressEmitAt = now;
      emit("progress", {
        fraction: axisLengthMs === 0 ? 1 : Math.min(1, elapsedMs / axisLengthMs),
      });
    }
  }

  const unsubscribeTick = clock.subscribe(onTick);

  /**
   * 起播/恢复。三态分派(契约 15):
   * - ended → clock.seekMs(0) + 每成员 play(0)(全量重播,解除含手动 pause 的全部冻结);
   * - autoFrozen → 仅起时钟(不重置成员;边沿检测保证复播后不会立即再停);
   * - 其余 → 仅起时钟。每次 play() 末尾 autoFrozen=false。
   * 时钟自动停后恢复播放的唯一途径即本方法(成员级 play() 不动共享时钟)。
   */
  function play(): void {
    if (destroyed) invalidArgument("cannot play a destroyed fleet");
    if (axisLengthMs === 0) return; // 无成员/无轴:静默等待 add
    if (ended) {
      ended = false;
      clock.seekMs(0);
      for (const member of members.keys()) member.play(0); // injected 下 from 被忽略,仅解除冻结(契约 14-补)
      lastProgressEmitAt = -Infinity;
    } else if (autoFrozen) {
      // 仅起时钟、不重置成员:arrive 者停终点、手动 pause 者保持冻结;
      // 边沿检测(prevAnyFollowing)保证复播后不会一 tick 内再停。
    }
    autoFrozen = false;
    prevAnyFollowing = false;
    clock.play();
  }

  function pause(): void {
    if (destroyed) return;
    clock.pause();
  }

  function stop(): void {
    if (destroyed) return;
    for (const member of members.keys()) member.stop();
    clock.stop();
    ended = false;
    autoFrozen = false;
    prevAnyFollowing = false;
    lastProgressEmitAt = -Infinity;
    emit("progress", { fraction: 0 });
  }

  /** 全局轴归一化跳转(越界钳制);执行后清终态标志,避免 play() 误触发全量重播(15-补 1)。 */
  function seekFraction(fraction: number): void {
    if (destroyed) invalidArgument("cannot seek a destroyed fleet");
    if (typeof fraction !== "number" || !Number.isFinite(fraction)) {
      invalidArgument("fraction must be a finite number");
    }
    const value = fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;
    ended = false;
    autoFrozen = false;
    clock.seekMs(value * axisLengthMs);
    emit("progress", { fraction: value });
  }

  /** clock 原始 elapsed 轴(ms,倍率投影前,契约 7);清终态规则同 seekFraction。 */
  function seekTime(ms: number): void {
    if (destroyed) invalidArgument("cannot seek a destroyed fleet");
    if (!Number.isFinite(ms) || ms < 0) invalidArgument("ms must be a finite number >= 0");
    ended = false;
    autoFrozen = false;
    clock.seekMs(ms);
    emit("progress", { fraction: axisLengthMs === 0 ? 1 : Math.min(1, ms / axisLengthMs) });
  }

  function setSpeed(rate: number): void {
    if (destroyed) return;
    if (!Number.isFinite(rate) || rate <= 0) invalidArgument("rate must be a finite number > 0");
    clock.setRate(rate); // 契约 1:倍率不改变轴总长
  }

  return {
    clock,
    add,
    remove,
    play,
    pause,
    stop,
    seekFraction,
    seekTime,
    setSpeed,
    on(event, listener) {
      if (destroyed) invalidArgument("cannot subscribe to a destroyed fleet");
      let set = listeners.get(event);
      if (!set) {
        set = new Set();
        listeners.set(event, set);
      }
      set.add(listener as (payload: never) => void);
      return () => {
        listeners.get(event)?.delete(listener as (payload: never) => void);
      };
    },
    destroy() {
      if (destroyed) return; // 契约 12:幂等
      destroyed = true;
      unsubscribeTick();
      for (const entry of members.values()) {
        entry.unsubscribeStatus();
        entry.unsubscribeProgress();
      }
      members.clear();
      listeners.clear();
      if (ownClock) ownClock.destroy(); // 契约 9:自建连删、注入只退订;不代 destroy 成员(15-补 4 前提)
    },
  };
}
