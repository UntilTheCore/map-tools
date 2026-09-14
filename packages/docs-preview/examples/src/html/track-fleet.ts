/**
 * 多车同步轨迹回放（原生脚本 + createTrackFleet）。
 * 关键点：
 * 1. createTrackFleet({ speed: 60 }) 自建共享时钟(60×),成员必须用 { clock: fleet.clock }
 *    创建后 add;成员不传 speed——injected 成员的 speed 是成员自身倍率,
 *    会与共享时钟倍率相乘(契约 1),导致车辆先跑完而全局进度几乎不动;
 * 2. 起播顺序:成员各自 play() 进入跟随态,fleet.play() 只驱动共享时钟;
 * 3. 短轨迹成员先到终点(arrive → 个体冻结),其余车辆继续,时钟不停(契约 14);
 *    全员冻结或轴走完 → 时钟自动停,后者 emit fleet arrive(契约 15);
 * 4. 清理顺序:先 fleet.remove(player) 再逐个 player.destroy(),最后 fleet.destroy()
 *    ——fleet 不代 destroy 成员、成员先销毁会留僵尸条目(契约 15-补 4;自建时钟连删,契约 9)。
 */
import { createTrackFleet, createTrackPlayer } from "@ym/map-tools/track";
import { createMinemapMapHandle } from "../shared/loadMinemap";
import {
  addButton,
  createControlBar,
  createStatusBar,
  styleHost,
  type ExampleRenderResult,
  type RenderOptions,
} from "../shared/demo";
import {
  TRACK_A,
  TRACK_B,
  TRACK_C,
  BUS_ICON,
  BUS_ICON_BLUE,
  BUS_ICON_GREEN,
} from "../shared/trackData";

export default function render(
  container: HTMLElement,
  options: RenderOptions,
): ExampleRenderResult {
  styleHost(container);
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;inset:0;";
  container.appendChild(host);
  const bar = createControlBar(container);
  const status = createStatusBar(container);
  status.info("SDK 加载中，创建 minemap.Map…");

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "1000";
  slider.value = "0";
  slider.style.cssText = "width:180px;align-self:center;";
  bar.appendChild(slider);

  const fleet = createTrackFleet({ speed: 60 }); // fleet 自建共享时钟(60×),倍率设在 fleet 级
  let players: ReturnType<typeof createTrackPlayer>[] = [];
  const manualFrozen = new Set<ReturnType<typeof createTrackPlayer>>();
  let seeking = false;
  slider.addEventListener("input", () => {
    seeking = true;
    fleet.seekFraction(Number(slider.value) / 1000);
    seeking = false;
  });

  const handle = createMinemapMapHandle(host, options.key);

  handle.ready
    .then((map) => {
      // 三车三图标三色:橙(真实素材)/蓝(真实素材)/绿(同风格 SVG),trail 颜色与车身一致
      const BUS_ICONS = [BUS_ICON, BUS_ICON_BLUE, BUS_ICON_GREEN];
      const TRAIL_COLORS = ["#E67E22", "#1F6BFE", "#0E9F6E"];
      players = [TRACK_A, TRACK_B, TRACK_C].map((track, index) => {
        const player = createTrackPlayer(map, {
          points: track.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
          icon: BUS_ICONS[index],
          bearingCompensation: 0,
          trail: { color: TRAIL_COLORS[index], width: 3 },
          clock: fleet.clock, // 成员必须挂 fleet 的共享时钟
          id: `bus-${index}`,
        });
        fleet.add(player);
        return player;
      });

      fleet.on("progress", ({ fraction }) => {
        if (!seeking) slider.value = String(Math.round(fraction * 1000));
        status.info(`三车同步回放 ｜ ${(fraction * 100).toFixed(1)}%`);
      });
      fleet.on("arrive", () => {
        slider.value = "1000";
        status.info("全队完成（fleet arrive → 时钟自动停，无 RAF 空转）");
      });

      addButton(bar, "播放", () => {
        // 手动冻结成员保持冻结(示范条件 B),其余成员重新进入跟随态后起时钟。
        players.forEach((player) => {
          if (!manualFrozen.has(player)) player.play();
        });
        fleet.play();
      });
      addButton(bar, "暂停", () => fleet.pause());
      addButton(bar, "停止", () => {
        manualFrozen.clear();
        fleet.stop();
        slider.value = "0";
      });
      addButton(bar, "冻结橙车", () => {
        if (players[0]) manualFrozen.add(players[0]);
        players[0]?.pause();
      });
      addButton(bar, "恢复橙车", () => {
        if (players[0]) manualFrozen.delete(players[0]);
        players[0]?.play();
      });

      // 起播顺序:成员先各自进入 following,stopped 成员 play() 从 0 起播;
      // fleet.play() 仅驱动时钟。
      players.forEach((player) => player.play());
      fleet.play();
    })
    .catch((error: unknown) => {
      status.error(`初始化失败：${error instanceof Error ? error.message : String(error)}`);
    });

  return {
    ready: handle.ready.then(() => undefined),
    dispose: () => {
      players.forEach((player) => fleet.remove(player)); // 先退队
      players.forEach((player) => player.destroy()); // 再销毁(契约 15-补 4 顺序)
      fleet.destroy(); // 自建时钟连删(契约 9),无需再 destroy 显式 clock
      handle.dispose();
      container.innerHTML = "";
    },
  };
}
