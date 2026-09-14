/**
 * 轨迹回放示例的静态轨迹数据（三条重庆主城公交风格轨迹，不等长、时间轴并集不齐）。
 * 确定性生成（内置 LCG 伪随机），避免示例依赖外网接口；
 * time 为 epoch 毫秒（契约 5：number 一律毫秒）。
 */

export interface DemoTrackPoint {
  lng: number;
  lat: number;
  time: number;
}

/** mulberry32——小而确定性的 PRNG,保证每次刷新轨迹一致。 */
function lcg(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** 在控制点折线上按固定步长重采样,并叠加小幅抖动模拟 GPS 噪声。 */
function resample(
  control: readonly (readonly [number, number])[],
  step: number,
  seed: number,
  jitter: number,
): { lng: number; lat: number }[] {
  const rand = lcg(seed);
  const out: { lng: number; lat: number }[] = [];
  for (let i = 0; i < control.length - 1; i++) {
    const [x0, y0] = control[i];
    const [x1, y1] = control[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const n = Math.max(1, Math.round(dist / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push({
        lng: x0 + dx * t + (rand() - 0.5) * jitter,
        lat: y0 + dy * t + (rand() - 0.5) * jitter,
      });
    }
  }
  const last = control[control.length - 1];
  out.push({ lng: last[0], lat: last[1] });
  return out;
}

/** 逐点赋时:基础间隔 + 中途若干「长停站」(大间隔制造停车等待段)。 */
function stampTimes(
  points: { lng: number; lat: number }[],
  startMs: number,
  baseInterval: number,
  holdIndices: readonly number[],
  holdMs: number,
): DemoTrackPoint[] {
  let t = startMs;
  return points.map((p, i) => {
    if (i > 0) t += baseInterval * (0.75 + ((i * 2_654_435_761) % 100) / 200);
    if (holdIndices.includes(i)) t += holdMs;
    return { lng: p.lng, lat: p.lat, time: Math.round(t) };
  });
}

// 三条轨迹围绕解放碑（106.55, 29.56）放射,长度刻意不等。
const CONTROL_A: (readonly [number, number])[] = [
  [106.534, 29.552],
  [106.541, 29.556],
  [106.548, 29.558],
  [106.554, 29.561],
  [106.56, 29.566],
  [106.566, 29.57],
  [106.573, 29.574],
  [106.58, 29.579],
  [106.587, 29.585],
];
const CONTROL_B: (readonly [number, number])[] = [
  [106.55, 29.543],
  [106.552, 29.549],
  [106.551, 29.555],
  [106.553, 29.56],
  [106.557, 29.564],
  [106.561, 29.568],
  [106.567, 29.571],
];
const CONTROL_C: (readonly [number, number])[] = [
  [106.565, 29.55],
  [106.559, 29.553],
  [106.552, 29.555],
  [106.545, 29.557],
  [106.538, 29.559],
  [106.531, 29.562],
  [106.525, 29.566],
  [106.519, 29.571],
  [106.514, 29.577],
  [106.51, 29.583],
];

const BASE_MS = Date.UTC(2026, 8, 14, 0, 30, 0); // 当日 08:30（本地）起

/** 线路 A：最长,中途一次长停站。 */
export const TRACK_A: DemoTrackPoint[] = (() => {
  const pts = resample(CONTROL_A, 0.0012, 42, 0.00022);
  return stampTimes(pts, BASE_MS, 6000, [Math.floor(pts.length * 0.45)], 90_000);
})();

/** 线路 B：最短,起播时刻更晚(制造「首段停车等待」),两次停站。 */
export const TRACK_B: DemoTrackPoint[] = (() => {
  const pts = resample(CONTROL_B, 0.0011, 7, 0.00018);
  return stampTimes(
    pts,
    BASE_MS + 45_000,
    5500,
    [Math.floor(pts.length * 0.3), Math.floor(pts.length * 0.7)],
    60_000,
  );
})();

/** 线路 C：中等长度,与 A 时间轴重叠但更晚结束。 */
export const TRACK_C: DemoTrackPoint[] = (() => {
  const pts = resample(CONTROL_C, 0.0013, 99, 0.00025);
  return stampTimes(pts, BASE_MS + 20_000, 6500, [Math.floor(pts.length * 0.55)], 75_000);
})();

/** 车辆图标:真实公交俯视素材(18×49,车头朝上,bearingCompensation 用 0),站点根路径资源。 */
export const BUS_ICON = "/bus-icon.png";

/** 多车场景区分车辆:蓝/绿两型与橙色真实素材同风格(俯视、车头朝上、青挡风+黄车灯)。 */
export const BUS_ICON_BLUE = "/bus-icon-blue.png";

const busSvg = (body: string, roof: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="49" viewBox="0 0 18 49"><rect x="1" y="1" width="16" height="47" rx="4" fill="${body}"/><rect x="3" y="7" width="12" height="7" rx="2" fill="#7fd8e8"/><rect x="3" y="20" width="12" height="9" rx="2" fill="${roof}"/><rect x="3" y="33" width="12" height="9" rx="2" fill="${roof}"/><path d="M6 1 L9 5 L12 1 Z" fill="#ffd34d"/></svg>`,
  )}`;

export const BUS_ICON_GREEN = busSvg("#0E9F6E", "#9fe8c8");

export const START_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="10" fill="#0E9F6E" stroke="#fff" stroke-width="3"/><path d="M15 12 L25 18 L15 24 Z" fill="#fff"/></svg>`,
)}`;

export const END_ICON = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="10" fill="#BA3A36" stroke="#fff" stroke-width="3"/><rect x="13.5" y="13.5" width="9" height="9" fill="#fff"/></svg>`,
)}`;
