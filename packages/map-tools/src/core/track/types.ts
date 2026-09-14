import type { Coordinate } from "../../types/geometry";
import type { MapToolsErrorCode } from "../errors";
import type { PlaybackClock } from "./clock";
import type { TrackCoordinate } from "./geodesy";

/**
 * 单个轨迹采样点。
 * `time` 全轨迹必须「全有或全无」(部分缺失 → 构造期 INVALID_ARGUMENT);
 * 无时间数据请显式使用 mode: "uniform"。
 */
export interface TrackPoint {
  lng: number;
  lat: number;
  /**
   * 采样时刻。number 一律按 **epoch 毫秒** 解释(秒级数据由调用方先行换算);
   * string 走 Date.parse(ISO 与常见可解析格式),解析失败 → INVALID_ARGUMENT。
   */
  time?: number | string;
}

export type TrackMode = "realtime" | "uniform";

export type TrackStatus = "stopped" | "playing" | "paused";

/** 回放进度完整快照(契约 16:player progress/arrive 事件的 payload 即此形状)。 */
export interface TrackProgress {
  /** 归一化位置 0–1(成员相对各自轨迹;fleet progress 的 fraction 相对全局轴,双轨语义见 createTrackFleet)。 */
  fraction: number;
  /** 已走过里程(米)。 */
  distanceMeters: number;
  /**
   * uniform 模式 = clock elapsed(ms,**非** GPS 墙钟,下游不得按墙钟消费);
   * realtime 模式 = 全局时间轴时刻(epoch ms)。
   */
  timeMs: number | undefined;
  /** 当前插值坐标。 */
  coordinate: TrackCoordinate;
}

/** 注入式 Marker 工厂:返回带 setLngLat/setRotation 的对象即可(SDK 解耦,不依赖 minemap 类型)。 */
export interface TrackMarkerLike {
  setLngLat(lngLat: Coordinate): unknown;
  setRotation?(rotation: number): unknown;
  remove(): void;
}

export interface TrackTrailStyle {
  /** 已走过轨迹线颜色,默认 "#1F6BFE"。 */
  color?: string;
  /** 线宽(px),默认 4。 */
  width?: number;
}

export interface TrackStation {
  name: string;
  lng: number;
  lat: number;
}

export interface TrackPlayerOptions {
  /** 轨迹采样点,≥2 个有效点,否则构造期 INVALID_ARGUMENT。 */
  points: readonly TrackPoint[];
  /** 车辆图标 URL(默认 marker 工厂使用)。 */
  icon?: string;
  /** 完全自定义车辆 marker 工厂;注入后构造期不再触碰 globalThis.minemap(契约 4)。 */
  createMarker?: (initial: TrackCoordinate, initialRotation: number | undefined) => TrackMarkerLike;
  /**
   * 图标朝向补偿度:rotation = bearing - compensation。默认 180(图标默认朝下);
   * 图标朝上素材用 0,按素材一次性配好,不要在业务侧再翻转。
   */
  bearingCompensation?: number;
  /** 回放模式,默认 "realtime"(数据带 time 时);无 time 强制 "uniform"。 */
  mode?: TrackMode;
  /**
   * 倍率(契约 1):realtime 下 1 = 真实时间;uniform 下乘在基准地速 referenceSpeed 上。
   * 倍率不改变时间轴总长。默认 1。
   */
  speed?: number;
  /** uniform 模式基准地速(m/s),默认 38.9(≈140 km/h)。倍率不改变由它导出的轴总里程。 */
  referenceSpeed?: number;
  /**
   * 注入共享时钟(fleet 场景)。注入后本 player 不再自建/驱动时钟——
   * play/pause/stop/seek 仅作用于自身投影状态(契约 14/3-补);
   * play(from) 的 from 与「终点自动重播」仅 solo(未注入)生效(契约 14-补)。
   */
  clock?: PlaybackClock;
  /**
   * solo 播放的时间轴锁定(realtime 下 [起, 止] epoch ms)。
   * 显式设置过 timeRange 的 player 不允许 add 进 fleet(契约 6:fleet.add 抛 INVALID_ARGUMENT)。
   */
  timeRange?: readonly [number, number];
  /** 已走过轨迹渐显线;false/缺省不绘制。 */
  trail?: false | TrackTrailStyle;
  /** 绘制起终点 marker(默认 false,由业务侧自理)。 */
  startEndMarkers?: boolean;
  /** 站点 marker 列表(默认不绘制)。 */
  stations?: readonly TrackStation[];
  /** 资源 id 命名空间;多实例并存时必须区分,默认自动生成唯一后缀。 */
  id?: string;
  /** 起终点图标 URL(startEndMarkers 为 true 时使用)。 */
  startIcon?: string;
  endIcon?: string;
}

