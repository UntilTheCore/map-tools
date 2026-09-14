import type { Feature, FeatureCollection, LineString } from "geojson";
import type { Coordinate } from "../../types/geometry";
import type { MapLayer } from "../../types/layer";
import type { MapLike } from "../../types/map";
import { MapToolsError, invalidArgument } from "../errors";
import { ensureLayer } from "../resources/layer";
import { createLayerId, createSourceId } from "../resources/ids";
import { removeResources } from "../resources/cleanup";
import { removeOverlays, type RemovableOverlay } from "../overlays/lifecycle";
import { upsertGeoJSONSource, updateSourceData } from "../resources/source";
import { createPlaybackClock, type PlaybackClock } from "./clock";
import { bearingDeg, type TrackCoordinate } from "./geodesy";
import { normalizeTrack, type NormalizedTrack } from "./normalize";
import { locateByDistance, timeToDistance } from "./projection";
import type {
  TrackEventName,
  TrackEventMap,
  TrackMarkerLike,
  TrackMode,
  TrackPlayerHandle,
  TrackPlayerOptions,
  TrackProgress,
  TrackStatus,
} from "./types";

/* ------------------------------------------------------------------ *
 * fleet 专用内部通道:rebase(realtime 成员投影轴起点)。
 * 不进任何公开 barrel,仅 core/track 内部(fleet.ts)消费。
 * ------------------------------------------------------------------ */
export interface TrackPlayerInternals {
  /** realtime:把成员投影轴起点重定位到全局轴起点(「无数据区间停车等待」的落点,契约 6)。 */
  rebase(axisOriginMs: number): void;
}

const internalsRegistry = new WeakMap<TrackPlayerHandle, TrackPlayerInternals>();

export function getTrackPlayerInternals(
  handle: TrackPlayerHandle,
): TrackPlayerInternals | undefined {
  return internalsRegistry.get(handle);
}

/* ------------------------------------------------------------------ *
 * 默认 marker 工厂(SDK 解耦:仅公共 API,零 _update hack)
 * ------------------------------------------------------------------ */

interface MinemapLike {
  Marker: new (el: HTMLElement, options?: Record<string, unknown>) => MinemapMarkerInstance;
}

interface MinemapMarkerInstance extends RemovableOverlay {
  setLngLat(lngLat: Coordinate): unknown;
  setRotation?(rotation: number): unknown;
  addTo(map: unknown): unknown;
}

function getGlobalMinemap(): MinemapLike | undefined {
  return (globalThis as { minemap?: MinemapLike }).minemap;
}

function createIconElement(url: string, size: number): HTMLElement {
  const el = document.createElement("div");
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.background = `url(${url}) no-repeat center / contain`;
  return el;
}

function createDotElement(color: string, size: number): HTMLElement {
  const el = document.createElement("div");
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.border = "2px solid #fff";
  el.style.boxSizing = "border-box";
  return el;
}

/* ------------------------------------------------------------------ *
 * 事件发射器(仿 mapEventController 的 Map<event, Set<listener>> 惯例)
 * ------------------------------------------------------------------ */

class Emitter {
  private readonly listeners = new Map<TrackEventName, Set<(payload: never) => void>>();
  /** 构造期告警待发队列,上限 1(契约 13:订阅对齐制补投,无 tick 兜底)。 */
  private pendingError: TrackEventMap["error"] | null = null;

  enqueueError(payload: TrackEventMap["error"]): void {
    if (!this.pendingError) this.pendingError = payload;
  }

  on<K extends TrackEventName>(
    event: K,
    listener: (payload: TrackEventMap[K]) => void,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as (payload: never) => void);
    if (event === "error" && this.pendingError) {
      const queued = this.pendingError;
      this.pendingError = null;
      (listener as (payload: TrackEventMap["error"]) => void)(queued);
    }
    return () => {
      this.listeners.get(event)?.delete(listener as (payload: never) => void);
    };
  }

  emit<K extends TrackEventName>(event: K, payload: TrackEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of [...set]) {
      (listener as (value: TrackEventMap[K]) => void)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
    this.pendingError = null;
  }
}

