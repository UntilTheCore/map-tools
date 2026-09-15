# 轨迹回放

`@ym/map-tools` 自 v3.2.0 起内置轨迹回放能力：把「GPS 采点 → 地图上的车辆沿轨迹连续运动」沉淀为框架无关的 `createTrackPlayer`，多车同步由 `createTrackFleet` 编排，Vue/React 侧提供 `useTrackPlayer` 组合式封装。库只负责**几何投影 + 时钟 + marker/线图层管理**，数据由调用方喂入（库不发请求）。

## 最小示例

```ts
import { createTrackPlayer } from "@ym/map-tools";

// points: [{ lng, lat, time? }]，time 为 epoch 毫秒（number 一律按毫秒解释）
const player = createTrackPlayer(map, {
  points: trajectory,
  icon: "/bus.png", // 默认图标朝下的素材可不传 bearingCompensation（默认 180）
});
player.play(); // 一行起播；到达终点自动停钟（RAF 不空转）
```

## 入口与导入路径

| 场景                          | 导入路径                                   | 能力                                                             |
| ----------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| 框架无关（含 UMD `FE_utils`） | `@ym/map-tools` 或 `@ym/map-tools/track`   | `createTrackPlayer` / `createPlaybackClock` / `createTrackFleet` |
| Vue 3 / Vue 2.7               | `@ym/map-tools/vue3`、`@ym/map-tools/vue2` | `useTrackPlayer`（`MapLike \| Ref` 懒建/销毁重建）               |
| React 18+                     | `@ym/map-tools/react`                      | `useTrackPlayer`（Hook 形态，同上）                              |

fleet 是纯编排器（无 DOM/框架耦合），不进适配层，任何框架下直接用 core API。

## 工作原理

1. **归一化**（构造期）：坐标校验、连续重合点合并、时间戳钳制为单调不减（几何不重排序）、生成**前缀里程数组**。
2. **投影**（每帧）：`elapsed × 倍率 → 里程 → 二分前缀里程 → 段内线性插值` 得到坐标与朝向。没有预切分 chunk、没有深拷贝，seek/重播 = 改一个数值游标。
3. **时钟**：单 `requestAnimationFrame` 产出单调累计 `elapsed`，位移只与**时间**相关、与帧率无关（60Hz/144Hz/掉帧均不失真）。
4. **渲染**：`marker.setLngLat` + `setRotation`（`rotationAlignment: "map"`，零私有 API hack）；可选 trail 线（已走过轨迹）独立节流重绘。

## 两种回放模式

- **realtime（默认，数据带 `time`）**：时间轴就是 GPS 时间戳。`speed` 是倍率（`1` = 真实时间，演示用 `60`/`120` 等）。采样点稀疏/停站的区间表现为「车辆停车等待」——这是真实速度曲线的自然还原。
- **uniform（无时间数据，或显式 `mode: "uniform"`）**：按几何等速推进，基准地速 `referenceSpeed`（m/s，默认 38.9 ≈ 140 km/h），`speed` 仍是倍率。轴总长 = 总里程 / referenceSpeed，**与倍率无关**——调速瞬间进度条不跳变。位置稳定的 seek 请用 `seekFraction`（`seekTime` 在 uniform 下随倍率漂移，这是轴定义的自然推论）。

## 单车控制

```ts
player.play(); // 恢复/起播；终点再调用自动从头重播（仅 solo）
player.play(0.5); // 从 50% 处起播（from 为 fraction 0–1，仅 solo 生效）
player.pause();
player.stop(); // 车回起点，状态 stopped
player.seekFraction(0.3); // 跳转 30%（越界自动钳制到 [0,1]）
player.setSpeed(4); // 倍率
player.on("progress", (p) => `${p.fraction} ${p.distanceMeters}`); // ~10Hz
player.on("arrive", (p) => "到达终点");
```

事件 payload：`progress`/`arrive` 为 `TrackProgress` 完整快照，`status` 为 `{ status }`，`error` 为 `{ code, message }`。