/**
 * player 事件 payload(契约 16,钉死):
 * - progress → TrackProgress 完整快照;
 * - arrive   → TrackProgress 终态快照(fraction 恒 1,coordinate 为终点坐标);
 * - status   → { status };
 * - error    → { code, message }。NON_MONOTONIC_TIME 为数据质量告警专用字面量,
 *   **不**加入 MapToolsErrorCode 联合、不可被 MapToolsError 抛出,仅经 error 事件投递
 *   (构造期产生时进入待发队列,首个 on("error") 订阅时补投,契约 13)。
 */
export interface TrackEventMap {
  progress: TrackProgress;
  arrive: TrackProgress;
  status: { status: TrackStatus };
  error: { code: MapToolsErrorCode | "NON_MONOTONIC_TIME"; message: string };
}

export type TrackEventName = keyof TrackEventMap;

/**
 * 轨迹回放播放器(契约总览见类型所在各方法 JSDoc):
 * - solo(未注入 clock):自建时钟,play/pause/stop/seek 直接驱动时钟;
 *   arrive 自动 paused 的同时 clock.pause()(契约 3-补,RAF 即停无空转)。
 * - injected(clock 注入):时钟唯一驱动者是所有者(fleet);本 player 全部控制
 *   仅切换自身「是否跟随时钟投影」状态,绝不操作共享时钟(契约 14)。
 */
export interface TrackPlayerHandle {
  /**
   * 起播/恢复。`from` 为 fraction(0–1),**仅 solo 生效**(契约 2/14-补):
   * solo 下省略 = 从当前位置继续(stopped 则从 0),fraction≥1 再调用自动 seek 0 重播;
   * injected 下一律等价 play(),from 被忽略,位置完全由时钟投影决定。
   */
  play(from?: number): void;
  /** 暂停:跟随态冻结;injected 下不触碰共享时钟。 */
  pause(): void;
  /** 停止:游标回起点、marker 复位;injected 下不触碰共享时钟。 */
  stop(): void;
  /**
   * 跳转到归一化位置(越界钳制到 [0,1])。
   * solo 驱动自建时钟;injected 仅移动**冻结态**显示位置,恢复跟随后下一 tick 被时钟位置覆盖
   * (「跟随态 seek 无持久效果;需个体偏移先 pause 再 seek」,契约 14-补)。
   */
  seekFraction(fraction: number): void;
  /**
   * 跳转到 clock 原始 elapsed 轴(ms,倍率投影前,契约 7)。
   * realtime 下位置稳定(锚定固定 GPS 时刻);uniform 下随当前倍率漂移——
   * 需要位置稳定的 seek 请用 seekFraction。injected 下的覆盖语义同 seekFraction。
   */
  seekTime(ms: number): void;
  /** 设置倍率(契约 1);倍率不改变时间轴总长。 */
  setSpeed(rate: number): void;
  getStatus(): TrackStatus;
  getProgress(): TrackProgress;
  /** 订阅事件,返回取消函数。构造期告警在首个 on("error") 时补投(契约 13)。 */
  on<K extends TrackEventName>(event: K, listener: (payload: TrackEventMap[K]) => void): () => void;
  /** 内部时钟(供 fleet.add 校验与高级场景订阅;所有权规则见契约 9)。 */
  readonly clock: PlaybackClock;
  /** 本 player 使用的模式(契约 6:fleet 要求成员一致)。 */
  readonly mode: TrackMode;
  /** 本 player 的轴总时长(ms):realtime = 时间跨度,uniform = 总里程/referenceSpeed(契约 6)。 */
  readonly durationMs: number;
  /** 轨迹总里程(米)。 */
  readonly totalMeters: number;
  /** 是否显式设置过 options.timeRange(fleet.add 仲裁依据,契约 6)。 */
  readonly hasExplicitTimeRange: boolean;
  /** 当前 GPS 数据时间轴范围 [起, 止] epoch ms(uniform 为 undefined)。 */
  readonly dataTimeRange: readonly [number, number] | undefined;
  /** 移除全部 marker/source/layer 并释放时钟(自建连删/注入只退订,契约 9);幂等(契约 12)。 */
  destroy(): void;
}

