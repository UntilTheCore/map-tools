import { invalidArgument } from "../errors";
import type { TrackCoordinate } from "./geodesy";
import { haversineMeters } from "./geodesy";
import type { TrackPoint } from "./types";

/** 归一化后的单个采样:坐标 + 单调钳制后的时刻(uniform 无) + 前缀里程(米)。 */
export interface TrackSample {
  coord: TrackCoordinate;
  timeMs: number | undefined;
  cumMeters: number;
}

export interface NormalizedTrack {
  samples: TrackSample[];
  /** 原始数据中 time 是否全有(normalize 已保证全有或全无)。 */
  hasTime: boolean;
  totalMeters: number;
  /** 钳制后时间轴范围 [首, 尾] epoch ms;无时间为 undefined。 */
  timeRange: readonly [number, number] | undefined;
  /** 时间戳非单调(倒退/重复)被钳制的次数,>0 时 player 侧发 NON_MONOTONIC_TIME 告警(契约 5/13)。 */
  nonMonotonicCount: number;
}

/**
 * 时间戳解析(契约 5):number 一律按 epoch 毫秒;string 走 Date.parse,NaN → INVALID_ARGUMENT。
 */
function parseTime(value: number | string, index: number): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      invalidArgument(`points[${index}].time must be a finite epoch-millisecond number`);
    }
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      invalidArgument(`points[${index}].time cannot be parsed as a date: "${value}"`);
    }
    return parsed;
  }
  invalidArgument(`points[${index}].time must be number (epoch ms) or string`);
}

/**
 * 轨迹归一化(契约 5):
 * - 坐标校验(lng ∈ [-180,180]、lat ∈ [-90,90]、有限数),非法 → INVALID_ARGUMENT(含下标);
 * - time 全有或全无,部分缺失 → INVALID_ARGUMENT;
 * - 几何**不重排序**;时间序列钳制为单调不减(倒退/重复取前一值),钳制次数计入 nonMonotonicCount;
 * - 连续重合点(经纬度完全相等)合并,保留更早时刻;
 * - 生成前缀里程数组(动画定位与 uniform 轴长的唯一数据源)。
 */
export function normalizeTrack(points: readonly TrackPoint[]): NormalizedTrack {
  if (!Array.isArray(points)) invalidArgument("points must be an array of TrackPoint");
  if (points.length < 2) invalidArgument("points must contain at least 2 samples");

  let timeCount = 0;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point || typeof point !== "object") {
      invalidArgument(`points[${i}] must be an object with lng/lat`);
    }
    const { lng, lat } = point;
    if (
      typeof lng !== "number" ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180 ||
      typeof lat !== "number" ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      invalidArgument(`points[${i}] has invalid lng/lat coordinate`);
    }
    if (point.time !== undefined && point.time !== null) timeCount += 1;
  }
  if (timeCount !== 0 && timeCount !== points.length) {
    invalidArgument(
      'points[].time must be present on every sample or on none (partial timestamps are invalid; use mode: "uniform" for data without time)',
    );
  }
  const hasTime = timeCount === points.length;

  const samples: TrackSample[] = [];
  let cumMeters = 0;
  let nonMonotonicCount = 0;
  let prevTime: number | undefined;
  let prevCoord: TrackCoordinate | undefined;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const coord: TrackCoordinate = [point.lng, point.lat];

    let timeMs: number | undefined;
    if (hasTime) {
      const raw = parseTime(point.time as number | string, i);
      if (prevTime === undefined || raw < prevTime) {
        if (prevTime !== undefined) nonMonotonicCount += 1;
        timeMs = prevTime ?? raw;
      } else {
        timeMs = raw;
      }
      prevTime = timeMs;
    }

    if (prevCoord && prevCoord[0] === coord[0] && prevCoord[1] === coord[1]) {
      // 连续重合点合并:几何上不新增采样,时刻保留更早值(timeMs 已是钳制值,不更新 prevTime)。
      continue;
    }

    if (prevCoord) cumMeters += haversineMeters(prevCoord, coord);
    samples.push({ coord, timeMs, cumMeters });
    prevCoord = coord;
  }

  if (samples.length < 2) {
    invalidArgument("points must contain at least 2 distinct coordinates after de-duplication");
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  const timeRange: readonly [number, number] | undefined =
    hasTime && first.timeMs !== undefined && last.timeMs !== undefined
      ? [first.timeMs, last.timeMs]
      : undefined;

  return { samples, hasTime, totalMeters: cumMeters, timeRange, nonMonotonicCount };
}