- **到达终点自动 paused**：solo（自建时钟）下同时停时钟，**RAF 不空转**；恢复播放再 `play()` 即从头重播。
- **构造期数据告警**：`error` 事件 `code: "NON_MONOTONIC_TIME"`（时间戳非单调被钳制，几何保序）。告警在**首个 `on("error")` 订阅时补投**，无论订阅发生在 `play()` 之前还是之后；`destroy()` 前无人订阅则丢弃。
- **`SDK_UNAVAILABLE`**：仅「使用默认 marker 工厂（未注入 `createMarker`）且 `globalThis.minemap` 未加载」时构造期抛出。注入 `createMarker` 时库完全不触碰全局 SDK——React/无 minemap 环境或要深度定制车辆节点时使用。

## 多车同步（fleet）

多车共享**一个时钟、一条时间轴**。`createTrackFleet()` 构造后即可通过 `fleet.clock` 取到共享时钟，成员用 `{ clock: fleet.clock }` 创建。**倍率设在 fleet 级**（`createTrackFleet({ speed })`），成员不传 `speed`——injected 成员的 `speed` 是成员自身倍率，会与共享时钟倍率相乘，导致车辆先跑完而全局进度几乎不动：

```ts
const fleet = createTrackFleet({ speed: 60 }); // 倍率设 fleet 级;成员不传 speed
const p1 = createTrackPlayer(map, { points: trackA, clock: fleet.clock });
const p2 = createTrackPlayer(map, { points: trackB, clock: fleet.clock });
fleet.add(p1);
fleet.add(p2);

p1.play();
p2.play(); // 成员先各自进入「跟随」态
fleet.play(); // fleet 驱动共享时钟
```

行为规则：

- **成员级控制 = 个体冻结，fleet 级控制 = 全局**。成员 `pause()` 只让那辆车停在原地，其余继续；短轨迹成员先 `arrive` 也只会自己冻结，时钟继续走。
- **时钟自动停**：时间轴走完 → `fleet.on("arrive")`（`{ fraction: 1 }`）+ 时钟停；全员提前冻结 → 时钟同样停但**不发 arrive**（进度条停在实际位置）。恢复播放的唯一途径是 `fleet.play()`——已冻结成员保持冻结（继续各自的「个体冻结」语义）。
- **回看**：fleet 停止后 `fleet.seekFraction(0.5)` 再 `fleet.play()`，从 50% 继续而不是从头重播（seek 会清除终态标志）。
- **轴对齐**：realtime 下轴 = 成员时间戳并集（add/remove 后重算；要固定轴显式传 `timeRange`），成员在无数据区间自动停车等待；uniform 下轴长 = 最长成员轨迹总时长，**首个成员 add 时定格**，之后 add/remove 不重算（防进度跳变）。成员 `mode` 必须一致；成员自带 `timeRange` 或用了别的 clock，`add` 直接抛 `INVALID_ARGUMENT`。
- **清理链（必须按序）**：先 `fleet.remove(player)` 再 `player.destroy()`，最后 `fleet.destroy()`。fleet 不会探测成员是否被外部销毁，跳序会留下状态表僵尸条目。

## 进度与时间语义

- `player.getProgress()` / `on("progress")`：`fraction`（**各自轨迹**归一化）、`distanceMeters`、`coordinate`，以及 `timeMs`——realtime 为全局轴时刻（epoch ms），uniform 为 elapsed（ms，**不是**墙钟，勿按「当前时间」消费）。
- `fleet.on("progress")` 的 `fraction` 是**全局时间轴**归一化，与成员各自的 fraction 数值不同，属设计使然（双轨语义）。

## 样式与资源

- `trail: { color, width }`：已走过轨迹渐显线（重绘节流 2–5Hz 或位移 >20m 先到为准）。
- `startEndMarkers: true` + `startIcon/endIcon`：起终点 marker。
- `stations`：站点圆点。
- `id`：资源命名空间（多实例并存时必须传，trail 的 source/layer id 按 `track-{id}-trail-*` 生成）。
- 所有库创建的 marker/图层在 `player.destroy()` 时一并回收；`destroy()` 幂等，可在框架卸载钩子里放心调。

## 示例实验室

- 「轨迹回放 → 轨迹回放」：单车完整控制条（Vue 3 / Vue 2.7 / React / 原生四变体，内嵌重庆公交风格数据）。
- 「轨迹回放 → 多车同步回放」：三车共享时间轴、个体冻结按钮、fleet arrive。
