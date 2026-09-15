# Track

轨迹回放 API（v3.2.0 新增）。入口：主入口 `@ym/map-tools`、子路径 `@ym/map-tools/track`、UMD 全局 `FE_utils`。概念与场景化说明见[案例参考 · 轨迹回放](/cases/track-playback)。

## createTrackPlayer

```ts
function createTrackPlayer(map: MapLike, options: TrackPlayerOptions): TrackPlayerHandle;
```

- `map`：`MapLike`（duck-typed，与库内其他 API 同一约定）。
- `options.points`：`TrackPoint[]`（`{ lng, lat, time? }`），≥2 个有效点、坐标合法，否则构造期 `INVALID_ARGUMENT`。
- `options.time`：number 一律按 **epoch 毫秒** 解释（秒级数据调用方换算）；string 走 `Date.parse`，解析失败 `INVALID_ARGUMENT`（含下标）。全轨迹「全有或全无」。
- 构造期校验失败直接抛 `MapToolsError`；数据质量问题（时间戳非单调被钳制）不抛错，走 `error` 事件（`NON_MONOTONIC_TIME`），首个 `on("error")` 订阅时补投。
- `options.clock`：注入 `PlaybackClock`（fleet 场景）。未注入 = solo（自建时钟）。
- `options.mode`：`"realtime" | "uniform"`，缺省按数据是否带 time 自动选。
- `options.speed`：倍率（>0，默认 1）。realtime 下 1 = 真实时间；uniform 下乘 `referenceSpeed`。**倍率不改变时间轴总长**。
- `options.bearingCompensation`：朝向补偿，`rotation = bearing - compensation`，默认 180（朝下图标）；朝上图标素材用 0。
- `options.createMarker(initial, initialRotation)`：注入车辆 marker 工厂（返回 `TrackMarkerLike`：`setLngLat/setRotation?/remove`），注入后构造期不触碰 `globalThis.minemap`。
- `SDK_UNAVAILABLE`：仅「默认工厂 + `globalThis.minemap` 缺失」时构造期抛。
- 其余：`icon`、`trail`、`startEndMarkers/startIcon/endIcon`、`stations`、`id`（资源命名空间）、`referenceSpeed`（默认 38.9 m/s）、`timeRange`（solo 锁轴；**显式设置过则不可加入 fleet**）。

### TrackPlayerHandle

```ts
interface TrackPlayerHandle {
  play(from?: number): void;
  pause(): void;
  stop(): void;
  seekFraction(fraction: number): void;
  seekTime(ms: number): void;
  setSpeed(rate: number): void;
  getStatus(): TrackStatus; // "stopped" | "playing" | "paused"
  getProgress(): TrackProgress;
  on<K extends keyof TrackEventMap>(
    event: K,
    listener: (payload: TrackEventMap[K]) => void,
  ): () => void;
  readonly clock: PlaybackClock;
  readonly mode: TrackMode;
  readonly durationMs: number;
  readonly totalMeters: number;
  readonly hasExplicitTimeRange: boolean;
  readonly dataTimeRange: readonly [number, number] | undefined;
  destroy(): void;
}
```

- `play(from?)`：`from` 为 fraction（0–1），**仅 solo 生效**；injected 下一律等价 `play()`（成员位置由共享时钟投影决定）。solo 终点再 `play()` 自动从头重播；`stopped` 时省略 `from` 从 0 起播。
- `seekFraction(f)`：越界钳制 [0,1]。solo 持久生效；injected 下仅移动**冻结态**显示位置，恢复跟随后下一 tick 被时钟位置覆盖（「跟随态 seek 无持久效果；需个体偏移先 pause 再 seek」）。
- `seekTime(ms)`：`ms` 为 clock 原始 elapsed 轴（倍率投影前）。realtime 位置稳定；uniform 随倍率漂移——需要位置稳定用 `seekFraction`。
- 到达终点：emit `arrive` → 自身 `paused`；solo 同时 `clock.pause()`（RAF 即停）；injected 不操作共享时钟。
- `destroy()`：幂等。回收全部 marker / trail 图层与 source；自建时钟连带销毁，注入时钟仅退订。
- fleet 中成员销毁顺序：**先 `fleet.remove(player)` 再 `player.destroy()`**（fleet 不感知外部销毁）。

### TrackEventMap（payload 形状钉死）

| 事件       | payload                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `progress` | `TrackProgress`（`{ fraction, distanceMeters, timeMs, coordinate }`），节流 ~10Hz                                                                                    |
| `arrive`   | `TrackProgress` 终态快照（`fraction` 恒 1、`coordinate` 为终点）                                                                                                     |
| `status`   | `{ status: TrackStatus }`                                                                                                                                            |
| `error`    | `{ code: MapToolsErrorCode \| "NON_MONOTONIC_TIME"; message: string }`（`NON_MONOTONIC_TIME` 为数据质量告警专用字面量，不入 `MapToolsErrorCode` 联合、不经异常抛出） |

`TrackProgress.timeMs`：realtime = 全局轴时刻（epoch ms）；uniform = elapsed ms（**非**墙钟，勿按当前时间消费）。`fraction` 为成员相对各自轨迹的归一化。

