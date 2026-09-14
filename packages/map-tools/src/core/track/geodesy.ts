/**
 * 轨迹回放专用测地/几何原语:turf-free 的纯函数集合。
 * track 模块刻意不引入 @turf/turf——runner vendor 的 maptools-vue3 chunk 图禁止
 * 内联 turf;此处只需 haversine / 正向方位角 / 线性插值,四则运算即可覆盖。
 */

/** 坐标元组 [经度, 纬度](与 types/geometry 的 Coordinate 形状一致)。 */
export type TrackCoordinate = readonly [longitude: number, latitude: number];

const EARTH_RADIUS_METERS = 6_371_008.8;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function toRadians(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

/** 两点间大圆距离(米,haversine)。 */
export function haversineMeters(from: TrackCoordinate, to: TrackCoordinate): number {
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);
  const dLat = lat2 - lat1;
  const dLng = toRadians(to[0] - from[0]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * 正向方位角,度,[0, 360) 区间。正北为 0、顺时针递增。
 * 两点重合时返回 NaN,调用方须用 Number.isFinite 过滤(勿用真值判断,0 是合法的「正北」)。
 */
export function bearingDeg(from: TrackCoordinate, to: TrackCoordinate): number {
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);
  const dLng = toRadians(to[0] - from[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  if (y === 0 && x === 0) return Number.NaN;
  return (Math.atan2(y, x) * RAD_TO_DEG + 360) % 360;
}

/** 两坐标按比例线性插值(小范围内经纬度线性近似足够精确)。 */
export function lerpCoordinate(
  from: TrackCoordinate,
  to: TrackCoordinate,
  t: number,
): TrackCoordinate {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}