/* ------------------------------------------------------------------ *
 * 工具
 * ------------------------------------------------------------------ */

const DEFAULT_REFERENCE_SPEED = 38.9; // m/s ≈ 140 km/h,对齐老项目硬编码基准
const PROGRESS_INTERVAL_MS = 100; // progress 事件 ~10Hz
const TRAIL_INTERVAL_MS = 300; // trail 重绘 2–5Hz 或位移 >20m 双条件(先到为准)
const TRAIL_STEP_METERS = 20;
const EPS = 1e-9;

const constructionCounter = { value: 0 };

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function performanceNow(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function emptyLine(): FeatureCollection<LineString> {
  return { type: "FeatureCollection", features: [] };
}

function lineFeature(coords: readonly TrackCoordinate[]): Feature<LineString> {
  return {
    type: "Feature",
    properties: null,
    geometry: { type: "LineString", coordinates: coords.map((c) => [c[0], c[1]]) },
  };
}

/* ------------------------------------------------------------------ *
 * createTrackPlayer
 * ------------------------------------------------------------------ */

/**
 * 创建轨迹回放播放器。契约细则见 types.ts JSDoc;构造期校验:
 * - points ≥2 且坐标合法,否则 INVALID_ARGUMENT(normalizeTrack);
 * - mode "realtime" 要求 time 全有;无 time 数据显式走 "uniform";
 * - 未注入 clock → 自建(solo,时钟直驱语义见契约 2/3-补);
 * - 默认 marker 工厂要求 globalThis.minemap + document,缺失构造期抛 SDK_UNAVAILABLE(契约 4);
 *   注入 options.createMarker 时完全不触碰全局 SDK。
 */
export function createTrackPlayer(map: MapLike, options: TrackPlayerOptions): TrackPlayerHandle {
  if (!map || typeof map.getSource !== "function") invalidArgument("map (MapLike) is required");
  if (!options || typeof options !== "object") invalidArgument("options is required");
  if (options.speed !== undefined && (!Number.isFinite(options.speed) || options.speed <= 0)) {
    invalidArgument("options.speed must be a finite number > 0");
  }
  if (
    options.referenceSpeed !== undefined &&
    (!Number.isFinite(options.referenceSpeed) || options.referenceSpeed <= 0)
  ) {
    invalidArgument("options.referenceSpeed must be a finite number > 0");
  }

  const track: NormalizedTrack = normalizeTrack(options.points);

  let mode: TrackMode;
  if (options.mode === "realtime") {
    if (!track.hasTime) invalidArgument('options.mode "realtime" requires time on every point');
    mode = "realtime";
  } else if (options.mode === "uniform") {
    mode = "uniform";
  } else {
    mode = track.hasTime ? "realtime" : "uniform";
  }

  const referenceSpeed = options.referenceSpeed ?? DEFAULT_REFERENCE_SPEED;
  const bearingCompensation = options.bearingCompensation ?? 180;
  const ns = options.id ?? `auto${++constructionCounter.value}`;
  if (typeof ns !== "string" || ns.trim() === "")
    invalidArgument("options.id must be a non-empty string");
  const hasExplicitTimeRange = options.timeRange !== undefined;
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

  /* ---- 时钟与所有权(契约 9/14) ---- */
  const injectedClock = options.clock ?? null;
  if (injectedClock && typeof injectedClock.subscribe !== "function") {
    invalidArgument("options.clock must be a PlaybackClock");
  }
  const ownClock = injectedClock ? null : createPlaybackClock(options.speed ?? 1);
  const clock: PlaybackClock = injectedClock ?? (ownClock as PlaybackClock);
  const solo = ownClock !== null;

  /* ---- 成员投影轴 ---- */
  const lastSampleTime = track.timeRange ? track.timeRange[1] : 0;
  let axisOriginMs: number = hasExplicitTimeRange
    ? (options.timeRange as readonly [number, number])[0]
    : track.timeRange
      ? track.timeRange[0]
      : 0;
  const memberDurationMs = (): number => {
    if (mode === "realtime") {
      // 数据时间跨度 + (fleet rebase 后)等待区间;下限 1ms 防除零。
      return Math.max(1, lastSampleTime - axisOriginMs);
    }
    return Math.max(1, (track.totalMeters / referenceSpeed) * 1000);
  };

  /* ---- marker ---- */
  const overlays: RemovableOverlay[] = [];
  const startCoord = track.samples[0].coord;
  let vehicleMarker: TrackMarkerLike;
  if (options.createMarker) {
    const bearing =
      track.samples.length > 1 ? bearingDeg(startCoord, track.samples[1].coord) : Number.NaN;
    vehicleMarker = options.createMarker(
      startCoord,
      Number.isFinite(bearing) ? bearing : undefined,
    );
    if (
      !vehicleMarker ||
      typeof vehicleMarker.setLngLat !== "function" ||
      typeof vehicleMarker.remove !== "function"
    ) {
      invalidArgument("options.createMarker must return a TrackMarkerLike (setLngLat + remove)");
    }
  } else {
    const minemap = getGlobalMinemap();
    if (!minemap) {
      throw new MapToolsError(
        "SDK_UNAVAILABLE",
        "globalThis.minemap is required by the default marker factory; inject options.createMarker to decouple",
      );
    }
    if (typeof document === "undefined") {
      throw new MapToolsError(
        "DOM_UNAVAILABLE",
        "document is required by the default marker factory",
      );
    }
    if (!options.icon)
      invalidArgument("options.icon is required when options.createMarker is not injected");
    const bearing =
      track.samples.length > 1 ? bearingDeg(startCoord, track.samples[1].coord) : Number.NaN;
    const initialRotation = Number.isFinite(bearing) ? bearing - bearingCompensation : 0;
    const el = createIconElement(options.icon, 32);
    const marker = new minemap.Marker(el, {
      rotation: initialRotation,
      rotationAlignment: "map",
      offset: [-16, -16],
    });
    // 顺序硬约束:minemap Marker 的 addTo 会立即 _update(),未设坐标时读 lng 抛错——
    // 必须 setLngLat 先行、再 addTo(与老项目 useTrackPlayBack 的链式写法一致)。
    marker.setLngLat(startCoord as Coordinate);
    marker.addTo(map);
    vehicleMarker = marker;
    overlays.push(marker);

    if (options.startEndMarkers) {
      const end = track.samples[track.samples.length - 1].coord;
      const endpointDefs: [TrackCoordinate, string][] = [
        [startCoord, options.startIcon ?? options.icon],
        [end, options.endIcon ?? options.icon],
      ];
      for (const [coord, url] of endpointDefs) {
        const pointMarker = new minemap.Marker(createIconElement(url, 36), { offset: [-18, -18] });
        pointMarker.setLngLat(coord as Coordinate);
        pointMarker.addTo(map);
        overlays.push(pointMarker);
      }
    }
    for (const station of options.stations ?? []) {
      const dotMarker = new minemap.Marker(createDotElement("#1F6BFE", 12), { offset: [-6, -6] });
      dotMarker.setLngLat([station.lng, station.lat] as Coordinate);
      dotMarker.addTo(map);
      overlays.push(dotMarker);
    }
  }

  /* ---- trail 线图层 ---- */
  const trailStyle = options.trail;
  let trailSourceId = "";
  let trailLayerId = "";
  if (trailStyle) {
    trailSourceId = createSourceId("track", `${ns}-trail`);
    trailLayerId = createLayerId("track", `${ns}-trail`);
    upsertGeoJSONSource(map, { id: trailSourceId, data: emptyLine() });
    const layer: MapLayer = {
      id: trailLayerId,
      type: "line",
      source: trailSourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-width": trailStyle.width ?? 4, "line-color": trailStyle.color ?? "#1F6BFE" },
    };
    ensureLayer(map, layer);
  }

  /* ---- 状态机 ---- */
  const emitter = new Emitter();
  let status: TrackStatus = "stopped";
  let following = false;
  let localRate = solo ? 1 : (options.speed ?? 1); // injected:成员自身倍率,叠加在共享时钟倍率上
  let overrideAxisMs: number | null = null; // frozen 态 seek 的显示位置,恢复跟随即清除(契约 14-补)
  let lastRotation = 0;
  let lastProgress: TrackProgress | null = null;
  let lastProgressEmitAt = -Infinity;
  let lastTrailMeters = -Infinity;
  let lastTrailAt = -Infinity;
  let destroyed = false;
  let arriveFired = false;

  if (track.nonMonotonicCount > 0) {
    emitter.enqueueError({
      code: "NON_MONOTONIC_TIME",
      message: `${track.nonMonotonicCount} timestamp(s) were non-monotonic and clamped; geometry order preserved`,
    });
  }

  function scaledElapsed(elapsedMs: number): number {
    // solo:时钟倍率已乘进 elapsed,成员不再乘;injected:共享 elapsed × 成员 localRate。
    return solo ? elapsedMs : elapsedMs * localRate;
  }

  /** elapsed 轴 → 进度快照(契约 16 TrackProgress)。realtime 越界钉在端点 = 首尾停车等待语义。 */
  function projectAt(elapsedAxisMs: number): TrackProgress {
    const duration = memberDurationMs();
    const fraction = clamp01(elapsedAxisMs / duration);
    if (mode === "realtime") {
      const timeMs = axisOriginMs + elapsedAxisMs;
      const meters = timeToDistance(track.samples, Math.min(timeMs, lastSampleTime));
      const located = locateByDistance(track.samples, meters);
      return {
        fraction: track.totalMeters === 0 ? fraction : clamp01(meters / track.totalMeters),
        distanceMeters: meters,
        timeMs,
        coordinate: located.coordinate,
      };
    }
    const meters = Math.min((elapsedAxisMs / 1000) * referenceSpeed, track.totalMeters);
    const located = locateByDistance(track.samples, meters);
    return {
      fraction: clamp01(meters / track.totalMeters),
      distanceMeters: meters,
      timeMs: elapsedAxisMs,
      coordinate: located.coordinate,
    };
  }

  function renderAt(axisMs: number): { progress: TrackProgress; bearing: number } {
    const clamped = clamp01(axisMs / memberDurationMs()) * memberDurationMs();
    const progress = projectAt(clamped);
    const located = locateByDistance(track.samples, progress.distanceMeters);
    return { progress, bearing: located.bearing };
  }

  function draw(progress: TrackProgress, bearing: number): void {
    vehicleMarker.setLngLat(progress.coordinate as Coordinate);
    // bearing 可能 NaN(段重合):保留上一次朝向。Number.isFinite 判定,0(正北)是合法值。
    if (Number.isFinite(bearing)) lastRotation = bearing - bearingCompensation;
    vehicleMarker.setRotation?.(lastRotation);
  }

  function refreshTrail(progress: TrackProgress, now: number): void {
    if (!trailStyle) return;
    const movedEnough = Math.abs(progress.distanceMeters - lastTrailMeters) > TRAIL_STEP_METERS;
    const timeEnough = now - lastTrailAt >= TRAIL_INTERVAL_MS;
    if (!movedEnough && !timeEnough) return;
    lastTrailMeters = progress.distanceMeters;
    lastTrailAt = now;

    const coords: TrackCoordinate[] = [track.samples[0].coord];
    for (const sample of track.samples) {
      if (sample.cumMeters > progress.distanceMeters) break;
      coords.push(sample.coord);
    }
    const last = coords[coords.length - 1];
    if (last[0] !== progress.coordinate[0] || last[1] !== progress.coordinate[1]) {
      coords.push(progress.coordinate);
    }
    updateSourceData(map, trailSourceId, {
      type: "FeatureCollection",
      features: [lineFeature(coords)],
    });
  }

  function onTick(elapsedMs: number): void {
    if (destroyed || !following) return;
    const { progress, bearing } = renderAt(scaledElapsed(elapsedMs));
    draw(progress, bearing);
    refreshTrail(progress, performanceNow());

    const arrived = progress.distanceMeters >= track.totalMeters - EPS;
    if (arrived) {
      finishArrive();
      return;
    }
    lastProgress = progress;
    const now = performanceNow();
    if (now - lastProgressEmitAt >= PROGRESS_INTERVAL_MS) {
      lastProgressEmitAt = now;
      emitter.emit("progress", { ...progress });
    }
  }

  /** 契约 3/3-补:emit arrive(终态 TrackProgress) → 自身 paused;injected 不碰共享时钟,直驱仅 solo。 */
  function finishArrive(): void {
    const terminal = projectAt(memberDurationMs());
    terminal.fraction = 1;
    terminal.distanceMeters = track.totalMeters;
    terminal.coordinate = track.samples[track.samples.length - 1].coord;
    lastProgress = terminal;
    draw(terminal, Number.NaN);
    if (trailStyle) {
      lastTrailMeters = -Infinity; // 强制终态重绘一次
      refreshTrail(terminal, performanceNow());
    }
    emitter.emit("progress", { ...terminal });
    if (!arriveFired) {
      arriveFired = true;
      emitter.emit("arrive", { ...terminal });
    }
    following = false;
    status = "paused";
    emitter.emit("status", { status });
    if (solo) clock.pause();
  }

  function play(from?: number): void {
    if (destroyed) invalidArgument("cannot play a destroyed player");
    if (solo) {
      if (from !== undefined) {
        arriveFired = false;
        clock.seekMs(clamp01(from) * memberDurationMs());
      } else if (scaledElapsed(clock.getElapsedMs()) >= memberDurationMs() - EPS) {
        arriveFired = false; // 契约 2:终点再 play() 自动 seek 0 重播
        clock.seekMs(0);
      }
      following = true;
      overrideAxisMs = null;
      status = "playing";
      clock.play();
      emitter.emit("status", { status });
      return;
    }
    // 契约 14-补:injected 的 play(from?) 一律等价 play(),from 被忽略。
    following = true;
    overrideAxisMs = null;
    if (scaledElapsed(clock.getElapsedMs()) < memberDurationMs() - EPS) arriveFired = false;
    status = "playing";
    emitter.emit("status", { status });
  }

  function pause(): void {
    if (destroyed) return;
    following = false;
    status = "paused";
    if (solo) clock.pause(); // 契约 3-补:solo 直驱自建时钟
    emitter.emit("status", { status });
  }

  function stop(): void {
    if (destroyed) return;
    following = false;
    arriveFired = false;
    overrideAxisMs = null;
    status = "stopped";
    if (solo) clock.stop();
    const idle = renderAt(0);
    draw(idle.progress, idle.bearing);
    lastProgress = idle.progress;
    if (trailStyle) {
      lastTrailMeters = -Infinity;
      refreshTrail(idle.progress, performanceNow());
    }
    emitter.emit("status", { status });
  }

  /**
   * 跳转归一化位置(越界钳制 [0,1])。
   * solo 驱动自建时钟且持久;injected 仅移动**冻结态**显示位置,
   * 恢复跟随后下一 tick 被时钟投影覆盖——跟随态 seek 无持久效果(契约 14-补)。
   */
  function seekFraction(fraction: number): void {
    if (destroyed) invalidArgument("cannot seek a destroyed player");
    if (typeof fraction !== "number" || !Number.isFinite(fraction)) {
      invalidArgument("fraction must be a finite number");
    }
    applySeek(clamp01(fraction) * memberDurationMs());
  }

  /** clock 原始 elapsed 轴(ms,倍率投影前,契约 7);覆盖语义同 seekFraction。 */
  function seekTime(ms: number): void {
    if (destroyed) invalidArgument("cannot seek a destroyed player");
    if (!Number.isFinite(ms) || ms < 0) invalidArgument("ms must be a finite number >= 0");
    applySeek(ms);
  }

  function applySeek(axisMs: number): void {
    arriveFired = false;
    if (solo) {
      clock.seekMs(axisMs);
      const idle = renderAt(scaledElapsed(clock.getElapsedMs()));
      draw(idle.progress, idle.bearing);
      lastProgress = idle.progress;
      if (trailStyle) {
        lastTrailMeters = -Infinity;
        refreshTrail(idle.progress, performanceNow());
      }
      return;
    }
    overrideAxisMs = axisMs;
    if (!following) {
      const idle = renderAt(axisMs);
      draw(idle.progress, idle.bearing);
      lastProgress = idle.progress;
    }
    // following 中:不动时钟不重绘,下一 tick 自然覆盖(无持久效果)。
  }

  function setSpeed(rate: number): void {
    if (destroyed) return;
    if (!Number.isFinite(rate) || rate <= 0) invalidArgument("rate must be a finite number > 0");
    if (solo) clock.setRate(rate);
    else localRate = rate;
  }

  function getProgress(): TrackProgress {
    if (following) return renderAt(scaledElapsed(clock.getElapsedMs())).progress;
    if (overrideAxisMs !== null) return renderAt(overrideAxisMs).progress;
    // 非跟随(暂停/到达/stopped):返回最后一次渲染快照(injected 冻结 marker 的真实位置);
    // 从未渲染过时回退按时钟投影。
    if (lastProgress) return { ...lastProgress };
    return renderAt(scaledElapsed(clock.getElapsedMs())).progress;
  }

  const unsubscribeTick = clock.subscribe(onTick);

  // 初始落位起点。
  {
    const idle = renderAt(0);
    draw(idle.progress, idle.bearing);
    lastProgress = idle.progress;
  }

  const handle: TrackPlayerHandle = {
    play,
    pause,
    stop,
    seekFraction,
    seekTime,
    setSpeed,
    getStatus: () => status,
    getProgress,
    // 闭包转发:直接挂 emitter.on 会丢 this 绑定
    on: ((event, listener) => emitter.on(event, listener)) as TrackPlayerHandle["on"],
    clock,
    get mode() {
      return mode;
    },
    get durationMs() {
      return memberDurationMs();
    },
    get totalMeters() {
      return track.totalMeters;
    },
    hasExplicitTimeRange,
    get dataTimeRange() {
      return track.timeRange;
    },
    destroy() {
      if (destroyed) return; // 契约 12:幂等
      destroyed = true;
      unsubscribeTick();
      if (overlays.length) removeOverlays(overlays);
      try {
        vehicleMarker.remove();
      } catch {
        /* 宿主可能已移除该节点 */
      }
      if (trailStyle) {
        removeResources(map, { layerIds: [trailLayerId], sourceIds: [trailSourceId] });
      }
      if (ownClock) ownClock.destroy(); // 契约 9:自建连删、注入只退订(上方 unsubscribeTick)
      emitter.clear();
    },
  };

  internalsRegistry.set(handle, {
    rebase(axisOrigin: number) {
      if (mode !== "realtime") return;
      if (hasExplicitTimeRange) return; // solo 显式锁轴不受 fleet rebase
      axisOriginMs = axisOrigin;
    },
  });

  return handle;
}
