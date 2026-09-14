/**
 * 轨迹回放（原生脚本 + @ym/map-tools/track 裸 API）。
 * 关键点：
 * 1. createTrackPlayer(map, options) 纯函数创建,play() 一行起播;
 * 2. on("progress") 驱动进度条与里程显示(节流 ~10Hz);
 * 3. 数据带 time → realtime 模式,speed 是倍率(示例 60×);
 * 4. dispose 顺序:player.destroy() 回收 marker/trail 资源,再移除地图。
 */
import { createTrackPlayer, type TrackPlayerHandle } from "@ym/map-tools/track";
import { createMinemapMapHandle } from "../shared/loadMinemap";
import {
  addButton,
  createControlBar,
  createStatusBar,
  styleHost,
  type ExampleRenderResult,
  type RenderOptions,
} from "../shared/demo";
import { TRACK_A, BUS_ICON, START_ICON, END_ICON } from "../shared/trackData";

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
  let seeking = false;
  slider.addEventListener("input", () => {
    seeking = true;
    player?.seekFraction(Number(slider.value) / 1000);
    seeking = false;
  });
  bar.appendChild(slider);

  let player: TrackPlayerHandle | null = null;
  const handle = createMinemapMapHandle(host, options.key);

  handle.ready
    .then((map) => {
      status.info("地图就绪，创建播放器…");
      player = createTrackPlayer(map, {
        points: TRACK_A.map((p) => ({ lng: p.lng, lat: p.lat, time: p.time })),
        icon: BUS_ICON,
        bearingCompensation: 0, // 示例图标朝上
        speed: 60,
        trail: { color: "#1F6BFE", width: 4 },
        startEndMarkers: true,
        startIcon: START_ICON,
        endIcon: END_ICON,
      });
      player.on("progress", (progress) => {
        if (!seeking) slider.value = String(Math.round(progress.fraction * 1000));
        status.info(
          `轨迹回放 ${player?.getStatus()} ｜ ${((progress.distanceMeters ?? 0) / 1000).toFixed(2)} km ｜ ${(progress.fraction * 100).toFixed(1)}%`,
        );
      });
      player.on("error", (payload) =>
        status.error(`数据告警 [${payload.code}] ${payload.message}`),
      );
      player.on("arrive", () => status.info("已到达终点（arrive → paused，solo 时钟已停）"));

      addButton(bar, "播放", () => player?.play());
      addButton(bar, "暂停", () => player?.pause());
      addButton(bar, "停止", () => {
        player?.stop();
        slider.value = "0";
      });
      addButton(bar, "慢", () => player?.setSpeed(20));
      addButton(bar, "正常", () => player?.setSpeed(60));
      addButton(bar, "快", () => player?.setSpeed(150));

      player.play(); // 默认自动起播
    })
    .catch((error: unknown) => {
      status.error(`初始化失败：${error instanceof Error ? error.message : String(error)}`);
    });

  return {
    ready: handle.ready.then(() => undefined),
    dispose: () => {
      player?.destroy(); // 回收车辆/起终点 marker 与 trail 图层资源
      handle.dispose();
      container.innerHTML = "";
    },
  };
}