## createPlaybackClock

```ts
function createPlaybackClock(initialRate?: number): PlaybackClock;

interface PlaybackClock {
  subscribe(listener: (elapsedMs: number) => void): () => void;
  play(): void;
  pause(): void;
  stop(): void; // elapsed 归零
  seekMs(ms: number): void; // 原始 elapsed 轴（倍率投影前）
  setRate(rate: number): void; // 只缩放后续 tick 增量
  getRate(): number;
  getElapsedMs(): number;
  getStatus(): TrackStatus;
  destroy(): void; // 幂等
}
```

- 单 RAF、单调累计 elapsed，动画与帧率解耦的唯一时间源。
- **tick 分发原子性**：每 tick 对本轮订阅者**快照**逐一回调；回调内 `pause()/stop()` 只置状态、不中断本轮剩余回调（下一 tick 起停发）——保证 fleet 停钟的同一 tick 内全员按最终 elapsed 完成投影。
- `subscribe` 返回退订函数；`destroy` 后 `subscribe/play/seek` 抛 `INVALID_ARGUMENT`。

## createTrackFleet

```ts
function createTrackFleet(options?: {
  clock?: PlaybackClock; // 缺省自建,destroy 连删;注入只退订
  timeRange?: readonly [number, number]; // 锁定全局轴（epoch ms）
  speed?: number; // 倍率,传播到共享时钟
}): TrackFleetHandle;

interface TrackFleetHandle {
  readonly clock: PlaybackClock; // 构造即可用（成员创建时注入）
  add(player: TrackPlayerHandle): void;
  remove(player: TrackPlayerHandle): void;
  play(): void;
  pause(): void;
  stop(): void;
  seekFraction(fraction: number): void; // 全局轴归一化,越界钳制
  seekTime(ms: number): void; // clock 原始 elapsed 轴
  setSpeed(rate: number): void;
  on(event: "progress" | "arrive", listener: (payload: { fraction: number }) => void): () => void;
  destroy(): void; // 幂等;不代 destroy 成员
}
```

- `add` 校验（不通过一律 `INVALID_ARGUMENT`）：成员 `clock === fleet.clock`；成员 `mode` 与首个成员一致；成员未显式设置 `timeRange`；realtime fleet 要求成员带时间数据。
- **倍率设在 fleet 级**（`createTrackFleet({ speed })` 或 `fleet.setSpeed`）；成员**不传 `speed`**——injected 成员的 `speed` 是成员自身倍率，会与共享时钟倍率相乘，导致车辆先跑完而全局进度几乎不动。
- **时钟唯一驱动者是 fleet**：成员级 `play/pause/stop/seek/arrive 自动 paused` 全部只切自身投影跟随状态（个体冻结），不操作共享时钟；fleet 级控制对全体生效。
- 终点：条件 A（elapsed ≥ 轴总长）→ `clock.pause()` + `arrive { fraction: 1 }`；条件 B（全员边沿冻结且轴未走完）→ `clock.pause()`、无 arrive、进度停实际 fraction。
- `play()` 三态：`ended` 后调用 = seek 0 + 全员重播（解除含手动 pause 的全部冻结）；`autoFrozen` 后调用 = 仅恢复时钟（冻结成员保持冻结）；`seekFraction/seekTime` 清除终态标志，stopped 后从回看点继续而非全量重播。
- `stop()`：全员回起点 + 时钟归零 + 标志复位。
- 轴规则见[案例参考](/cases/track-playback)「多车同步」；realtime add/remove 后并集重算（显式 `timeRange` 锁定），uniform 首个 add 定格快照。
- `progress/arrive` 的 `fraction` 是**全局轴**归一化，与成员各自 `TrackProgress.fraction` 双轨、数值不同属设计使然。

## useTrackPlayer（框架适配）

```ts
// Vue 2.7+ / Vue 3：@ym/map-tools/vue3、@ym/map-tools/vue2
function useTrackPlayer(
  map: MapLike | Ref<MapLike | null>,
  options: TrackPlayerOptions,
): {
  player: Ref<TrackPlayerHandle | null>;
  status: Ref<TrackStatus>;
  progress: Ref<TrackProgress | null>;
  play(from?: number): void;
  pause(): void;
  stop(): void;
  seekFraction(fraction: number): void;
  seekTime(ms: number): void;
  setSpeed(rate: number): void;
};

// React 18+：@ym/map-tools/react（同名 Hook,map 接受实例或 MutableRefObject）
```

- map 接受实例或 Ref：非空才懒建 player，变 null 即销毁，换新 map 销毁重建（player 无状态复用，与 `useMap` 的 attach/detach 不同）。
- React 形态的 Ref 入参在**渲染时**读取 `ref.current`：异步 map 就绪后需伴随一次重渲染（如 `setState`）Hook 才会建 player；示例即按此写法。
- `options` 在创建时刻捕获，后续变化不重解析。
- 组件卸载自动 `destroy(player)`；`status/progress` 为响应式状态，可直接绑控制条 UI。
