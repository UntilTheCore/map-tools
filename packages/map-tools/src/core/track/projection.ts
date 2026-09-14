import { bearingDeg, lerpCoordinate, type TrackCoordinate } from "./geodesy";
import type { TrackSample } from "./normalize";

export interface TrackLocation {
  coordinate: TrackCoordinate;
  /**
   * 当前位置 → 前方参考点的正向方位角(deg)。
   * 重合/无法计算时为 NaN,调用方必须以 Number.isFinite 判定(0 是合法的「正北」)。
   */
  bearing: number;
}

/**
 * 在 [lo, hi] 升序数组中二分查找最后一个满足 `value >= arr[i]` 的下标(段起点)。
 * 返回下限 0、上限 arr.length - 2(保证 [i, i+1] 段存在)。
 */
function findSegmentIndex(values: readonly number[], value: number): number {
  let lo = 0;
  let hi = values.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (values[mid] <= value) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * 按里程定位(动画每帧的核心纯计算):二分前缀里程数组 + 段内线性插值。
 * - targetMeters 越界钳制到 [0, totalMeters];
 * - bearing 取「插值位置 → 所在段终点」的前向方位角,末点回退用前一段方位角,
 *   保证车头指向始终为行进方向。
 */
export function locateByDistance(
  samples: readonly TrackSample[],
  targetMeters: number,
): TrackLocation {
  const total = samples[samples.length - 1].cumMeters;
  const meters = clamp01(total === 0 ? 0 : targetMeters / total) * total;

  if (meters >= total) {
    const last = samples[samples.length - 1];
    const prev = samples[samples.length - 2];
    return { coordinate: last.coord, bearing: bearingDeg(prev.coord, last.coord) };
  }

  let lo = 0;
  let hi = samples.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (samples[mid].cumMeters <= meters) lo = mid;
    else hi = mid - 1;
  }

  const a = samples[lo];
  const b = samples[lo + 1];
  const span = b.cumMeters - a.cumMeters;
  const t = span === 0 ? 0 : (meters - a.cumMeters) / span;
  return {
    coordinate: lerpCoordinate(a.coord, b.coord, t),
    bearing: bearingDeg(a.coord, b.coord),
  };
}

/**
 * 时间 → 里程的投影(realtime 模式,段间线性插值):
 * - 无 GPS 数据的区间(采样点间时间远大于空间推进)天然表现为「停车等待」——
 *   里程按时间线性内插,时间停在长间隔起点时里程同步停住;
 * - timeMs 越界钳制到首/尾采样时刻。
 */
export function timeToDistance(samples: readonly TrackSample[], timeMs: number): number {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (first.timeMs === undefined || last.timeMs === undefined) return 0;
  if (timeMs <= first.timeMs) return 0;
  if (timeMs >= last.timeMs) return last.cumMeters;

  const times: number[] = samples.map((sample) => sample.timeMs as number);
  const index = findSegmentIndex(times, timeMs);
  const a = samples[index];
  const b = samples[index + 1];
  const span = (b.timeMs as number) - (a.timeMs as number);
  const t = span === 0 ? 0 : (timeMs - (a.timeMs as number)) / span;
  return a.cumMeters + (b.cumMeters - a.cumMeters) * t;
}

/** 里程 → 时间(realtime 反向投影,用于 progress.timeMs 的轴时刻计算)。 */
export function distanceToTime(
  samples: readonly TrackSample[],
  meters: number,
): number | undefined {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (first.timeMs === undefined || last.timeMs === undefined) return undefined;
  const total = last.cumMeters;
  if (total === 0) return first.timeMs;
  const clamped = clamp01(meters / total) * total;

  const cum: number[] = samples.map((sample) => sample.cumMeters);
  const index = findSegmentIndex(cum, clamped);
  const a = samples[index];
  const b = samples[index + 1];
  const span = b.cumMeters - a.cumMeters;
  const t = span === 0 ? 0 : (clamped - a.cumMeters) / span;
  return (a.timeMs as number) + ((b.timeMs as number) - (a.timeMs as number)) * t;
}