/** fleet 事件 payload(契约 15-补 2):progress/arrive 均为全局轴归一化 { fraction }。 */
export interface FleetEventMap {
  /** 全局时间轴归一化进度(与成员各自 fraction 双轨,数值不同是设计使然,契约 11)。 */
  progress: { fraction: number };
  /** 「全局时间轴走完」,仅条件 A(elapsed ≥ 轴总长)触发,fraction 恒为 1;条件 B 无事件(契约 15)。 */
  arrive: { fraction: number };
}

export type FleetEventName = keyof FleetEventMap;

export interface TrackFleetOptions {
  /** 注入外部时钟;缺省 fleet 自建并在 destroy 时连带销毁(契约 9)。 */
  clock?: PlaybackClock;
  /**
   * 锁定全局时间轴 [起, 止] epoch ms。
   * realtime 缺省 = 成员时间戳并集且 add/remove 后重算;显式传入则固定不重算。
   * uniform 下轴长 = 最长成员总里程 / referenceSpeed 且首个 add 定格快照(契约 6)。
   */
  timeRange?: readonly [number, number];
  /** 倍率(契约 1),驱动共享时钟。默认 1。 */
  speed?: number;
}

/**
 * 多车同步回放编排器——纯编排,不含 marker/地图调用。
 *
 * 构造与起播顺序(契约 10 + 示例约定):
 * ```ts
 * const fleet = createTrackFleet();
 * const p1 = createTrackPlayer(map, { points, clock: fleet.clock });
 * // ...
 * p1.play(); p2.play(); // 成员先进入 following
 * fleet.play();         // fleet 驱动时钟
 * ```
 * 时钟自动停(条件 A/B)后恢复播放的唯一途径是 fleet.play()(成员级 play() 不动共享时钟);
 * ended 后 fleet.seekFraction/seekTime 清终态,再 play() 从回看点继续(契约 15-补 1)。
 * 成员销毁顺序:必须先 fleet.remove(player) 再 player.destroy()(契约 15-补 4)。
 */
export interface TrackFleetHandle {
  /** 共享时钟,构造后即可用(成员创建时注入)。 */
  readonly clock: PlaybackClock;
  /**
   * 加入成员。校验:mode 一致、未显式带自身 timeRange、clock === fleet.clock,
   * 否则 INVALID_ARGUMENT(契约 6/10)。
   */
  add(player: TrackPlayerHandle): void;
  remove(player: TrackPlayerHandle): void;
  /** 三态分派:ended → seek 0 + 全量重播(解除全部冻结);autoFrozen/其余 → 仅起时钟(契约 15)。 */
  play(): void;
  pause(): void;
  /** 每成员 stop()(各回起点)+ clock.stop(),三标志复位(契约 15)。 */
  stop(): void;
  /** 全局轴归一化跳转(越界钳制 [0,1]);执行后清 ended/autoFrozen 终态(契约 15-补 1)。 */
  seekFraction(fraction: number): void;
  /** clock 原始 elapsed 轴跳转(ms);清终态规则同上。 */
  seekTime(ms: number): void;
  /** 统一设置倍率并传播到共享时钟(契约 1)。 */
  setSpeed(rate: number): void;
  on<K extends FleetEventName>(event: K, listener: (payload: FleetEventMap[K]) => void): () => void;
  /** 幂等(契约 12);退订全部成员订阅;自建时钟连删、注入只退订(契约 9);不代 destroy 成员。 */
  destroy(): void;
}
